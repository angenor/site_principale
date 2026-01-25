import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import sharp from 'sharp'
import { requireAuth } from '../../utils/auth'

// Configuration des variantes d'image
const IMAGE_VARIANTS = {
  thumb: { width: 400, quality: 60 },    // Miniatures (listes, cartes)
  medium: { width: 800, quality: 75 },   // Taille moyenne
  original: { width: 1920, quality: 85 } // Grande taille (pages détail)
}

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  await requireAuth(event)

  // Vérifier si on doit générer les variantes (paramètre query)
  const query = getQuery(event)
  const generateVariants = query.variants === 'true'

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

    // Générer un identifiant unique pour ce fichier
    const fileId = randomUUID()

    // Déterminer le répertoire uploads selon l'environnement
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

    // Déterminer l'extension selon le type
    const extensions: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg'
    }
    const ext = extensions[mimeType] || '.jpg'

    // MODE SANS VARIANTES : sauvegarde simple (pour icônes, petites images)
    if (!generateVariants) {
      const filename = `${fileId}${ext}`
      const filepath = join(uploadsDir, filename)

      try {
        await writeFile(filepath, file.data)
      } catch (writeError) {
        console.error('Erreur écriture fichier:', writeError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Impossible d\'écrire le fichier'
        })
      }

      const url = `/uploads/${filename}`
      return {
        success: true,
        url,
        filename
      }
    }

    // MODE AVEC VARIANTES : génération de thumb, medium, original

    // Pour les SVG et GIF animés, on ne peut pas les traiter avec Sharp
    // On les sauvegarde directement
    if (mimeType === 'image/svg+xml' || mimeType === 'image/gif') {
      const filename = `${fileId}${ext}`
      const filepath = join(uploadsDir, filename)

      try {
        await writeFile(filepath, file.data)
      } catch (writeError) {
        console.error('Erreur écriture fichier:', writeError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Impossible d\'écrire le fichier'
        })
      }

      const url = `/uploads/${filename}`
      return {
        success: true,
        url,
        thumb: url,
        medium: url,
        filename
      }
    }

    // Traiter l'image avec Sharp et générer les variantes
    const variants: Record<string, string> = {}

    try {
      // Charger l'image une seule fois
      const image = sharp(file.data)
      const metadata = await image.metadata()

      // Générer chaque variante
      for (const [variantName, config] of Object.entries(IMAGE_VARIANTS)) {
        const filename = `${fileId}-${variantName}.webp`
        const filepath = join(uploadsDir, filename)

        // Ne pas agrandir les images plus petites que la variante
        const shouldResize = metadata.width && metadata.width > config.width

        let pipeline = sharp(file.data)

        if (shouldResize) {
          pipeline = pipeline.resize(config.width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
        }

        await pipeline
          .webp({ quality: config.quality })
          .toFile(filepath)

        variants[variantName] = `/uploads/${filename}`
      }
    } catch (sharpError) {
      console.error('Erreur Sharp:', sharpError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors du traitement de l\'image'
      })
    }

    // Retourner les URLs des variantes
    // url = original (pour rétrocompatibilité)
    // thumb = miniature
    // medium = taille moyenne
    return {
      success: true,
      url: variants.original,
      thumb: variants.thumb,
      medium: variants.medium,
      filename: `${fileId}-original.webp`
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
