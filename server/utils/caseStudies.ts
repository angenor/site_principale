import prisma from './prisma'

let legacyRegionsMigration: Promise<void> | null = null

// Un cas pouvait n'avoir qu'une région (colonne regionId) : elle est recopiée une fois dans
// case_study_regions puis vidée, pour ne pas revenir si l'équipe retire ensuite cette région.
// Exécuté une fois par processus, relancé à l'appel suivant en cas d'échec.
export function ensureCaseStudyRegionsMigrated(): Promise<void> {
  legacyRegionsMigration ??= migrateLegacyRegions().catch((error) => {
    legacyRegionsMigration = null
    throw error
  })
  return legacyRegionsMigration
}

// En SQL pour ne pas modifier la date de mise à jour des cas
async function migrateLegacyRegions() {
  await prisma.$transaction([
    prisma.$executeRaw`
      INSERT INTO case_study_regions ("caseStudyId", "regionId")
      SELECT id, "regionId" FROM case_studies WHERE "regionId" IS NOT NULL
      ON CONFLICT DO NOTHING`,
    prisma.$executeRaw`UPDATE case_studies SET "regionId" = NULL WHERE "regionId" IS NOT NULL`
  ])
}
