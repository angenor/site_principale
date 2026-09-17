// Utilitaires partagés pour les ressources (rapports et audios/vidéos)
import prisma from './prisma'

export interface ResourceFileInput {
  languageCode: string
  languageLabel: string
  fileUrl: string | null
  filename: string | null
  mimeType: string | null
  fileSize: number | null
  externalUrl: string | null
}

export interface ResourceFileOutput extends ResourceFileInput {
  id: string
}

interface ResourceFileRow extends ResourceFileInput {
  id: string
}

interface LegacyResourceFile {
  id: string
  fileUrl: string | null
  filename: string | null
  mimeType: string | null
  fileSize: number | null
  files?: ResourceFileRow[]
}

const LANGUAGE_CODE_RE = /^[A-Z]{2,8}$/

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function trimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Valide les versions linguistiques d'un rapport reçues du client.
 * Chaque version porte une langue et, au choix, un fichier téléversé ou un lien externe.
 */
export function normalizeResourceFiles(value: unknown): ResourceFileInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    badRequest('Ajoutez au moins un document à télécharger')
  }

  const seen = new Set<string>()
  return value.map((raw: Record<string, unknown>) => {
    const languageCode = trimmed(raw?.languageCode).toUpperCase()
    const languageLabel = trimmed(raw?.languageLabel)
    if (!LANGUAGE_CODE_RE.test(languageCode)) {
      badRequest(`Code de langue invalide : « ${languageCode || '(vide)'} » (2 à 8 lettres)`)
    }
    if (!languageLabel) {
      badRequest(`Le nom de la langue ${languageCode} est requis`)
    }
    if (seen.has(languageCode)) {
      badRequest(`La langue ${languageCode} est présente plusieurs fois`)
    }
    seen.add(languageCode)

    const externalUrl = trimmed(raw?.externalUrl)
    if (externalUrl) {
      if (!isHttpUrl(externalUrl)) {
        badRequest(`Lien externe invalide pour la version ${languageCode}`)
      }
      return {
        languageCode,
        languageLabel,
        fileUrl: null,
        filename: null,
        mimeType: null,
        fileSize: null,
        externalUrl
      }
    }

    const fileUrl = trimmed(raw?.fileUrl)
    const filename = trimmed(raw?.filename)
    if (!fileUrl || !filename) {
      badRequest(`Téléversez un fichier ou indiquez un lien externe pour la version ${languageCode}`)
    }
    if (!fileUrl.startsWith('/uploads/') && !isHttpUrl(fileUrl)) {
      badRequest(`Fichier invalide pour la version ${languageCode}`)
    }
    return {
      languageCode,
      languageLabel,
      fileUrl,
      filename,
      mimeType: trimmed(raw?.mimeType) || 'application/octet-stream',
      fileSize: typeof raw?.fileSize === 'number' && raw.fileSize >= 0 ? Math.round(raw.fileSize) : null,
      externalUrl: null
    }
  })
}

/** Données Prisma de création des versions, dans l'ordre saisi */
export function resourceFilesCreateData(files: ResourceFileInput[]) {
  return files.map((file, index) => ({ ...file, sortOrder: index }))
}

/** Sélection Prisma des versions linguistiques, dans l'ordre saisi */
export const resourceFilesSelect = {
  orderBy: { sortOrder: 'asc' as const },
  select: {
    id: true,
    languageCode: true,
    languageLabel: true,
    fileUrl: true,
    filename: true,
    mimeType: true,
    fileSize: true,
    externalUrl: true
  }
}

/**
 * Versions linguistiques d'un rapport. Les rapports créés avant cette fonctionnalité
 * n'ont qu'un fichier sur la ressource elle-même : il est présenté comme version française.
 */
export function resourceFilesOf(resource: LegacyResourceFile): ResourceFileOutput[] {
  if (resource.files && resource.files.length > 0) {
    return resource.files
  }
  if (!resource.fileUrl) return []
  return [{
    id: `legacy-${resource.id}`,
    languageCode: 'FR',
    languageLabel: 'Français',
    fileUrl: resource.fileUrl,
    filename: resource.filename,
    mimeType: resource.mimeType,
    fileSize: resource.fileSize,
    externalUrl: null
  }]
}

/** Champs de l'ancien fichier unique, nécessaires à `resourceFilesOf` */
export const legacyFileSelect = {
  fileUrl: true,
  filename: true,
  mimeType: true,
  fileSize: true
}

// ============================================================================
// AUDIOS / VIDÉOS
// ============================================================================

export type AudioVideoFormatValue = 'VIDEO' | 'AUDIO'

export function parseAudioVideoFormat(value: unknown): AudioVideoFormatValue {
  if (value === 'VIDEO' || value === 'AUDIO') return value
  badRequest('Format invalide (audio ou vidéo)')
}

/** Lien externe obligatoire vers le site source */
export function parseAudioVideoUrl(value: unknown): string {
  const url = trimmed(value)
  if (!url) badRequest('Le lien vers le contenu est requis')
  if (!isHttpUrl(url)) badRequest('Le lien vers le contenu doit commencer par http:// ou https://')
  return url
}

/** Texte obligatoire, renvoyé sans espaces superflus */
export function requiredText(value: unknown, fieldLabel: string): string {
  const text = trimmed(value)
  if (!text) badRequest(`${fieldLabel} est requis`)
  return text
}

/** Catégorie d'audio/vidéo existante, obligatoire */
export async function requireAudioVideoCategory(value: unknown): Promise<string> {
  const categoryId = trimmed(value)
  if (!categoryId) badRequest('La catégorie est requise')
  const category = await prisma.audioVideoCategory.findUnique({ where: { id: categoryId }, select: { id: true } })
  if (!category) badRequest('Catégorie introuvable')
  return categoryId
}

/** Sélection Prisma commune aux listes d'audios/vidéos */
export const audioVideoCategorySelect = {
  select: { id: true, name: true, slug: true, icon: true, color: true }
}
