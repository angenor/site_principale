// Limites des pièces jointes d'un signalement, communes au formulaire et à l'API

export const REPORT_ATTACHMENT_LIMITS = {
  maxFiles: 10,
  maxLinks: 10,
  // 20 Mo par fichier, 45 Mo au total (Nginx accepte 50 Mo par requête)
  maxFileSize: 20 * 1024 * 1024,
  maxTotalSize: 45 * 1024 * 1024,
  maxUrlLength: 2000
}

// Extensions acceptées (les SVG et HTML sont exclus : ils peuvent contenir du script)
export const REPORT_ATTACHMENT_EXTENSIONS: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.rtf': 'application/rtf',
  '.txt': 'text/plain',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  '.csv': 'text/csv',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed'
}

export function getReportAttachmentExtension(filename: string): string | null {
  const match = /\.[a-z0-9]+$/i.exec(filename)
  const ext = match ? match[0].toLowerCase() : ''
  return ext in REPORT_ATTACHMENT_EXTENSIONS ? ext : null
}

export function isValidReportLink(value: string): boolean {
  if (value.length > REPORT_ATTACHMENT_LIMITS.maxUrlLength) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
