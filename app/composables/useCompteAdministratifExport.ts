/**
 * Composable pour l'export des comptes administratifs au format Excel
 * Reproduit exactement le format du fichier de référence avec 3 feuilles:
 * - RECETTE: Tableau détaillé des recettes
 * - DEPENSES: Tableau détaillé des dépenses
 * - EQUILIBRE: Tableau d'équilibre
 */

import ExcelJS from 'exceljs'

// Types pour les données
export interface LigneCompte {
  code: string
  intitule: string
  niveau: 1 | 2 | 3  // 1 = catégorie (2 chiffres), 2 = sous-catégorie (3 chiffres), 3 = détail (4 chiffres)
  parent_code?: string
  // Colonnes recettes
  budget_primitif?: number
  budget_additionnel?: number
  modifications?: number
  previsions_definitives?: number
  or_admis?: number
  recouvrement?: number
  reste_a_recouvrer?: number
  // Colonnes dépenses (en plus)
  engagement?: number
  mandat_admis?: number
  paiement?: number
  reste_a_payer?: number
}

export interface CompteAdministratifData {
  collectivite: string
  annee: number
  programme?: string
  recettes_fonctionnement: LigneCompte[]
  recettes_investissement: LigneCompte[]
  depenses_fonctionnement: LigneCompte[]
  depenses_investissement: LigneCompte[]
}

// Styles communs
const STYLES = {
  title: {
    font: { bold: true, size: 14, color: { argb: 'FF000000' } },
    alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
  },
  subtitle: {
    font: { bold: true, size: 11, color: { argb: 'FF000000' } },
    alignment: { horizontal: 'left' as const, vertical: 'middle' as const },
  },
  header: {
    font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF3695D8' } },
    alignment: { horizontal: 'center' as const, vertical: 'middle' as const, wrapText: true },
    border: {
      top: { style: 'thin' as const, color: { argb: 'FF000000' } },
      bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
      left: { style: 'thin' as const, color: { argb: 'FF000000' } },
      right: { style: 'thin' as const, color: { argb: 'FF000000' } },
    },
  },
  niveau1: {
    font: { bold: true, size: 10 },
    fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE8E8E8' } },
    border: {
      top: { style: 'thin' as const, color: { argb: 'FF000000' } },
      bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
      left: { style: 'thin' as const, color: { argb: 'FF000000' } },
      right: { style: 'thin' as const, color: { argb: 'FF000000' } },
    },
  },
  niveau2: {
    font: { bold: false, size: 9 },
    fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF5F5F5' } },
    border: {
      top: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
    },
  },
  niveau3: {
    font: { bold: false, size: 9 },
    border: {
      top: { style: 'thin' as const, color: { argb: 'FFDDDDDD' } },
      bottom: { style: 'thin' as const, color: { argb: 'FFDDDDDD' } },
      left: { style: 'thin' as const, color: { argb: 'FFDDDDDD' } },
      right: { style: 'thin' as const, color: { argb: 'FFDDDDDD' } },
    },
  },
  number: {
    numFmt: '#,##0',
    alignment: { horizontal: 'right' as const },
  },
  percent: {
    numFmt: '0.00%',
    alignment: { horizontal: 'right' as const },
  },
}

