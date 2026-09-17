// Utilitaires partagés des ressources (rapports multilingues et audios/vidéos)
import { parseVideoUrl } from './editorjs'

/** Version linguistique d'un rapport : fichier téléversé ou lien externe */
export interface ResourceFileVersion {
  id?: string
  languageCode: string
  languageLabel: string
  fileUrl: string | null
  filename: string | null
  mimeType: string | null
  fileSize: number | null
  externalUrl: string | null
}

/** Version en cours d'édition dans l'administration */
export interface EditableResourceFile extends ResourceFileVersion {
  /** Clé locale de la ligne */
  key: string
  source: 'file' | 'link'
}

function newEditableKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEditableResourceFile(languageCode = '', languageLabel = ''): EditableResourceFile {
  return {
    key: newEditableKey(),
    source: 'file',
    languageCode,
    languageLabel,
    fileUrl: null,
    filename: null,
    mimeType: null,
    fileSize: null,
    externalUrl: null
  }
}

/** Versions reçues de l'API, prêtes à être éditées */
export function toEditableResourceFiles(files: ResourceFileVersion[]): EditableResourceFile[] {
  return files.map(file => ({
    ...file,
    key: file.id || newEditableKey(),
    source: file.externalUrl ? 'link' : 'file'
  }))
}

/** Versions à envoyer à l'API : seule la source choisie est conservée */
export function toResourceFilesPayload(files: EditableResourceFile[]) {
  return files.map(file => ({
    languageCode: file.languageCode.trim().toUpperCase(),
    languageLabel: file.languageLabel.trim(),
    ...(file.source === 'link'
      ? { externalUrl: file.externalUrl?.trim() || '', fileUrl: null, filename: null, mimeType: null, fileSize: null }
      : { externalUrl: null, fileUrl: file.fileUrl, filename: file.filename, mimeType: file.mimeType, fileSize: file.fileSize })
  }))
}

/** Première anomalie bloquante des versions saisies, ou null */
export function validateResourceFiles(files: EditableResourceFile[]): string | null {
  if (files.length === 0) return 'Ajoutez au moins un document à télécharger'
  const seen = new Set<string>()
  for (const file of files) {
    const code = file.languageCode.trim().toUpperCase()
    if (!code || !file.languageLabel.trim()) return 'Indiquez la langue de chaque document'
    if (seen.has(code)) return `La langue ${code} est présente plusieurs fois`
    seen.add(code)
    if (file.source === 'link' && !file.externalUrl?.trim()) return `Indiquez le lien externe de la version ${code}`
    if (file.source === 'file' && !file.fileUrl) return `Téléversez le fichier de la version ${code}`
  }
  return null
}

/** Langues proposées par défaut ; d'autres peuvent être saisies librement */
export const RESOURCE_LANGUAGES = [
  { code: 'MG', label: 'Malgache' },
  { code: 'FR', label: 'Français' },
  { code: 'EN', label: 'English' }
] as const

export type AudioVideoFormat = 'VIDEO' | 'AUDIO'

/** Audio/vidéo tel qu'affiché dans la rubrique Ressources */
export interface AudioVideoSummary {
  id: string
  title: string
  description: string
  format: AudioVideoFormat
  speakers: string[]
  externalUrl: string
  coverImage: string | null
  publishedAt: string | null
  category: { id: string; name: string; slug?: string; color: string | null; icon: string | null } | null
}

export const AUDIO_VIDEO_FORMATS: { value: AudioVideoFormat; label: string; icon: string }[] = [
  { value: 'VIDEO', label: 'Vidéo', icon: 'video' },
  { value: 'AUDIO', label: 'Audio', icon: 'headphones' }
]

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return ''
  const k = 1024
  const sizes = ['o', 'Ko', 'Mo', 'Go']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1)).toLocaleString('fr-FR')} ${sizes[i]}`
}

export function getFileIcon(mimeType: string | null | undefined): string {
  if (!mimeType) return 'file'
  if (mimeType.includes('pdf')) return 'file-pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint'
  if (mimeType.includes('image')) return 'image'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'file-zipper'
  return 'file'
}

/** Extension courte affichée à côté d'un fichier (PDF, DOCX...) */
export function getFileExtension(filename: string | null | undefined): string {
  const match = filename?.match(/\.([a-z0-9]{1,5})$/i)
  return match ? match[1]!.toUpperCase() : ''
}

/** Nom de domaine lisible d'un lien externe (ex. « youtube.com ») */
export function getUrlHost(url: string | null | undefined): string {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** Miniature d'une vidéo YouTube, ou null si le lien n'est pas une vidéo YouTube */
export function getYoutubeThumbnail(url: string): string | null {
  const video = parseVideoUrl(url)
  if (video?.service !== 'youtube') return null
  const id = video.embed.match(/\/embed\/([\w-]+)/)?.[1]
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
