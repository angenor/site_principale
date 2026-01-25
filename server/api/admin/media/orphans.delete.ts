import { requireAuth } from '../../../utils/auth'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)
  const { filenames } = body as { filenames: string[] }

  if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Liste de fichiers requise'
    })
  }

  // Déterminer le répertoire uploads selon l'environnement
  const isProduction = process.env.NODE_ENV === 'production'
  const uploadsDir = isProduction
    ? '/app/uploads'
    : join(process.cwd(), 'public', 'uploads')

  const results = {
    deleted: [] as string[],
    failed: [] as { filename: string; error: string }[]
  }

  for (const filename of filenames) {
    // Sécurité : vérifier que le nom de fichier ne contient pas de chemin
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      results.failed.push({
        filename,
        error: 'Nom de fichier invalide'
      })
      continue
    }

    const filepath = join(uploadsDir, filename)

    if (!existsSync(filepath)) {
      results.failed.push({
        filename,
        error: 'Fichier non trouvé'
      })
      continue
    }

    try {
      await unlink(filepath)
      results.deleted.push(filename)
    } catch (error) {
      console.error(`Erreur suppression ${filename}:`, error)
      results.failed.push({
        filename,
        error: 'Erreur lors de la suppression'
      })
    }
  }

  return {
    success: true,
    data: results
  }
})
