import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import prisma from '../utils/prisma'
import { deleteReportAttachmentFiles, getReportAttachmentsDir } from '../utils/reports'

interface ContactBody {
  name?: string | null
  email?: string | null
  phone?: string | null
  subject?: string
  categoryId?: string | null
  message: string
  isAnonymous?: boolean
  links?: string[]
}

interface UploadedFile {
  filename: string
  data: Buffer
}

// Limite simple anti-abus : nombre de signalements par adresse IP sur une fenêtre glissante
const RATE_LIMIT_WINDOW = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const recentSubmissions = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (recentSubmissions.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW)
  if (timestamps.length >= RATE_LIMIT_MAX) {
    recentSubmissions.set(ip, timestamps)
    return true
  }
  timestamps.push(now)
  recentSubmissions.set(ip, timestamps)
  // Nettoyage des adresses inactives
  if (recentSubmissions.size > 5000) {
    for (const [key, list] of recentSubmissions) {
      if (!list.some(t => now - t < RATE_LIMIT_WINDOW)) recentSubmissions.delete(key)
    }
  }
  return false
}

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

// Le formulaire envoie un multipart/form-data : un champ « data » (JSON) et des champs « files »
async function readSubmission(event: Parameters<typeof readBody>[0]) {
  const contentType = getHeader(event, 'content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return { body: await readBody<ContactBody>(event), files: [] as UploadedFile[] }
  }

  const parts = await readMultipartFormData(event) || []
  const dataPart = parts.find(part => part.name === 'data')
  let body: ContactBody
  try {
    body = JSON.parse(dataPart?.data.toString('utf8') || '')
  } catch {
    badRequest('Données du formulaire invalides')
  }

  const files = parts
    .filter(part => part.name === 'files' && part.filename)
    .map(part => ({ filename: part.filename!, data: part.data }))

  return { body, files }
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.substring(0, maxLength) : null
}

export default defineEventHandler(async (event) => {
  const { body, files } = await readSubmission(event)

  // Validation des champs requis
  if (!body || typeof body.message !== 'string' || !body.message.trim()) {
    badRequest('La catégorie et le message sont requis')
  }

  // Catégorie : on conserve son nom au moment du signalement
  let subject = cleanText(body.subject, 200)
  let categoryId: string | null = null
  if (body.categoryId) {
    const category = await prisma.reportCategory.findUnique({ where: { id: body.categoryId } })
    if (!category) {
      badRequest('Catégorie de signalement inconnue')
    }
    categoryId = category.id
    subject = category.name
  }
  if (!subject) {
    badRequest('La catégorie et le message sont requis')
  }

  const isAnonymous = body.isAnonymous === true
  const email = isAnonymous ? null : cleanText(body.email, 200)

  // Validation de l'email si fourni
  if (email && !isValidEmail(email)) {
    badRequest('Adresse email invalide')
  }

  // Validation des liens
  const links = Array.isArray(body.links)
    ? body.links.filter((link): link is string => typeof link === 'string').map(link => link.trim()).filter(Boolean)
    : []
  if (links.length > REPORT_ATTACHMENT_LIMITS.maxLinks) {
    badRequest(`Vous pouvez ajouter au maximum ${REPORT_ATTACHMENT_LIMITS.maxLinks} liens`)
  }
  const invalidLink = links.find(link => !isValidReportLink(link))
  if (invalidLink) {
    badRequest(`Lien invalide : ${invalidLink.substring(0, 100)}. Il doit commencer par http:// ou https://`)
  }

  // Validation des fichiers
  if (files.length > REPORT_ATTACHMENT_LIMITS.maxFiles) {
    badRequest(`Vous pouvez joindre au maximum ${REPORT_ATTACHMENT_LIMITS.maxFiles} fichiers`)
  }
  let totalSize = 0
  const preparedFiles = files.map((file) => {
    const ext = getReportAttachmentExtension(file.filename)
    if (!ext) {
      badRequest(`Type de fichier non autorisé : ${file.filename}`)
    }
    if (file.data.length === 0) {
      badRequest(`Le fichier ${file.filename} est vide`)
    }
    if (file.data.length > REPORT_ATTACHMENT_LIMITS.maxFileSize) {
      badRequest(`Le fichier ${file.filename} dépasse la taille maximale autorisée`)
    }
    totalSize += file.data.length
    return { ...file, ext, storedName: `${randomUUID()}${ext}` }
  })
  if (totalSize > REPORT_ATTACHMENT_LIMITS.maxTotalSize) {
    badRequest('La taille totale des pièces jointes dépasse la limite autorisée')
  }

  // Récupérer l'adresse IP (pour le suivi)
  const ipAddress = getRequestIP(event, { xForwardedFor: true })

  if (ipAddress && isRateLimited(ipAddress)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Trop de signalements envoyés en peu de temps. Veuillez réessayer dans quelques minutes.'
    })
  }

  // Écriture des fichiers dans le dossier privé (jamais servi publiquement)
  const attachmentsDir = getReportAttachmentsDir()
  const writtenFiles: string[] = []
  try {
    if (preparedFiles.length) {
      await mkdir(attachmentsDir, { recursive: true })
    }
    for (const file of preparedFiles) {
      await writeFile(join(attachmentsDir, file.storedName), file.data)
      writtenFiles.push(file.storedName)
    }

    // Créer le signalement
    const contact = await prisma.contact.create({
      data: {
        name: isAnonymous ? null : cleanText(body.name, 200),
        email,
        phone: isAnonymous ? null : cleanText(body.phone, 50),
        subject,
        categoryId,
        message: body.message.trim(),
        isAnonymous,
        ipAddress: ipAddress || null,
        status: 'NEW',
        attachments: {
          create: [
            ...preparedFiles.map((file, index) => ({
              kind: 'FILE' as const,
              filename: file.filename.substring(0, 255),
              filepath: file.storedName,
              mimeType: REPORT_ATTACHMENT_EXTENSIONS[file.ext],
              fileSize: file.data.length,
              sortOrder: index
            })),
            ...links.map((url, index) => ({
              kind: 'LINK' as const,
              url,
              sortOrder: preparedFiles.length + index
            }))
          ]
        }
      }
    })

    return {
      success: true,
      message: 'Votre signalement a été envoyé avec succès',
      id: contact.id
    }
  } catch (error) {
    await deleteReportAttachmentFiles(writtenFiles)
    console.error('Erreur enregistrement signalement:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible d\'enregistrer le signalement. Veuillez réessayer.'
    })
  }
})

// Fonction utilitaire pour valider l'email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
