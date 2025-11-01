/**
 * Composable pour les données mock
 * Ces données seront remplacées par des données Supabase plus tard
 */

export interface Region {
  id: string
  code: string
  nom: string
  population?: number
}

export interface District {
  id: string
  regionId: string
  code: string
  nom: string
  population?: number
}

export interface Commune {
  id: string
  districtId: string
  code: string
  nom: string
  type: 'urbaine' | 'rurale'
  population?: number
  maire?: string
}

export interface LigneBudgetaire {
  code: string
  intitule: string
  niveau: number
  budgetPrimitif?: number
  budgetAdditionnel?: number
  modifications?: number
  previsionDefinitives?: number
  orAdmis?: number
  recouvrement?: number
  resteRecouvrer?: number
  tauxExecution?: number
}

export interface CompteAdministratif {
  annee: number
  commune: Commune
  district: District
  region: Region
  statut: 'brouillon' | 'valide' | 'publie'
  datePublication?: string
  lignesRecettes: LigneBudgetaire[]
  lignesDepenses: LigneBudgetaire[]
}

export const useMockData = () => {
  // Données mock des régions
  const regions: Region[] = [
    { id: '1', code: 'ANA', nom: 'Analamanga', population: 3618128 },
    { id: '2', code: 'VAK', nom: 'Vakinankaratra', population: 2074358 },
    { id: '3', code: 'ATS', nom: 'Atsinanana', population: 1484403 },
    { id: '4', code: 'ITI', nom: 'Itasy', population: 897962 },
    { id: '5', code: 'BOE', nom: 'Boeny', population: 931171 }
  ]

  // Données mock des districts
  const districts: District[] = [
    { id: 'd1', regionId: '1', code: 'ANKAZOBE', nom: 'Ankazobe', population: 215000 },
    { id: 'd2', regionId: '1', code: 'ANJOZOROBE', nom: 'Anjozorobe', population: 285000 },
    { id: 'd3', regionId: '1', code: 'ANTANA-REN', nom: 'Antananarivo Renivohitra', population: 1300000 },
    { id: 'd4', regionId: '2', code: 'ANTSIRABE-I', nom: 'Antsirabe I', population: 257500 },
    { id: 'd5', regionId: '2', code: 'BETAFO', nom: 'Betafo', population: 298000 },
    { id: 'd6', regionId: '3', code: 'TOAMASINA-I', nom: 'Toamasina I', population: 485000 }
  ]

  // Données mock des communes
  const communes: Commune[] = [
    {
      id: 'c1',
      districtId: 'd1',
      code: 'ANKAZOBE-C',
      nom: 'Ankazobe',
      type: 'urbaine',
      population: 35000,
      maire: 'Rakoto Jean'
    },
    {
      id: 'c2',
      districtId: 'd1',
      code: 'AMBATOMANGA',
      nom: 'Ambatomanga',
      type: 'rurale',
      population: 12000,
      maire: 'Razafy Paul'
    },
    {
      id: 'c3',
      districtId: 'd1',
      code: 'MIANTSO',
      nom: 'Miantso',
      type: 'rurale',
      population: 8500,
      maire: 'Rabe Marie'
    },
    {
      id: 'c4',
      districtId: 'd5',
      code: 'BETAFO-C',
      nom: 'Betafo',
      type: 'urbaine',
      population: 42000,
      maire: 'Randria Joseph'
    },
    {
      id: 'c5',
      districtId: 'd5',
      code: 'MANDROSOHASINA',
      nom: 'Mandrosohasina',
      type: 'rurale',
      population: 15000,
      maire: 'Rasolofo Claire'
    }
  ]

  // Données mock des lignes budgétaires - RECETTES
  const lignesRecettesMock: LigneBudgetaire[] = [
    // Section 1: RECETTES FISCALES
    {
      code: 'R-1',
      intitule: 'RECETTES FISCALES',
      niveau: 1,
      budgetPrimitif: 28000000,
      budgetAdditionnel: 2000000,
      modifications: 500000,
      previsionDefinitives: 30500000,
      orAdmis: 25000000,
      recouvrement: 23800000,
      resteRecouvrer: 1200000,
      tauxExecution: 82.0
    },
    {
      code: 'R-1-1',
      intitule: 'IMPOTS SUR LES REVENUS',
      niveau: 2,
      budgetPrimitif: 5000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 5000000,
      orAdmis: 4200000,
      recouvrement: 3800000,
      resteRecouvrer: 400000,
      tauxExecution: 84.0
    },
    {
      code: 'R-1-1-1',
      intitule: 'Impôt synthétique',
      niveau: 3,
      budgetPrimitif: 5000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 5000000,
      orAdmis: 4200000,
      recouvrement: 3800000,
      resteRecouvrer: 400000,
      tauxExecution: 84.0
    },
    {
      code: 'R-1-2',
      intitule: 'IMPOTS SUR LE PATRIMOINE',
      niveau: 2,
      budgetPrimitif: 20000000,
      budgetAdditionnel: 2000000,
      modifications: 500000,
      previsionDefinitives: 22500000,
      orAdmis: 19300000,
      recouvrement: 18700000,
      resteRecouvrer: 600000,
      tauxExecution: 85.8
    },
    {
      code: 'R-1-2-1',
      intitule: 'Impôts fonciers sur les terrains - IFT',
      niveau: 3,
      budgetPrimitif: 12000000,
      budgetAdditionnel: 2000000,
      modifications: 0,
      previsionDefinitives: 14000000,
      orAdmis: 11500000,
      recouvrement: 10200000,
      resteRecouvrer: 1300000,
      tauxExecution: 82.1
    },
    {
      code: 'R-1-2-2',
      intitule: 'Impôt foncier sur les propriétés bâties - IFPB',
      niveau: 3,
      budgetPrimitif: 8000000,
      budgetAdditionnel: 0,
      modifications: 500000,
      previsionDefinitives: 8500000,
      orAdmis: 7800000,
      recouvrement: 7500000,
      resteRecouvrer: 300000,
      tauxExecution: 91.8
    },
    {
      code: 'R-1-3',
      intitule: 'IMPOTS SUR BIENS ET SERVICES',
      niveau: 2,
      budgetPrimitif: 3000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 3000000,
      orAdmis: 2500000,
      recouvrement: 2300000,
      resteRecouvrer: 200000,
      tauxExecution: 83.3
    },
    {
      code: 'R-1-3-1',
      intitule: 'Taxes sur la publicité',
      niveau: 3,
      budgetPrimitif: 3000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 3000000,
      orAdmis: 2500000,
      recouvrement: 2300000,
      resteRecouvrer: 200000,
      tauxExecution: 83.3
    },

    // Section 2: RECETTES NON FISCALES
    {
      code: 'R-2',
      intitule: 'RECETTES NON FISCALES',
      niveau: 1,
      budgetPrimitif: 258000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 258000000,
      orAdmis: 270000000,
      recouvrement: 269500000,
      resteRecouvrer: 500000,
      tauxExecution: 104.5
    },
    {
      code: 'R-2-1',
      intitule: 'CONTRIBUTIONS RECUES DES TIERS',
      niveau: 2,
      budgetPrimitif: 43000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 43000000,
      orAdmis: 43000000,
      recouvrement: 43000000,
      resteRecouvrer: 0,
      tauxExecution: 100.0
    },
    {
      code: 'R-2-1-1',
      intitule: 'Dotation globale - EPP',
      niveau: 3,
      budgetPrimitif: 25000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 25000000,
      orAdmis: 25000000,
      recouvrement: 25000000,
      resteRecouvrer: 0,
      tauxExecution: 100.0
    },
    {
      code: 'R-2-1-2',
      intitule: 'Dotation globale - CSB',
      niveau: 3,
      budgetPrimitif: 18000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 18000000,
      orAdmis: 18000000,
      recouvrement: 18000000,
      resteRecouvrer: 0,
      tauxExecution: 100.0
    },
    {
      code: 'R-2-2',
      intitule: 'PRODUITS DES RISTOURNES',
      niveau: 2,
      budgetPrimitif: 200000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 200000000,
      orAdmis: 215000000,
      recouvrement: 215000000,
      resteRecouvrer: 0,
      tauxExecution: 107.5
    },
    {
      code: 'R-2-3',
      intitule: 'REDEVANCES',
      niveau: 2,
      budgetPrimitif: 15000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 15000000,
      orAdmis: 12000000,
      recouvrement: 11500000,
      resteRecouvrer: 500000,
      tauxExecution: 80.0
    },
    {
      code: 'R-2-3-1',
      intitule: 'Redevances de collecte et de traitement des ordures ménagères - ROM',
      niveau: 3,
      budgetPrimitif: 15000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 15000000,
      orAdmis: 12000000,
      recouvrement: 11500000,
      resteRecouvrer: 500000,
      tauxExecution: 80.0
    }
  ]

  // Données mock des lignes budgétaires - DEPENSES
  const lignesDepensesMock: LigneBudgetaire[] = [
    // Section 1: CHARGES DE PERSONNEL
    {
      code: 'D-1',
      intitule: 'CHARGES DE PERSONNEL',
      niveau: 1,
      budgetPrimitif: 51500000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 51500000,
      orAdmis: 51500000,
      recouvrement: 49700000,
      resteRecouvrer: 1800000,
      tauxExecution: 96.5
    },
    {
      code: 'D-1-1',
      intitule: 'Salaires et accessoires',
      niveau: 2,
      budgetPrimitif: 45000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 45000000,
      orAdmis: 45000000,
      recouvrement: 43500000,
      resteRecouvrer: 1500000,
      tauxExecution: 96.7
    },
    {
      code: 'D-1-1-1',
      intitule: 'Personnel permanent',
      niveau: 3,
      budgetPrimitif: 45000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 45000000,
      orAdmis: 45000000,
      recouvrement: 43500000,
      resteRecouvrer: 1500000,
      tauxExecution: 96.7
    },
    {
      code: 'D-1-2',
      intitule: 'Charges sociales patronales',
      niveau: 2,
      budgetPrimitif: 6500000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 6500000,
      orAdmis: 6500000,
      recouvrement: 6200000,
      resteRecouvrer: 300000,
      tauxExecution: 95.4
    },
    {
      code: 'D-1-2-1',
      intitule: 'Cotisations à la CNAPS',
      niveau: 3,
      budgetPrimitif: 6500000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 6500000,
      orAdmis: 6500000,
      recouvrement: 6200000,
      resteRecouvrer: 300000,
      tauxExecution: 95.4
    },

    // Section 2: ACHATS DE BIENS
    {
      code: 'D-2',
      intitule: 'ACHATS DE BIENS',
      niveau: 1,
      budgetPrimitif: 20000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 20000000,
      orAdmis: 17700000,
      recouvrement: 16600000,
      resteRecouvrer: 1100000,
      tauxExecution: 88.5
    },
    {
      code: 'D-2-1',
      intitule: 'Achats de biens de fonctionnement général',
      niveau: 2,
      budgetPrimitif: 8000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 8000000,
      orAdmis: 7200000,
      recouvrement: 6800000,
      resteRecouvrer: 400000,
      tauxExecution: 90.0
    },
    {
      code: 'D-2-1-1',
      intitule: 'Fournitures et articles de bureau',
      niveau: 3,
      budgetPrimitif: 8000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 8000000,
      orAdmis: 7200000,
      recouvrement: 6800000,
      resteRecouvrer: 400000,
      tauxExecution: 90.0
    },
    {
      code: 'D-2-2',
      intitule: 'Carburants, Lubrifiants et combustibles',
      niveau: 2,
      budgetPrimitif: 12000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 12000000,
      orAdmis: 10500000,
      recouvrement: 9800000,
      resteRecouvrer: 700000,
      tauxExecution: 87.5
    },

    // Section 3: ACHATS DE SERVICES
    {
      code: 'D-3',
      intitule: 'ACHATS DE SERVICES ET CHARGES PERMANENTES',
      niveau: 1,
      budgetPrimitif: 23000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 23000000,
      orAdmis: 19300000,
      recouvrement: 17300000,
      resteRecouvrer: 2000000,
      tauxExecution: 83.9
    },
    {
      code: 'D-3-1',
      intitule: 'Entretien et maintenance',
      niveau: 2,
      budgetPrimitif: 15000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 15000000,
      orAdmis: 12000000,
      recouvrement: 10500000,
      resteRecouvrer: 1500000,
      tauxExecution: 80.0
    },
    {
      code: 'D-3-1-1',
      intitule: 'Entretien de bâtiments',
      niveau: 3,
      budgetPrimitif: 15000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 15000000,
      orAdmis: 12000000,
      recouvrement: 10500000,
      resteRecouvrer: 1500000,
      tauxExecution: 80.0
    },
    {
      code: 'D-3-2',
      intitule: 'Eau et électricité',
      niveau: 2,
      budgetPrimitif: 5000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 5000000,
      orAdmis: 4500000,
      recouvrement: 4200000,
      resteRecouvrer: 300000,
      tauxExecution: 90.0
    },
    {
      code: 'D-3-3',
      intitule: 'Poste et télécommunications',
      niveau: 2,
      budgetPrimitif: 3000000,
      budgetAdditionnel: 0,
      modifications: 0,
      previsionDefinitives: 3000000,
      orAdmis: 2800000,
      recouvrement: 2600000,
      resteRecouvrer: 200000,
      tauxExecution: 92.9
    }
  ]

  // Fonction pour obtenir les districts d'une région
  const getDistrictsByRegion = (regionId: string): District[] => {
    return districts.filter(d => d.regionId === regionId)
  }

  // Fonction pour obtenir les communes d'un district
  const getCommunesByDistrict = (districtId: string): Commune[] => {
    return communes.filter(c => c.districtId === districtId)
  }

  // Fonction pour obtenir un compte administratif mock
  const getCompteAdministratif = (communeId: string, annee: number): CompteAdministratif | null => {
    const commune = communes.find(c => c.id === communeId)
    if (!commune) return null

    const district = districts.find(d => d.id === commune.districtId)
    if (!district) return null

    const region = regions.find(r => r.id === district.regionId)
    if (!region) return null

    return {
      annee,
      commune,
      district,
      region,
      statut: 'publie',
      datePublication: '2024-06-15',
      lignesRecettes: lignesRecettesMock,
      lignesDepenses: lignesDepensesMock
    }
  }

  return {
    regions,
    districts,
    communes,
    getDistrictsByRegion,
    getCommunesByDistrict,
    getCompteAdministratif
  }
}
