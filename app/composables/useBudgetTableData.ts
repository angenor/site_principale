/**
 * Composable pour la gestion des données des tableaux budgétaires
 * Fournit les computed properties pour les recettes, dépenses et équilibre
 */

import type { ColonneDynamique } from '~/types/comptes-administratifs'

// Types pour les données API
interface LigneRecettesAPI {
  code: string
  intitule: string
  niveau: number
  est_sommable: boolean
  budget_primitif: number
  budget_additionnel: number
  modifications: number
  previsions_definitives: number
  or_admis: number
  recouvrement: number
  reste_a_recouvrer: number
  taux_execution: number | null
}

interface LigneDepensesAPI {
  code: string
  intitule: string
  niveau: number
  est_sommable: boolean
  budget_primitif: number
  budget_additionnel: number
  modifications: number
  previsions_definitives: number
  engagement: number
  mandat_admis: number
  paiement: number
  reste_a_payer: number
  taux_execution: number | null
}

interface SectionTableauRecettesAPI {
  section: string
  titre: string
  lignes: LigneRecettesAPI[]
  total_budget_primitif: number
  total_budget_additionnel: number
  total_modifications: number
  total_previsions_definitives: number
  total_or_admis: number
  total_recouvrement: number
  total_reste_a_recouvrer: number
  taux_execution_global: number | null
}

interface SectionTableauDepensesAPI {
  section: string
  titre: string
  lignes: LigneDepensesAPI[]
  total_budget_primitif: number
  total_budget_additionnel: number
  total_modifications: number
  total_previsions_definitives: number
  total_engagement: number
  total_mandat_admis: number
  total_paiement: number
  total_reste_a_payer: number
  taux_execution_global: number | null
}

export interface TableauCompletAPI {
  commune_id: number
  commune_nom: string
  commune_code: string
  region_nom: string
  province_nom: string
  exercice_annee: number
  exercice_cloture: boolean
  recettes: {
    commune_id: number
    commune_nom: string
    exercice_annee: number
    sections: SectionTableauRecettesAPI[]
    total_general_previsions: number
    total_general_or_admis: number
    total_general_recouvrement: number
    taux_execution_global: number | null
  }
  depenses: {
    commune_id: number
    commune_nom: string
    exercice_annee: number
    sections: SectionTableauDepensesAPI[]
    total_general_previsions: number
    total_general_mandat_admis: number
    total_general_paiement: number
    taux_execution_global: number | null
  }
  equilibre: {
    commune_id: number
    commune_nom: string
    exercice_annee: number
    fonctionnement_recettes_real: number
    fonctionnement_depenses_real: number
    fonctionnement_solde_real: number
    investissement_recettes_real: number
    investissement_depenses_real: number
    investissement_solde_real: number
    total_recettes_real: number
    total_depenses_real: number
    total_solde_real: number
  }
  date_generation: string | null
  validee: boolean
}

export interface UseBudgetTableDataOptions {
  tableauComplet: Ref<TableauCompletAPI | null>
  colonnes: Ref<ColonneDynamique[]>
}

// Clés numériques pour les recettes
const recettesNumericKeys = [
  'budget_primitif', 'budget_additionnel', 'modifications', 'previsions_definitives',
  'or_admis', 'recouvrement', 'reste_a_recouvrer'
]

// Clés numériques pour les dépenses
const depensesNumericKeys = [
  'budget_primitif', 'budget_additionnel', 'modifications', 'previsions_definitives',
  'engagement', 'mandat_admis', 'paiement', 'reste_a_payer'
]

/**
 * Agrège les valeurs des enfants vers les parents dans une hiérarchie
 */
const aggregateHierarchicalData = (
  lignes: Record<string, any>[],
  numericKeys: string[]
): Record<string, any>[] => {
  if (!lignes.length) return lignes

  const codeMap = new Map<string, Record<string, any>>()
  lignes.forEach(l => codeMap.set(l.code, { ...l }))

  const getParentCode = (code: string): string | null => {
    const match = code.match(/^(\d+)([RD])$/)
    if (!match) return null
    const [, numPart, suffix] = match
    if (numPart.length <= 2) return null
    return numPart.slice(0, -1) + suffix
  }

  const sortedLignes = [...lignes].sort((a, b) => b.niveau - a.niveau)

  for (const ligne of sortedLignes) {
    const parentCode = getParentCode(ligne.code)
    if (parentCode && codeMap.has(parentCode)) {
      const currentLigne = codeMap.get(ligne.code)!
      const parent = codeMap.get(parentCode)!
      for (const key of numericKeys) {
        parent[key] = (parent[key] || 0) + (currentLigne[key] || 0)
      }
    }
  }

  return lignes.map(l => codeMap.get(l.code)!)
}

