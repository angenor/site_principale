// Utilitaires partagés pour les actualités

/**
 * Normalise une liste de chaînes (auteurs, mots-clés) :
 * supprime les espaces superflus, les valeurs vides et les doublons (insensible à la casse).
 */
export function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim().replace(/\s+/g, ' ')
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }
  return result
}

/**
 * Convertit une date reçue du client en Date valide, ou lève une erreur 400.
 */
export function parseDateInput(value: string, fieldLabel: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldLabel} invalide`
    })
  }
  return date
}

/**
 * Nom d'auteur à afficher : les auteurs tiers s'ils existent, sinon l'administrateur.
 */
export function formatNewsAuthors(
  authors: string[] | null | undefined,
  user: { firstName: string; lastName: string } | null | undefined
): string {
  if (authors && authors.length > 0) return authors.join(', ')
  if (user) return `${user.firstName} ${user.lastName}`
  return 'Équipe MOM'
}
