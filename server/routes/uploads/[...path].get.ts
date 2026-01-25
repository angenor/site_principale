import { createReadStream, existsSync } from 'fs'
import { stat } from 'fs/promises'
import { join, extname } from 'path'
import { sendStream, setHeader, createError } from 'h3'

// MIME types mapping
const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
}

export default defineEventHandler(async (event) => {
  const path = event.context.params?.path

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chemin de fichier manquant'
    })
  }

  // Prevent directory traversal attacks
  if (path.includes('..') || path.includes('//')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chemin invalide'
    })
  }

  // Determine the uploads directory based on environment
  const isProduction = process.env.NODE_ENV === 'production'
  const uploadsDir = isProduction
    ? '/app/uploads'
    : join(process.cwd(), 'public', 'uploads')

  const filePath = join(uploadsDir, path)

  // Check if file exists
  if (!existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Fichier non trouvé'
    })
  }

  try {
    // Get file stats
    const stats = await stat(filePath)

    if (!stats.isFile()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'N\'est pas un fichier'
      })
    }

    // Determine content type
    const ext = extname(filePath).toLowerCase()
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    // Set headers
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Content-Length', stats.size)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // Cache for 1 year

    // Stream the file
    const stream = createReadStream(filePath)
    return sendStream(event, stream)
  } catch (error) {
    console.error('Erreur lecture fichier:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la lecture du fichier'
    })
  }
})