export const useBudgetTableData = (options: UseBudgetTableDataOptions) => {
  const { tableauComplet, colonnes } = options

  // Labels par défaut
  const defaultLabels: Record<string, string> = {
    budget_primitif: 'Budget Primitif',
    budget_additionnel: 'Budget Additionnel',
    modifications: 'Modifications +/-',
    previsions_definitives: 'Prévisions Définitives',
    or_admis: 'OR Admis',
    recouvrement: 'Recouvrement',
    reste_a_recouvrer: 'Reste à Recouvrer',
    taux_execution_recette: 'Taux Exéc.',
    engagement: 'Engagement',
    mandat_admis: 'Mandat Admis',
    paiement: 'Paiement',
    reste_a_payer: 'Reste à Payer',
    taux_execution_depense: 'Taux Exéc.',
  }

  const getColonneLabel = (cle: string): string => {
    const colonne = colonnes.value.find(c => c.cle === cle)
    return colonne?.label || defaultLabels[cle] || cle
  }

  // Colonnes filtrées
  const colonnesRecettes = computed(() => {
    return colonnes.value
      .filter(c => c.est_active && c.est_visible && (c.applicable_a === 'recette' || c.applicable_a === 'tous'))
      .sort((a, b) => a.ordre - b.ordre)
  })

  const colonnesDepenses = computed(() => {
    return colonnes.value
      .filter(c => c.est_active && c.est_visible && (c.applicable_a === 'depense' || c.applicable_a === 'tous'))
      .sort((a, b) => a.ordre - b.ordre)
  })

  // Totaux généraux
  const totaux = computed(() => {
    const recettes = Number(tableauComplet.value?.recettes?.total_general_or_admis) || 0
    const depenses = Number(tableauComplet.value?.depenses?.total_general_mandat_admis) || 0
    return { recettes, depenses, solde: recettes - depenses }
  })

  // Helper pour mapper les lignes recettes
  const mapRecetteLigne = (l: LigneRecettesAPI) => ({
    code: l.code,
    intitule: l.intitule,
    niveau: l.niveau,
    budget_primitif: Number(l.budget_primitif) || 0,
    budget_additionnel: Number(l.budget_additionnel) || 0,
    modifications: Number(l.modifications) || 0,
    previsions_definitives: Number(l.previsions_definitives) || 0,
    or_admis: Number(l.or_admis) || 0,
    recouvrement: Number(l.recouvrement) || 0,
    reste_a_recouvrer: Number(l.reste_a_recouvrer) || 0,
    taux_execution_recette: l.taux_execution ? Number(l.taux_execution) / 100 : 0,
  })

  // Helper pour mapper les lignes dépenses
  const mapDepenseLigne = (l: LigneDepensesAPI) => ({
    code: l.code,
    intitule: l.intitule,
    niveau: l.niveau,
    budget_primitif: Number(l.budget_primitif) || 0,
    budget_additionnel: Number(l.budget_additionnel) || 0,
    modifications: Number(l.modifications) || 0,
    previsions_definitives: Number(l.previsions_definitives) || 0,
    engagement: Number(l.engagement) || 0,
    mandat_admis: Number(l.mandat_admis) || 0,
    paiement: Number(l.paiement) || 0,
    reste_a_payer: Number(l.reste_a_payer) || 0,
    taux_execution_depense: l.taux_execution ? Number(l.taux_execution) / 100 : 0,
  })

  // Recettes Fonctionnement
  const previewRecettesFonctionnement = computed(() => {
    const apiSection = tableauComplet.value?.recettes?.sections?.find(s => s.section === 'fonctionnement')
    if (apiSection?.lignes?.length) {
      const mapped = apiSection.lignes.map(mapRecetteLigne)
      return aggregateHierarchicalData(mapped, recettesNumericKeys)
    }
    return []
  })

  // Recettes Investissement
  const previewRecettesInvestissement = computed(() => {
    const apiSection = tableauComplet.value?.recettes?.sections?.find(s => s.section === 'investissement')
    if (apiSection?.lignes?.length) {
      const mapped = apiSection.lignes.map(mapRecetteLigne)
      return aggregateHierarchicalData(mapped, recettesNumericKeys)
    }
    return []
  })

  // Dépenses Fonctionnement
  const previewDepensesFonctionnement = computed(() => {
    const apiSection = tableauComplet.value?.depenses?.sections?.find(s => s.section === 'fonctionnement')
    if (apiSection?.lignes?.length) {
      const mapped = apiSection.lignes.map(mapDepenseLigne)
      return aggregateHierarchicalData(mapped, depensesNumericKeys)
    }
    return []
  })

  // Dépenses Investissement
  const previewDepensesInvestissement = computed(() => {
    const apiSection = tableauComplet.value?.depenses?.sections?.find(s => s.section === 'investissement')
    if (apiSection?.lignes?.length) {
      const mapped = apiSection.lignes.map(mapDepenseLigne)
      return aggregateHierarchicalData(mapped, depensesNumericKeys)
    }
    return []
  })

  // Calcul des totaux par section pour Recettes
  const calcTotauxRecettes = (data: ReturnType<typeof mapRecetteLigne>[]): Record<string, number> => {
    const result: Record<string, number> = {
      budget_primitif: data.reduce((s, l) => s + (l.budget_primitif || 0), 0),
      budget_additionnel: data.reduce((s, l) => s + (l.budget_additionnel || 0), 0),
      modifications: data.reduce((s, l) => s + (l.modifications || 0), 0),
      previsions_definitives: data.reduce((s, l) => s + (l.previsions_definitives || 0), 0),
      or_admis: data.reduce((s, l) => s + (l.or_admis || 0), 0),
      recouvrement: data.reduce((s, l) => s + (l.recouvrement || 0), 0),
      reste_a_recouvrer: data.reduce((s, l) => s + (l.reste_a_recouvrer || 0), 0),
      taux_execution_recette: 0,
    }
    if (result.or_admis > 0) {
      result.taux_execution_recette = result.recouvrement / result.or_admis
    }
    return result
  }

  // Calcul des totaux par section pour Dépenses
  const calcTotauxDepenses = (data: ReturnType<typeof mapDepenseLigne>[]): Record<string, number> => {
    const result: Record<string, number> = {
      budget_primitif: data.reduce((s, l) => s + (l.budget_primitif || 0), 0),
      budget_additionnel: data.reduce((s, l) => s + (l.budget_additionnel || 0), 0),
      modifications: data.reduce((s, l) => s + (l.modifications || 0), 0),
      previsions_definitives: data.reduce((s, l) => s + (l.previsions_definitives || 0), 0),
      engagement: data.reduce((s, l) => s + (l.engagement || 0), 0),
      mandat_admis: data.reduce((s, l) => s + (l.mandat_admis || 0), 0),
      paiement: data.reduce((s, l) => s + (l.paiement || 0), 0),
      reste_a_payer: data.reduce((s, l) => s + (l.reste_a_payer || 0), 0),
      taux_execution_depense: 0,
    }
    if (result.mandat_admis > 0) {
      result.taux_execution_depense = result.paiement / result.mandat_admis
    }
    return result
  }

  // Totaux Recettes
  const totauxRecettes = computed(() => {
    const fonctData = previewRecettesFonctionnement.value.filter(l => l.niveau === 1)
    const investData = previewRecettesInvestissement.value.filter(l => l.niveau === 1)

    const fonctionnement = calcTotauxRecettes(fonctData)
    const investissement = calcTotauxRecettes(investData)

    const general: Record<string, number> = {}
    for (const key of Object.keys(fonctionnement)) {
      general[key] = (fonctionnement[key] || 0) + (investissement[key] || 0)
    }
    if (general.or_admis > 0) {
      general.taux_execution_recette = general.recouvrement / general.or_admis
    }

    return { fonctionnement, investissement, general }
  })

  // Totaux Dépenses
  const totauxDepenses = computed(() => {
    const fonctData = previewDepensesFonctionnement.value.filter(l => l.niveau === 1)
    const investData = previewDepensesInvestissement.value.filter(l => l.niveau === 1)

    const fonctionnement = calcTotauxDepenses(fonctData)
    const investissement = calcTotauxDepenses(investData)

    const general: Record<string, number> = {}
    for (const key of Object.keys(fonctionnement)) {
      general[key] = (fonctionnement[key] || 0) + (investissement[key] || 0)
    }
    if (general.mandat_admis > 0) {
      general.taux_execution_depense = general.paiement / general.mandat_admis
    }

    return { fonctionnement, investissement, general }
  })

  // Équilibre: lignes juxtaposées Dépenses | Recettes
  const previewEquilibreFonctionnement = computed(() => {
    const depensesFonct = previewDepensesFonctionnement.value.filter(l => l.niveau === 1)
    const recettesFonct = previewRecettesFonctionnement.value.filter(l => l.niveau === 1)
    const maxLen = Math.max(depensesFonct.length, recettesFonct.length)
    const rows = []
    for (let i = 0; i < maxLen; i++) {
      rows.push({
        depense: depensesFonct[i] || null,
        recette: recettesFonct[i] || null,
      })
    }
    return rows
  })

  const previewEquilibreInvestissement = computed(() => {
    const depensesInvest = previewDepensesInvestissement.value.filter(l => l.niveau === 1)
    const recettesInvest = previewRecettesInvestissement.value.filter(l => l.niveau === 1)
    const maxLen = Math.max(depensesInvest.length, recettesInvest.length)
    const rows = []
    for (let i = 0; i < maxLen; i++) {
      rows.push({
        depense: depensesInvest[i] || null,
        recette: recettesInvest[i] || null,
      })
    }
    return rows
  })

  // Totaux pour le tableau d'équilibre
  const totauxEquilibre = computed(() => {
    const fonctRecettes = totauxRecettes.value.fonctionnement
    const fonctDepenses = totauxDepenses.value.fonctionnement
    const investRecettes = totauxRecettes.value.investissement
    const investDepenses = totauxDepenses.value.investissement

    return {
      fonctionnement: {
        recettes: {
          or: fonctRecettes.or_admis,
          recouvrement: fonctRecettes.recouvrement,
          reste: fonctRecettes.reste_a_recouvrer,
        },
        depenses: {
          mandat: fonctDepenses.mandat_admis,
          paiement: fonctDepenses.paiement,
          reste: fonctDepenses.reste_a_payer,
        },
        solde: fonctRecettes.recouvrement - fonctDepenses.paiement,
      },
      investissement: {
        recettes: {
          or: investRecettes.or_admis,
          recouvrement: investRecettes.recouvrement,
          reste: investRecettes.reste_a_recouvrer,
        },
        depenses: {
          mandat: investDepenses.mandat_admis,
          paiement: investDepenses.paiement,
          reste: investDepenses.reste_a_payer,
        },
        solde: investRecettes.recouvrement - investDepenses.paiement,
      },
      general: {
        recettes: totauxRecettes.value.general.recouvrement,
        depenses: totauxDepenses.value.general.paiement,
        solde: totauxRecettes.value.general.recouvrement - totauxDepenses.value.general.paiement,
      },
    }
  })

  // Existing codes pour empêcher les doublons
  const existingRecetteCodes = computed(() => {
    const codes = new Set<string>()
    if (tableauComplet.value?.recettes?.sections) {
      tableauComplet.value.recettes.sections.forEach(section => {
        section.lignes.forEach(ligne => codes.add(ligne.code))
      })
    }
    return codes
  })

  const existingDepenseCodes = computed(() => {
    const codes = new Set<string>()
    if (tableauComplet.value?.depenses?.sections) {
      tableauComplet.value.depenses.sections.forEach(section => {
        section.lignes.forEach(ligne => codes.add(ligne.code))
      })
    }
    return codes
  })

  return {
    // Colonnes
    colonnesRecettes,
    colonnesDepenses,
    getColonneLabel,

    // Totaux généraux
    totaux,

    // Données des tableaux
    previewRecettesFonctionnement,
    previewRecettesInvestissement,
    previewDepensesFonctionnement,
    previewDepensesInvestissement,

    // Totaux par section
    totauxRecettes,
    totauxDepenses,

    // Équilibre
    previewEquilibreFonctionnement,
    previewEquilibreInvestissement,
    totauxEquilibre,

    // Codes existants
    existingRecetteCodes,
    existingDepenseCodes,
  }
}
