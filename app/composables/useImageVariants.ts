/**
 * Composable pour gérer les variantes d'images
 * Les images uploadées génèrent 3 variantes : thumb, medium, original
 * Format: /uploads/{uuid}-{variant}.webp
 */

type ImageVariant = 'thumb' | 'medium' | 'original'

/**
 * Convertit une URL d'image vers une variante spécifique
 * @param url - URL de l'image (peut être n'importe quelle variante)
 * @param variant - Variante souhaitée (thumb, medium, original)
 * @returns URL de la variante demandée
 */
export function getImageVariant(url: string | null | undefined, variant: ImageVariant): string {
  if (!url) return ''

  // Si c'est une URL externe, retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // Si c'est un SVG ou GIF, pas de variantes
  if (url.endsWith('.svg') || url.endsWith('.gif')) {
    return url
  }

  // Pattern pour détecter les images avec variantes: /uploads/{uuid}-{variant}.webp
  const variantPattern = /^(\/uploads\/[a-f0-9-]+)-(?:thumb|medium|original)(\.webp)$/
  const match = url.match(variantPattern)

  if (match) {
    // Remplacer la variante existante
    return `${match[1]}-${variant}${match[2]}`
  }

  // Si l'URL ne correspond pas au pattern (anciennes images), retourner telle quelle
  return url
}

/**
 * Composable pour utiliser les variantes d'images dans les composants
 */
export function useImageVariants() {
  return {
    /**
     * Obtient l'URL de la miniature (400px, qualité 60%)
     * Idéal pour : listes, cartes, grilles
     */
    thumb: (url: string | null | undefined) => getImageVariant(url, 'thumb'),

    /**
     * Obtient l'URL de taille moyenne (800px, qualité 75%)
     * Idéal pour : aperçus, modales, galeries
     */
    medium: (url: string | null | undefined) => getImageVariant(url, 'medium'),

    /**
     * Obtient l'URL de la taille originale (1920px, qualité 85%)
     * Idéal pour : pages de détail, bannières hero
     */
    original: (url: string | null | undefined) => getImageVariant(url, 'original'),

    /**
     * Fonction générique pour obtenir n'importe quelle variante
     */
    getVariant: getImageVariant
  }
}
