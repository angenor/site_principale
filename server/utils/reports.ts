import { unlink } from 'fs/promises'
import { join, resolve, sep } from 'path'
import prisma from './prisma'

// Les pièces jointes des signalements ne sont jamais servies par /uploads :
// en production elles sont dans le volume uploads, sous « private/ » (bloqué par la route),
// en développement dans .data/ (hors du dossier public).
export function getReportAttachmentsDir(): string {
  return process.env.NODE_ENV === 'production'
    ? '/app/uploads/private/reports'
    : join(process.cwd(), '.data', 'private-uploads', 'reports')
}

// Chemin absolu d'une pièce jointe, en refusant toute sortie du dossier privé
export function resolveReportAttachmentPath(filepath: string): string | null {
  const baseDir = resolve(getReportAttachmentsDir())
  const absolute = resolve(baseDir, filepath)
  return absolute.startsWith(baseDir + sep) ? absolute : null
}

export async function deleteReportAttachmentFiles(filepaths: Array<string | null>) {
  for (const filepath of filepaths) {
    const absolute = filepath ? resolveReportAttachmentPath(filepath) : null
    if (!absolute) continue
    try {
      await unlink(absolute)
    } catch (error) {
      console.error('Suppression de pièce jointe impossible:', absolute, error)
    }
  }
}

const DEFAULT_REPORT_CATEGORIES = [
  { name: 'Impact environnemental', slug: 'impact-environnemental', icon: 'leaf', color: '#16A34A' },
  { name: 'Impact sur les communautés', slug: 'impact-sur-les-communautes', icon: 'users', color: '#EA580C' },
  { name: 'Non-respect des engagements', slug: 'non-respect-des-engagements', icon: 'handshake', color: '#CA8A04' },
  { name: 'Transparence des revenus', slug: 'transparence-des-revenus', icon: 'coins', color: '#2563EB' },
  { name: 'Conditions de travail', slug: 'conditions-de-travail', icon: 'helmet-safety', color: '#9333EA' },
  { name: 'Corruption', slug: 'corruption', icon: 'scale-balanced', color: '#DC2626' },
  { name: 'Autre', slug: 'autre', icon: null, color: '#6B7280' }
]

const SEEDED_FLAG_KEY = 'report_categories_seeded'

// Crée une seule fois les catégories historiques (celles qui étaient codées en dur),
// afin que le formulaire ne soit jamais vide après la migration.
// Le drapeau évite de les recréer si l'équipe les supprime ensuite.
export async function ensureDefaultReportCategories() {
  const flag = await prisma.siteConfig.findUnique({ where: { key: SEEDED_FLAG_KEY } })
  if (flag) return

  if (await prisma.reportCategory.count() === 0) {
    await prisma.reportCategory.createMany({
      data: DEFAULT_REPORT_CATEGORIES.map((category, index) => ({ ...category, sortOrder: index * 10 })),
      skipDuplicates: true
    })
  }

  await prisma.siteConfig.upsert({
    where: { key: SEEDED_FLAG_KEY },
    update: {},
    create: {
      key: SEEDED_FLAG_KEY,
      value: 'true',
      description: 'Catégories de signalement par défaut déjà créées'
    }
  })
}
