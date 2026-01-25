import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  try {
    // Déterminer le répertoire uploads selon l'environnement
    const isProduction = process.env.NODE_ENV === 'production'
    const uploadsDir = isProduction
      ? '/app/uploads'
      : join(process.cwd(), 'public', 'uploads')

    if (!existsSync(uploadsDir)) {
      return {
        success: true,
        data: {
          total: 0,
          used: 0,
          orphans: [],
          totalSize: 0,
          orphanSize: 0
        }
      }
    }

    // Lire tous les fichiers dans le répertoire uploads
    const files = await readdir(uploadsDir)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const imageFiles = files.filter(f =>
      imageExtensions.some(ext => f.toLowerCase().endsWith(ext))
    )

    // Récupérer toutes les actualités pour trouver les images utilisées
    const allNews = await prisma.news.findMany({
      select: {
        content: true,
        coverImage: true
      }
    })

    // Extraire toutes les URLs d'images utilisées
    const usedImages = new Set<string>()

    for (const news of allNews) {
      // Image de couverture
      if (news.coverImage) {
        const filename = news.coverImage.split('/').pop()
        if (filename) usedImages.add(filename)
      }

      // Images dans le contenu Editor.js
      if (news.content) {
        try {
          const content = JSON.parse(news.content)
          if (content.blocks) {
            for (const block of content.blocks) {
              if (block.type === 'image' && block.data?.file?.url) {
                const filename = block.data.file.url.split('/').pop()
                if (filename) usedImages.add(filename)
              }
            }
          }
        } catch {
          // Contenu non-JSON, ignorer
        }
      }
    }

    // Identifier les images orphelines
    const orphans: Array<{
      filename: string
      url: string
      size: number
      createdAt: Date
    }> = []

    let totalSize = 0
    let orphanSize = 0

    for (const file of imageFiles) {
      const filepath = join(uploadsDir, file)
      const fileStat = await stat(filepath)
      totalSize += fileStat.size

      if (!usedImages.has(file)) {
        orphanSize += fileStat.size
        orphans.push({
          filename: file,
          url: `/uploads/${file}`,
          size: fileStat.size,
          createdAt: fileStat.birthtime
        })
      }
    }

    // Trier par date de création (les plus anciens en premier)
    orphans.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    return {
      success: true,
      data: {
        total: imageFiles.length,
        used: usedImages.size,
        orphans,
        totalSize,
        orphanSize
      }
    }
  } catch (error) {
    console.error('Erreur lors de la recherche des images orphelines:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la recherche des images orphelines'
    })
  }
})