export const useCompteAdministratifExport = () => {
  const toast = useAppToast()

  /**
   * Applique les styles à une cellule
   */
  const applyStyle = (cell: ExcelJS.Cell, style: any) => {
    if (style.font) cell.font = style.font
    if (style.fill) cell.fill = style.fill
    if (style.alignment) cell.alignment = style.alignment
    if (style.border) cell.border = style.border
    if (style.numFmt) cell.numFmt = style.numFmt
  }

  /**
   * Crée la feuille RECETTE
   */
  const createRecetteSheet = (
    workbook: ExcelJS.Workbook,
    data: CompteAdministratifData
  ): ExcelJS.Worksheet => {
    const sheet = workbook.addWorksheet('RECETTE', {
      pageSetup: { orientation: 'landscape', fitToPage: true },
    })

    // Largeurs des colonnes
    sheet.columns = [
      { width: 3 },   // A - vide
      { width: 8 },   // B - Compte niveau 1
      { width: 8 },   // C - Compte niveau 2
      { width: 10 },  // D - Compte niveau 3
      { width: 45 },  // E - Intitulés
      { width: 15 },  // F - Budget primitif
      { width: 15 },  // G - Budget additionnel
      { width: 15 },  // H - Modifications
      { width: 18 },  // I - Prévisions définitives
      { width: 15 },  // J - OR admis
      { width: 15 },  // K - Recouvrement
      { width: 15 },  // L - Reste à recouvrer
      { width: 15 },  // M - Taux d'exécution
    ]

    // Titre
    sheet.mergeCells('B2:M2')
    const titleCell = sheet.getCell('B2')
    titleCell.value = 'TABLEAU DETAILLE DES RECETTES'
    applyStyle(titleCell, STYLES.title)

    // Collectivité
    sheet.mergeCells('E4:H4')
    sheet.getCell('E4').value = `COLLECTIVITE : ${data.collectivite}`
    applyStyle(sheet.getCell('E4'), STYLES.subtitle)

    // Section Fonctionnement
    let currentRow = 6
    sheet.mergeCells(`B${currentRow}:M${currentRow}`)
    const sectionCell = sheet.getCell(`B${currentRow}`)
    sectionCell.value = 'RECETTES DE FONCTIONNEMENT'
    applyStyle(sectionCell, { ...STYLES.subtitle, fill: STYLES.niveau1.fill })
    currentRow++

    // En-têtes
    const headers = [
      '', 'COMPTE', '', '', 'INTITULES', 'BUDGET PRIMITIF', 'BUDGET ADDITIONNEL',
      'MODIFICATIONS +/-', 'PREVISIONS DEFINITIVES (1)', 'OR ADMIS (2)',
      'RECOUVREMENT', 'RESTE A RECOUVRER', "TAUX D'EXECUTION (2)/(1)"
    ]
    headers.forEach((header, idx) => {
      const cell = sheet.getCell(currentRow, idx + 1)
      cell.value = header
      applyStyle(cell, STYLES.header)
    })
    sheet.getRow(currentRow).height = 30
    currentRow++

    // Données de fonctionnement
    currentRow = addRecetteRows(sheet, data.recettes_fonctionnement, currentRow)

    // Espace et section Investissement
    currentRow += 2
    sheet.mergeCells(`B${currentRow}:M${currentRow}`)
    const investCell = sheet.getCell(`B${currentRow}`)
    investCell.value = "RECETTES D'INVESTISSEMENT"
    applyStyle(investCell, { ...STYLES.subtitle, fill: STYLES.niveau1.fill })
    currentRow++

    // En-têtes investissement
    headers.forEach((header, idx) => {
      const cell = sheet.getCell(currentRow, idx + 1)
      cell.value = header
      applyStyle(cell, STYLES.header)
    })
    sheet.getRow(currentRow).height = 30
    currentRow++

    // Données d'investissement
    addRecetteRows(sheet, data.recettes_investissement, currentRow)

    return sheet
  }

  /**
   * Ajoute les lignes de recettes
   */
  const addRecetteRows = (
    sheet: ExcelJS.Worksheet,
    lignes: LigneCompte[],
    startRow: number
  ): number => {
    let currentRow = startRow

    lignes.forEach((ligne) => {
      const row = sheet.getRow(currentRow)

      // Colonnes compte selon le niveau
      if (ligne.niveau === 1) {
        row.getCell(2).value = parseInt(ligne.code) // B - niveau 1
        row.getCell(5).value = ligne.intitule.toUpperCase()
        applyNiveau1Style(row, 2, 13)
      } else if (ligne.niveau === 2) {
        row.getCell(3).value = parseInt(ligne.code) // C - niveau 2
        row.getCell(5).value = ligne.intitule
        applyNiveau2Style(row, 2, 13)
      } else {
        row.getCell(4).value = parseInt(ligne.code) // D - niveau 3
        row.getCell(5).value = ligne.intitule
        applyNiveau3Style(row, 2, 13)
      }

      // Valeurs numériques
      if (ligne.niveau === 1) {
        // Pour niveau 1, on met des formules SUM
        // (simplifié ici - en production, calculer les plages exactes)
        row.getCell(6).value = ligne.budget_primitif || null
        row.getCell(7).value = ligne.budget_additionnel || null
        row.getCell(8).value = ligne.modifications || null
        row.getCell(9).value = ligne.previsions_definitives || null
        row.getCell(10).value = ligne.or_admis || null
        row.getCell(11).value = ligne.recouvrement || null
        row.getCell(12).value = ligne.reste_a_recouvrer || null
      } else {
        row.getCell(6).value = ligne.budget_primitif || null
        row.getCell(7).value = ligne.budget_additionnel || null
        row.getCell(8).value = ligne.modifications || null
        row.getCell(9).value = ligne.previsions_definitives || null
        row.getCell(10).value = ligne.or_admis || null
        row.getCell(11).value = ligne.recouvrement || null
        row.getCell(12).value = ligne.reste_a_recouvrer || null
      }

      // Taux d'exécution (formule)
      const prevCell = `I${currentRow}`
      const orCell = `J${currentRow}`
      row.getCell(13).value = { formula: `IF(${prevCell}=0,0,${orCell}/${prevCell})` }
      row.getCell(13).numFmt = '0.00%'

      // Format nombres
      for (let col = 6; col <= 12; col++) {
        row.getCell(col).numFmt = '#,##0'
        row.getCell(col).alignment = { horizontal: 'right' }
      }

      currentRow++
    })

    return currentRow
  }

  /**
   * Crée la feuille DEPENSES
   */
  const createDepensesSheet = (
    workbook: ExcelJS.Workbook,
    data: CompteAdministratifData
  ): ExcelJS.Worksheet => {
    const sheet = workbook.addWorksheet('DEPENSES', {
      pageSetup: { orientation: 'landscape', fitToPage: true },
    })

    // Largeurs des colonnes
    sheet.columns = [
      { width: 3 },   // A - vide
      { width: 8 },   // B - Compte niveau 1
      { width: 8 },   // C - Compte niveau 2
      { width: 10 },  // D - Compte niveau 3
      { width: 40 },  // E - Intitulés
      { width: 14 },  // F - Budget primitif
      { width: 14 },  // G - Budget additionnel
      { width: 14 },  // H - Modifications
      { width: 16 },  // I - Prévisions définitives
      { width: 14 },  // J - Engagement
      { width: 14 },  // K - Mandat admis
      { width: 14 },  // L - Paiement
      { width: 14 },  // M - Reste à payer
      { width: 14 },  // N - Taux d'exécution
    ]

    // Titre
    sheet.mergeCells('B2:N2')
    const titleCell = sheet.getCell('B2')
    titleCell.value = 'TABLEAU DETAILLE DES DEPENSES'
    applyStyle(titleCell, STYLES.title)

    // Collectivité
    sheet.mergeCells('E4:H4')
    sheet.getCell('E4').value = `COLLECTIVITE : ${data.collectivite}`
    applyStyle(sheet.getCell('E4'), STYLES.subtitle)

    // Programme
    if (data.programme) {
      sheet.mergeCells('E6:H6')
      sheet.getCell('E6').value = `PROGRAMME : ${data.programme}`
    }

    // Section Fonctionnement
    let currentRow = 8
    sheet.mergeCells(`B${currentRow}:N${currentRow}`)
    const sectionCell = sheet.getCell(`B${currentRow}`)
    sectionCell.value = 'DEPENSES DE FONCTIONNEMENT'
    applyStyle(sectionCell, { ...STYLES.subtitle, fill: STYLES.niveau1.fill })
    currentRow++

    // En-têtes
    const headers = [
      '', 'COMPTE', '', '', 'INTITULES', 'BUDGET PRIMITIF', 'BUDGET ADDITIONNEL',
      'MODIFICATIONS +/-', 'PREVISIONS DEFINITIVES (1)', 'ENGAGEMENT',
      'MANDAT ADMIS (2)', 'PAIEMENT', 'RESTE A PAYER', "TAUX D'EXECUTION (2)/(1)"
    ]
    headers.forEach((header, idx) => {
      const cell = sheet.getCell(currentRow, idx + 1)
      cell.value = header
      applyStyle(cell, STYLES.header)
    })
    sheet.getRow(currentRow).height = 30
    currentRow++

    // Données de fonctionnement
    currentRow = addDepenseRows(sheet, data.depenses_fonctionnement, currentRow)

    // Section Investissement
    currentRow += 2
    sheet.mergeCells(`B${currentRow}:N${currentRow}`)
    const investCell = sheet.getCell(`B${currentRow}`)
    investCell.value = "DEPENSES D'INVESTISSEMENT"
    applyStyle(investCell, { ...STYLES.subtitle, fill: STYLES.niveau1.fill })
    currentRow++

    // En-têtes investissement
    headers.forEach((header, idx) => {
      const cell = sheet.getCell(currentRow, idx + 1)
      cell.value = header
      applyStyle(cell, STYLES.header)
    })
    sheet.getRow(currentRow).height = 30
    currentRow++

    // Données d'investissement
    addDepenseRows(sheet, data.depenses_investissement, currentRow)

    return sheet
  }

  /**
   * Ajoute les lignes de dépenses
   */
  const addDepenseRows = (
    sheet: ExcelJS.Worksheet,
    lignes: LigneCompte[],
    startRow: number
  ): number => {
    let currentRow = startRow

    lignes.forEach((ligne) => {
      const row = sheet.getRow(currentRow)

      // Colonnes compte selon le niveau
      if (ligne.niveau === 1) {
        row.getCell(2).value = parseInt(ligne.code)
        row.getCell(5).value = ligne.intitule.toUpperCase()
        applyNiveau1Style(row, 2, 14)
      } else if (ligne.niveau === 2) {
        row.getCell(3).value = parseInt(ligne.code)
        row.getCell(5).value = ligne.intitule
        applyNiveau2Style(row, 2, 14)
      } else {
        row.getCell(4).value = parseInt(ligne.code)
        row.getCell(5).value = ligne.intitule
        applyNiveau3Style(row, 2, 14)
      }

      // Valeurs numériques
      row.getCell(6).value = ligne.budget_primitif || null
      row.getCell(7).value = ligne.budget_additionnel || null
      row.getCell(8).value = ligne.modifications || null
      row.getCell(9).value = ligne.previsions_definitives || null
      row.getCell(10).value = ligne.engagement || null
      row.getCell(11).value = ligne.mandat_admis || null
      row.getCell(12).value = ligne.paiement || null
      row.getCell(13).value = ligne.reste_a_payer || null

      // Taux d'exécution (formule)
      const prevCell = `I${currentRow}`
      const mandatCell = `K${currentRow}`
      row.getCell(14).value = { formula: `IF(${prevCell}=0,0,${mandatCell}/${prevCell})` }
      row.getCell(14).numFmt = '0.00%'

      // Format nombres
      for (let col = 6; col <= 13; col++) {
        row.getCell(col).numFmt = '#,##0'
        row.getCell(col).alignment = { horizontal: 'right' }
      }

      currentRow++
    })

    return currentRow
  }

  /**
   * Crée la feuille EQUILIBRE
   */
  const createEquilibreSheet = (
    workbook: ExcelJS.Workbook,
    data: CompteAdministratifData
  ): ExcelJS.Worksheet => {
    const sheet = workbook.addWorksheet('EQUILIBRE', {
      pageSetup: { orientation: 'landscape', fitToPage: true },
    })

    // Configuration des colonnes
    sheet.columns = [
      { width: 3 },   // A
      { width: 10 },  // B - Compte dépenses
      { width: 35 },  // C - Intitulé dépenses
      { width: 14 },  // D - Mandat admis
      { width: 14 },  // E - Paiement
      { width: 14 },  // F - Reste à payer
      { width: 10 },  // G - Compte recettes
      { width: 35 },  // H - Intitulé recettes
      { width: 14 },  // I - OR Admis
      { width: 14 },  // J - Recouvrement
      { width: 14 },  // K - Reste à recouvrer
    ]

    // Titre
    sheet.mergeCells('B2:K2')
    const titleCell = sheet.getCell('B2')
    titleCell.value = "TABLEAU D'EQUILIBRE DU COMPTE ADMINISTRATIF"
    applyStyle(titleCell, STYLES.title)

    // Collectivité
    sheet.mergeCells('C4:F4')
    sheet.getCell('C4').value = `COLLECTIVITE : ${data.collectivite}`
    applyStyle(sheet.getCell('C4'), STYLES.subtitle)

    // Section Fonctionnement
    let currentRow = 6
    sheet.mergeCells(`B${currentRow}:F${currentRow}`)
    sheet.getCell(`B${currentRow}`).value = 'DEPENSES'
    applyStyle(sheet.getCell(`B${currentRow}`), STYLES.header)

    sheet.mergeCells(`G${currentRow}:K${currentRow}`)
    sheet.getCell(`G${currentRow}`).value = 'RECETTES'
    applyStyle(sheet.getCell(`G${currentRow}`), STYLES.header)
    currentRow++

    // En-têtes
    const depHeaders = ['COMPTE', 'INTITULES', 'MANDAT ADMIS', 'PAIEMENT', 'RESTE A PAYER']
    const recHeaders = ['COMPTE', 'INTITULES', 'OR ADMIS', 'RECOUVREMENT', 'RESTE A RECOUVRER']

    depHeaders.forEach((h, i) => {
      const cell = sheet.getCell(currentRow, i + 2)
      cell.value = h
      applyStyle(cell, STYLES.header)
    })
    recHeaders.forEach((h, i) => {
      const cell = sheet.getCell(currentRow, i + 7)
      cell.value = h
      applyStyle(cell, STYLES.header)
    })
    currentRow++

    // Lignes d'équilibre (niveau 1 uniquement)
    const depN1 = data.depenses_fonctionnement.filter(l => l.niveau === 1)
    const recN1 = data.recettes_fonctionnement.filter(l => l.niveau === 1)
    const maxRows = Math.max(depN1.length, recN1.length)

    for (let i = 0; i < maxRows; i++) {
      const row = sheet.getRow(currentRow)

      if (depN1[i]) {
        row.getCell(2).value = parseInt(depN1[i].code)
        row.getCell(3).value = depN1[i].intitule
        row.getCell(4).value = depN1[i].mandat_admis || null
        row.getCell(5).value = depN1[i].paiement || null
        row.getCell(6).value = depN1[i].reste_a_payer || null
      }

      if (recN1[i]) {
        row.getCell(7).value = parseInt(recN1[i].code)
        row.getCell(8).value = recN1[i].intitule
        row.getCell(9).value = recN1[i].or_admis || null
        row.getCell(10).value = recN1[i].recouvrement || null
        row.getCell(11).value = recN1[i].reste_a_recouvrer || null
      }

      // Format
      for (let col = 4; col <= 6; col++) {
        row.getCell(col).numFmt = '#,##0'
      }
      for (let col = 9; col <= 11; col++) {
        row.getCell(col).numFmt = '#,##0'
      }

      applyNiveau1Style(row, 2, 11)
      currentRow++
    }

    return sheet
  }

  /**
   * Applique le style niveau 1
   */
  const applyNiveau1Style = (row: ExcelJS.Row, startCol: number, endCol: number) => {
    for (let col = startCol; col <= endCol; col++) {
      const cell = row.getCell(col)
      cell.font = STYLES.niveau1.font
      cell.fill = STYLES.niveau1.fill
      cell.border = STYLES.niveau1.border
    }
  }

  /**
   * Applique le style niveau 2
   */
  const applyNiveau2Style = (row: ExcelJS.Row, startCol: number, endCol: number) => {
    for (let col = startCol; col <= endCol; col++) {
      const cell = row.getCell(col)
      cell.font = STYLES.niveau2.font
      cell.fill = STYLES.niveau2.fill
      cell.border = STYLES.niveau2.border
    }
  }

  /**
   * Applique le style niveau 3
   */
  const applyNiveau3Style = (row: ExcelJS.Row, startCol: number, endCol: number) => {
    for (let col = startCol; col <= endCol; col++) {
      const cell = row.getCell(col)
      cell.font = STYLES.niveau3.font
      cell.border = STYLES.niveau3.border
    }
  }

  /**
   * Exporte un compte administratif complet
   */
  const exportCompteAdministratif = async (data: CompteAdministratifData): Promise<boolean> => {
    try {
      toast.info('Génération du fichier Excel en cours...')

      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Plateforme TI Madagascar'
      workbook.created = new Date()

      // Créer les 3 feuilles
      createRecetteSheet(workbook, data)
      createDepensesSheet(workbook, data)
      createEquilibreSheet(workbook, data)

      // Générer le buffer
      const buffer = await workbook.xlsx.writeBuffer()

      // Télécharger
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Compte_Administratif_${data.collectivite.replace(/\s+/g, '_')}_${data.annee}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Export Excel réussi!')
      return true
    } catch (error) {
      console.error('Erreur export:', error)
      toast.error('Erreur lors de l\'export Excel')
      return false
    }
  }

  /**
   * Prépare les données depuis l'API pour l'export
   */
  const prepareDataForExport = (
    compteId: string,
    collectivite: string,
    annee: number,
    planComptable: any[],
    donneesRecettes: any[],
    donneesDepenses: any[]
  ): CompteAdministratifData => {
    // Fonction pour mapper les données
    const mapToLigneCompte = (compte: any, donnees: any, type: 'recette' | 'depense'): LigneCompte => {
      const data = donnees.find((d: any) => d.compte_code === compte.code)

      const ligne: LigneCompte = {
        code: compte.code,
        intitule: compte.intitule,
        niveau: compte.niveau as 1 | 2 | 3,
        parent_code: compte.parent_code,
        budget_primitif: data?.budget_primitif || 0,
        budget_additionnel: data?.budget_additionnel || 0,
        modifications: data?.modifications || 0,
        previsions_definitives: data?.previsions_definitives || 0,
      }

      if (type === 'recette') {
        ligne.or_admis = data?.or_admis || 0
        ligne.recouvrement = data?.recouvrement || 0
        ligne.reste_a_recouvrer = data?.reste_a_recouvrer || 0
      } else {
        ligne.engagement = data?.engagement || 0
        ligne.mandat_admis = data?.mandat_admis || 0
        ligne.paiement = data?.paiement || 0
        ligne.reste_a_payer = data?.reste_a_payer || 0
      }

      return ligne
    }

    // Filtrer par type et section
    const recettesFonct = planComptable
      .filter(c => c.type_mouvement === 'recette' && c.section === 'fonctionnement')
      .sort((a, b) => a.ordre_affichage - b.ordre_affichage || a.code.localeCompare(b.code))
      .map(c => mapToLigneCompte(c, donneesRecettes, 'recette'))

    const recettesInvest = planComptable
      .filter(c => c.type_mouvement === 'recette' && c.section === 'investissement')
      .sort((a, b) => a.ordre_affichage - b.ordre_affichage || a.code.localeCompare(b.code))
      .map(c => mapToLigneCompte(c, donneesRecettes, 'recette'))

    const depensesFonct = planComptable
      .filter(c => c.type_mouvement === 'depense' && c.section === 'fonctionnement')
      .sort((a, b) => a.ordre_affichage - b.ordre_affichage || a.code.localeCompare(b.code))
      .map(c => mapToLigneCompte(c, donneesDepenses, 'depense'))

    const depensesInvest = planComptable
      .filter(c => c.type_mouvement === 'depense' && c.section === 'investissement')
      .sort((a, b) => a.ordre_affichage - b.ordre_affichage || a.code.localeCompare(b.code))
      .map(c => mapToLigneCompte(c, donneesDepenses, 'depense'))

    return {
      collectivite,
      annee,
      recettes_fonctionnement: recettesFonct,
      recettes_investissement: recettesInvest,
      depenses_fonctionnement: depensesFonct,
      depenses_investissement: depensesInvest,
    }
  }

  /**
   * Export avec données de démonstration
   */
  const exportDemoData = async (collectivite: string = 'Commune Exemple', annee: number = 2024) => {
    const demoData: CompteAdministratifData = {
      collectivite,
      annee,
      recettes_fonctionnement: [
        { code: '70', intitule: 'IMPOTS SUR LES REVENUS, BENEFICES ET GAINS', niveau: 1, budget_primitif: 5000000, budget_additionnel: 500000, modifications: 0, previsions_definitives: 5500000, or_admis: 4800000, recouvrement: 4500000, reste_a_recouvrer: 300000 },
        { code: '708', intitule: 'Autres impôts sur les revenus', niveau: 2, parent_code: '70' },
        { code: '7080', intitule: 'Autres impôts sur les revenus - Impôt synthétique', niveau: 3, parent_code: '708', budget_primitif: 5000000, budget_additionnel: 500000, modifications: 0, previsions_definitives: 5500000, or_admis: 4800000, recouvrement: 4500000, reste_a_recouvrer: 300000 },
        { code: '71', intitule: 'IMPOTS SUR LE PATRIMOINE', niveau: 1, budget_primitif: 8000000, budget_additionnel: 1000000, modifications: 200000, previsions_definitives: 9200000, or_admis: 8500000, recouvrement: 8000000, reste_a_recouvrer: 500000 },
        { code: '714', intitule: 'Impôts fonciers sur les terrains - IFT', niveau: 2, parent_code: '71' },
        { code: '7140', intitule: 'Impôts fonciers sur les terrains - IFT', niveau: 3, parent_code: '714', budget_primitif: 4000000, budget_additionnel: 500000, modifications: 100000, previsions_definitives: 4600000, or_admis: 4200000, recouvrement: 4000000, reste_a_recouvrer: 200000 },
        { code: '715', intitule: 'Impôt foncier sur les propriétés bâties – IFPB', niveau: 2, parent_code: '71' },
        { code: '7151', intitule: 'Impôt foncier sur les propriétés bâties – IFPB', niveau: 3, parent_code: '715', budget_primitif: 4000000, budget_additionnel: 500000, modifications: 100000, previsions_definitives: 4600000, or_admis: 4300000, recouvrement: 4000000, reste_a_recouvrer: 300000 },
      ],
      recettes_investissement: [
        { code: '13', intitule: "SUBVENTIONS D'EQUIPEMENT", niveau: 1, budget_primitif: 20000000, budget_additionnel: 0, modifications: 0, previsions_definitives: 20000000, or_admis: 15000000, recouvrement: 15000000, reste_a_recouvrer: 0 },
        { code: '131', intitule: "Subventions d'équipement reçues", niveau: 2, parent_code: '13' },
        { code: '1311', intitule: "Subventions de l'État", niveau: 3, parent_code: '131', budget_primitif: 20000000, budget_additionnel: 0, modifications: 0, previsions_definitives: 20000000, or_admis: 15000000, recouvrement: 15000000, reste_a_recouvrer: 0 },
      ],
      depenses_fonctionnement: [
        { code: '60', intitule: 'CHARGES DE PERSONNEL', niveau: 1, budget_primitif: 6000000, budget_additionnel: 500000, modifications: 0, previsions_definitives: 6500000, engagement: 6500000, mandat_admis: 6000000, paiement: 5800000, reste_a_payer: 200000 },
        { code: '601', intitule: 'Salaires et accessoires', niveau: 2, parent_code: '60' },
        { code: '6011', intitule: 'Personnel permanent', niveau: 3, parent_code: '601', budget_primitif: 4000000, budget_additionnel: 300000, modifications: 0, previsions_definitives: 4300000, engagement: 4300000, mandat_admis: 4000000, paiement: 3900000, reste_a_payer: 100000 },
        { code: '6012', intitule: 'Personnel non permanent', niveau: 3, parent_code: '601', budget_primitif: 2000000, budget_additionnel: 200000, modifications: 0, previsions_definitives: 2200000, engagement: 2200000, mandat_admis: 2000000, paiement: 1900000, reste_a_payer: 100000 },
        { code: '61', intitule: 'ACHATS DE BIENS', niveau: 1, budget_primitif: 3000000, budget_additionnel: 200000, modifications: 100000, previsions_definitives: 3300000, engagement: 3300000, mandat_admis: 3000000, paiement: 2800000, reste_a_payer: 200000 },
        { code: '611', intitule: 'Achats de biens de fonctionnement général', niveau: 2, parent_code: '61' },
        { code: '6111', intitule: 'Fournitures et articles de bureau', niveau: 3, parent_code: '611', budget_primitif: 1500000, budget_additionnel: 100000, modifications: 50000, previsions_definitives: 1650000, engagement: 1650000, mandat_admis: 1500000, paiement: 1400000, reste_a_payer: 100000 },
      ],
      depenses_investissement: [
        { code: '21', intitule: 'IMMOBILISATIONS CORPORELLES', niveau: 1, budget_primitif: 15000000, budget_additionnel: 0, modifications: 0, previsions_definitives: 15000000, engagement: 15000000, mandat_admis: 12000000, paiement: 10000000, reste_a_payer: 2000000 },
        { code: '213', intitule: 'Constructions', niveau: 2, parent_code: '21' },
        { code: '2131', intitule: 'Bâtiments publics', niveau: 3, parent_code: '213', budget_primitif: 15000000, budget_additionnel: 0, modifications: 0, previsions_definitives: 15000000, engagement: 15000000, mandat_admis: 12000000, paiement: 10000000, reste_a_payer: 2000000 },
      ],
    }

    return exportCompteAdministratif(demoData)
  }

  return {
    exportCompteAdministratif,
    prepareDataForExport,
    exportDemoData,
  }
}
