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

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    const mimeType = file.type || ''

    if (!allowedTypes.includes(mimeType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type de fichier non autorisé. Types acceptés: JPEG, PNG, GIF, WebP, SVG'
      })
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Fichier trop volumineux. Taille maximum: 5MB'
      })
    }

    // Déterminer l'extension
    const extensions: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg'
    }
    const ext = extensions[mimeType] || '.jpg'

    // Générer un nom de fichier unique
    const filename = `${randomUUID()}${ext}`

    // Déterminer le répertoire uploads selon l'environnement
    // En production (Docker), utiliser /app/uploads qui sera monté comme volume
    // En développement, utiliser public/uploads
    const isProduction = process.env.NODE_ENV === 'production'
    const uploadsDir = isProduction
      ? '/app/uploads'
      : join(process.cwd(), 'public', 'uploads')

    // Créer le répertoire uploads s'il n'existe pas
    if (!existsSync(uploadsDir)) {
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (mkdirError) {
        console.error('Erreur création répertoire uploads:', mkdirError)
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

    // Retourner l'URL publique
    const url = `/uploads/${filename}`

    return {
      success: true,
      url,
      filename
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    if (err.statusCode) {
      throw error
    }
    console.error('Erreur upload:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors du téléversement du fichier'
    })
  }
})
