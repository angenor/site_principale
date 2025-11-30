#!/usr/bin/env node

/**
 * Script de test pour l'export Excel du Compte Administratif
 * Usage: node test-export.mjs
 */

import { writeFile } from 'fs/promises'

const BASE_URL = 'http://localhost:3000'

async function testExport() {
  try {
    console.log('🚀 Test de l\'export Excel...')

    // Récupérer l'ID de la commune COM-TEST
    console.log('📡 Récupération de l\'ID de la commune...')
    const communeUrl = `${BASE_URL}/api/communes?code=COM-TEST`
    const communeResp = await fetch(communeUrl)

    if (!communeResp.ok) {
      throw new Error(`Impossible de récupérer la commune: ${communeResp.status}`)
    }

    const communes = await communeResp.json()
    if (!communes || communes.length === 0) {
      throw new Error('Commune COM-TEST non trouvée. Assurez-vous que les données de seed sont insérées.')
    }

    const commune = communes[0]
    console.log(`✅ Commune trouvée: ${commune.nom} (ID: ${commune.id})`)

    // Paramètres de test
    const params = new URLSearchParams({
      collectivite_id: commune.id,
      collectivite_type: 'commune',
      annee: '2024'
    })

    const url = `${BASE_URL}/api/export/compte-administratif?${params}`
    console.log(`📡 Requête d'export: ${url}`)

    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erreur HTTP ${response.status}: ${error}`)
    }

    // Sauvegarder le fichier
    const buffer = await response.arrayBuffer()
    const outputPath = './bank/cahier_des_charges/CA_COM-TEST_2024_NEW.xlsx'

    await writeFile(outputPath, Buffer.from(buffer))

    console.log(`✅ Fichier exporté avec succès: ${outputPath}`)
    console.log(`📊 Taille: ${(buffer.byteLength / 1024).toFixed(2)} KB`)

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

testExport()
