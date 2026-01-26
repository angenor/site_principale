import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

/**
 * Extrait le nom de fichier d'une URL
 */
function extractFilename(url: string | null | undefined): string | null {
  if (!url) return null
  const filename = url.split('/').pop()
  return filename || null
}

/**
 * Extrait l'identifiant de base d'une image avec variantes
 * Pattern: {uuid}-{variant}.webp -> {uuid}
 * Retourne null si ce n'est pas une image avec variantes
 */
function extractBaseId(filename: string): string | null {
  const match = filename.match(/^([a-f0-9-]+)-(?:thumb|medium|original)\.webp$/)
  return match ? match[1] : null
}

/**
 * Ajoute un fichier et toutes ses variantes au set des images utilisées
 */
function addImageWithVariants(usedImages: Set<string>, usedBaseIds: Set<string>, filename: string | null) {
  if (!filename) return

  usedImages.add(filename)

  // Si c'est une image avec variantes, extraire l'ID de base
  const baseId = extractBaseId(filename)
  if (baseId) {
    usedBaseIds.add(baseId)
  }
}

/**
 * Extrait les images du contenu Editor.js
 */
function extractEditorJsImages(content: string | null): string[] {
  if (!content) return []

  const images: string[] = []
  try {
    const parsed = JSON.parse(content)
    if (parsed.blocks) {
      for (const block of parsed.blocks) {
        if (block.type === 'image' && block.data?.file?.url) {
          const filename = extractFilename(block.data.file.url)
          if (filename) images.push(filename)
        }
      }
    }
  } catch {
    // Contenu non-JSON, ignorer
  }
  return images
}

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

    // Sets pour tracker les images utilisées
    const usedImages = new Set<string>()
    const usedBaseIds = new Set<string>() // Pour les variantes (uuid sans -thumb/-medium/-original)

    // ===========================================================================
    // 1. ACTUALITÉS (News)
    // ===========================================================================
    const allNews = await prisma.news.findMany({
      select: {
        content: true,
        coverImage: true
      }
    })

    for (const news of allNews) {
      addImageWithVariants(usedImages, usedBaseIds, extractFilename(news.coverImage))
      for (const img of extractEditorJsImages(news.content)) {
        addImageWithVariants(usedImages, usedBaseIds, img)
      }
    }

    // ===========================================================================
    // 2. ÉTUDES DE CAS (CaseStudy)
    // ===========================================================================
    const allCases = await prisma.caseStudy.findMany({
      select: {
        content: true,
        coverImage: true
      }
    })

    for (const cs of allCases) {
      addImageWithVariants(usedImages, usedBaseIds, extractFilename(cs.coverImage))
      for (const img of extractEditorJsImages(cs.content)) {
        addImageWithVariants(usedImages, usedBaseIds, img)
      }
    }

    // ===========================================================================
    // 3. MÉDIAS (Media) - fichiers dans la galerie média
    // ===========================================================================
    const allMedia = await prisma.media.findMany({
      select: {
        url: true
      }
    })

    for (const media of allMedia) {
      addImageWithVariants(usedImages, usedBaseIds, extractFilename(media.url))
    }

    // ===========================================================================
    // 4. CATÉGORIES (Category) - icônes uploadées
    // ===========================================================================
    const allCategories = await prisma.category.findMany({
      select: {
        icon: true
      }
    })

    for (const cat of allCategories) {
      // L'icône peut être un nom FontAwesome ou une URL
      if (cat.icon && (cat.icon.startsWith('/') || cat.icon.startsWith('http'))) {
        addImageWithVariants(usedImages, usedBaseIds, extractFilename(cat.icon))
      }
    }

    // ===========================================================================
    // 5. MOTS-CLÉS (Keyword) - icônes uploadées
    // ===========================================================================
    const allKeywords = await prisma.keyword.findMany({
      select: {
        icon: true
      }
    })

    for (const kw of allKeywords) {
      if (kw.icon && (kw.icon.startsWith('/') || kw.icon.startsWith('http'))) {
        addImageWithVariants(usedImages, usedBaseIds, extractFilename(kw.icon))
      }
    }

    // ===========================================================================
    // 6. PARTENAIRES (Partner) - logos
    // ===========================================================================
    const allPartners = await prisma.partner.findMany({
      select: {
        logo: true
      }
    })

    for (const partner of allPartners) {
      addImageWithVariants(usedImages, usedBaseIds, extractFilename(partner.logo))
    }

    // ===========================================================================
    // 7. GALERIE / SLIDER (GalleryImage)
    // ===========================================================================
    const allGalleryImages = await prisma.galleryImage.findMany({
      select: {
        imageUrl: true
      }
    })

    for (const gi of allGalleryImages) {
      addImageWithVariants(usedImages, usedBaseIds, extractFilename(gi.imageUrl))
    }

    // ===========================================================================
    // 8. AXES STRATÉGIQUES (StrategicAxis)
    // ===========================================================================
    const allAxes = await prisma.strategicAxis.findMany({
      select: {
        icon: true,
        backgroundImage: true
      }
    })

    for (const axis of allAxes) {
      if (axis.icon && (axis.icon.startsWith('/') || axis.icon.startsWith('http'))) {
        addImageWithVariants(usedImages, usedBaseIds, extractFilename(axis.icon))
      }
      addImageWithVariants(usedImages, usedBaseIds, extractFilename(axis.backgroundImage))
    }

    // ===========================================================================
    // 9. CONTENU À PROPOS (AboutContent)
    // ===========================================================================
    const allAbout = await prisma.aboutContent.findMany({
      select: {
        image: true,
        content: true
      }
    })

    for (const about of allAbout) {
      addImageWithVariants(usedImages, usedBaseIds, extractFilename(about.image))
      for (const img of extractEditorJsImages(about.content)) {
        addImageWithVariants(usedImages, usedBaseIds, img)
      }
    }

    // ===========================================================================
    // 10. ÉVÉNEMENTS TIMELINE (TimelineEvent)
    // ===========================================================================
    const allTimeline = await prisma.timelineEvent.findMany({
      select: {
        image: true
      }
    })

    for (const te of allTimeline) {
      addImageWithVariants(usedImages, usedBaseIds, extractFilename(te.image))
    }

    // ===========================================================================
    // 11. PIÈCES JOINTES ACTUALITÉS (NewsAttachment)
    // ===========================================================================
    const allAttachments = await prisma.newsAttachment.findMany({
      select: {
        url: true
      }
    })

    for (const att of allAttachments) {
      addImageWithVariants(usedImages, usedBaseIds, extractFilename(att.url))
    }

    // ===========================================================================
    // IDENTIFIER LES IMAGES ORPHELINES
    // ===========================================================================
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

      // Vérifier si le fichier est utilisé directement
      if (usedImages.has(file)) {
        continue
      }

      // Vérifier si c'est une variante d'une image utilisée
      const baseId = extractBaseId(file)
      if (baseId && usedBaseIds.has(baseId)) {
        continue
      }

      // Image orpheline
      orphanSize += fileStat.size
      orphans.push({
        filename: file,
        url: `/uploads/${file}`,
        size: fileStat.size,
        createdAt: fileStat.birthtime
      })
    }

    // Trier par date de création (les plus anciens en premier)
    orphans.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    return {
      success: true,
      data: {
        total: imageFiles.length,
        used: imageFiles.length - orphans.length,
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
