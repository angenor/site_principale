import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  await requireAuth(event)

  try {
    // Lire le fichier uploadé via multipart/form-data
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Aucun fichier fourni'
      })
    }

    const file = formData.find(f => f.name === 'file')

    if (!file || !file.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Fichier invalide'
      })
    }

    // Types de fichiers autorisés pour les documents
    const allowedTypes: Record<string, string> = {
      // Documents
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'application/vnd.ms-powerpoint': '.ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
      // Texte
      'text/plain': '.txt',
      'text/csv': '.csv',
      // Archives
      'application/zip': '.zip',
      'application/x-rar-compressed': '.rar',
      'application/x-7z-compressed': '.7z',
      // Images (pour flexibilité)
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg'
    }

    const mimeType = file.type || ''

    if (!allowedTypes[mimeType]) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type de fichier non autorisé. Types acceptés: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR, 7Z, images'
      })
    }

    // Vérifier la taille (max 20MB pour les documents)
    const maxSize = 20 * 1024 * 1024
    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Fichier trop volumineux. Taille maximum: 20MB'
      })
    }

    // Déterminer l'extension
    const ext = allowedTypes[mimeType]

    // Générer un nom de fichier unique tout en gardant une indication du nom original
    const originalName = file.filename || 'document'
    const safeName = originalName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 50)
    const filename = `${randomUUID()}_${safeName}${ext}`

    // Déterminer le répertoire uploads selon l'environnement
    const isProduction = process.env.NODE_ENV === 'production'
    const uploadsDir = isProduction
      ? '/app/uploads/documents'
      : join(process.cwd(), 'public', 'uploads', 'documents')

    // Créer le répertoire uploads s'il n'existe pas
    if (!existsSync(uploadsDir)) {
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (mkdirError) {
        console.error('Erreur création répertoire uploads/documents:', mkdirError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Impossible de créer le répertoire de téléversement'
        })
      }
    }

    // Sauvegarder le fichier
    const filepath = join(uploadsDir, filename)
    try {
      await writeFile(filepath, file.data)
    } catch (writeError) {
      console.error('Erreur écriture fichier:', writeError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Impossible d\'écrire le fichier. Vérifiez les permissions du répertoire uploads.'
      })
    }

    // Retourner les informations du fichier
    const url = `/uploads/documents/${filename}`

    return {
      success: true,
      url,
      filename,
      originalName: file.filename || 'document',
      mimeType,
      fileSize: file.data.length
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    if (err.statusCode) {
      throw error
    }
    console.error('Erreur upload document:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors du téléversement du fichier'
    })
  }
})
