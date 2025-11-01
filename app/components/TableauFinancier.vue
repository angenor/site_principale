<script setup lang="ts">
import type { CompteAdministratif, LigneBudgetaire } from '~/composables/useMockData'

const props = defineProps<{
  compte: CompteAdministratif
}>()

const emit = defineEmits<{
  telecharger: [format: 'excel' | 'word']
}>()

// État pour basculer entre recettes et dépenses
const ongletActif = ref<'recettes' | 'depenses'>('recettes')

// Formater les montants en Ariary
const formatMontant = (montant?: number): string => {
  if (montant === undefined || montant === null) return '-'
  return new Intl.NumberFormat('fr-MG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant)
}

// Formater les pourcentages
const formatPourcentage = (valeur?: number): string => {
  if (valeur === undefined || valeur === null) return '-'
  return `${valeur.toFixed(1)} %`
}

// Calculer les totaux
const calculerTotaux = (lignes: LigneBudgetaire[], niveau: number = 1) => {
  const lignesNiveau = lignes.filter(l => l.niveau === niveau)
  return {
    budgetPrimitif: lignesNiveau.reduce((sum, l) => sum + (l.budgetPrimitif || 0), 0),
    budgetAdditionnel: lignesNiveau.reduce((sum, l) => sum + (l.budgetAdditionnel || 0), 0),
    modifications: lignesNiveau.reduce((sum, l) => sum + (l.modifications || 0), 0),
    previsionDefinitives: lignesNiveau.reduce((sum, l) => sum + (l.previsionDefinitives || 0), 0),
    orAdmis: lignesNiveau.reduce((sum, l) => sum + (l.orAdmis || 0), 0),
    recouvrement: lignesNiveau.reduce((sum, l) => sum + (l.recouvrement || 0), 0),
    resteRecouvrer: lignesNiveau.reduce((sum, l) => sum + (l.resteRecouvrer || 0), 0)
  }
}

const totauxRecettes = computed(() => calculerTotaux(props.compte.lignesRecettes))
const totauxDepenses = computed(() => calculerTotaux(props.compte.lignesDepenses))

// Fonction d'impression
const handlePrint = () => {
  window.print()
}

// Fonction de téléchargement
const handleTelecharger = (format: 'excel' | 'word') => {
  emit('telecharger', format)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- En-tête du tableau -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 print:bg-blue-700">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-bold text-white mb-2">
          COMPTE ADMINISTRATIF {{ compte.annee }}
        </h2>
        <div class="text-blue-100 text-sm space-y-1">
          <p><span class="font-semibold">Commune :</span> {{ compte.commune.nom }}</p>
          <p><span class="font-semibold">District :</span> {{ compte.district.nom }}</p>
          <p><span class="font-semibold">Région :</span> {{ compte.region.nom }}</p>
          <p v-if="compte.commune.maire">
            <span class="font-semibold">Maire :</span> {{ compte.commune.maire }}
          </p>
        </div>
      </div>
    </div>

    <!-- Barre d'actions -->
    <div class="bg-gray-50 border-b border-gray-200 p-4 print:hidden">
      <div class="max-w-7xl mx-auto flex flex-wrap gap-3 justify-between items-center">
        <div class="flex gap-2">
          <button
            @click="ongletActif = 'recettes'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition',
              ongletActif === 'recettes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            ]"
          >
            Recettes
          </button>
          <button
            @click="ongletActif = 'depenses'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition',
              ongletActif === 'depenses'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            ]"
          >
            Dépenses
          </button>
        </div>

        <div class="flex gap-2">
          <button
            @click="handlePrint"
            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
          <button
            @click="handleTelecharger('excel')"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
          <button
            @click="handleTelecharger('word')"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Word
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des RECETTES -->
    <div v-if="ongletActif === 'recettes'" class="p-6 overflow-x-auto">
      <h3 class="text-xl font-bold text-gray-800 mb-4">TABLEAU DÉTAILLÉ DES RECETTES</h3>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="bg-blue-100 border-b-2 border-blue-600">
              <th class="text-left p-3 font-bold text-gray-800 border border-gray-300">INTITULÉ</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">BUDGET<br>PRIMITIF</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">BUDGET<br>ADDITIONNEL</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">MODIFICATIONS<br>+/-</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">PRÉVISIONS<br>DÉFINITIVES</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">OR ADMIS</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300">RECOUVREMENT</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">RESTE À<br>RECOUVRER</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">TAUX<br>EXÉCUTION</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ligne in compte.lignesRecettes"
              :key="ligne.code"
              :class="{
                'bg-blue-50 font-bold': ligne.niveau === 1,
                'bg-white': ligne.niveau === 2,
                'bg-gray-50': ligne.niveau === 3,
                'border-t-2 border-blue-400': ligne.niveau === 1
              }"
            >
              <td
                class="p-3 border border-gray-300"
                :style="{ paddingLeft: `${ligne.niveau * 1.5}rem` }"
              >
                <span :class="{ 'font-bold': ligne.niveau <= 2 }">
                  {{ ligne.intitule }}
                </span>
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.budgetPrimitif) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.budgetAdditionnel) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.modifications) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono font-semibold bg-yellow-50">
                {{ formatMontant(ligne.previsionDefinitives) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.orAdmis) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.recouvrement) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.resteRecouvrer) }}
              </td>
              <td
                class="text-right p-3 border border-gray-300 font-mono"
                :class="{
                  'text-green-700 font-bold': (ligne.tauxExecution || 0) >= 100,
                  'text-orange-700': (ligne.tauxExecution || 0) >= 80 && (ligne.tauxExecution || 0) < 100,
                  'text-red-700': (ligne.tauxExecution || 0) < 80
                }"
              >
                {{ formatPourcentage(ligne.tauxExecution) }}
              </td>
            </tr>
            <!-- Ligne totaux -->
            <tr class="bg-blue-600 text-white font-bold border-t-4 border-blue-800">
              <td class="p-3 border border-gray-300">TOTAL RECETTES</td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxRecettes.budgetPrimitif) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxRecettes.budgetAdditionnel) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxRecettes.modifications) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxRecettes.previsionDefinitives) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxRecettes.orAdmis) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxRecettes.recouvrement) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxRecettes.resteRecouvrer) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatPourcentage((totauxRecettes.orAdmis / totauxRecettes.previsionDefinitives) * 100) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tableau des DÉPENSES -->
    <div v-if="ongletActif === 'depenses'" class="p-6 overflow-x-auto">
      <h3 class="text-xl font-bold text-gray-800 mb-4">TABLEAU DÉTAILLÉ DES DÉPENSES</h3>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="bg-red-100 border-b-2 border-red-600">
              <th class="text-left p-3 font-bold text-gray-800 border border-gray-300">INTITULÉ</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">BUDGET<br>PRIMITIF</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">BUDGET<br>ADDITIONNEL</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">MODIFICATIONS<br>+/-</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">PRÉVISIONS<br>DÉFINITIVES</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">MANDAT<br>ADMIS</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300">PAIEMENT</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">RESTE À<br>PAYER</th>
              <th class="text-right p-3 font-bold text-gray-800 border border-gray-300 whitespace-nowrap">TAUX<br>EXÉCUTION</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ligne in compte.lignesDepenses"
              :key="ligne.code"
              :class="{
                'bg-red-50 font-bold': ligne.niveau === 1,
                'bg-white': ligne.niveau === 2,
                'bg-gray-50': ligne.niveau === 3,
                'border-t-2 border-red-400': ligne.niveau === 1
              }"
            >
              <td
                class="p-3 border border-gray-300"
                :style="{ paddingLeft: `${ligne.niveau * 1.5}rem` }"
              >
                <span :class="{ 'font-bold': ligne.niveau <= 2 }">
                  {{ ligne.intitule }}
                </span>
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.budgetPrimitif) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.budgetAdditionnel) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.modifications) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono font-semibold bg-yellow-50">
                {{ formatMontant(ligne.previsionDefinitives) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.orAdmis) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.recouvrement) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(ligne.resteRecouvrer) }}
              </td>
              <td
                class="text-right p-3 border border-gray-300 font-mono"
                :class="{
                  'text-green-700 font-bold': (ligne.tauxExecution || 0) >= 90,
                  'text-orange-700': (ligne.tauxExecution || 0) >= 80 && (ligne.tauxExecution || 0) < 90,
                  'text-red-700': (ligne.tauxExecution || 0) < 80
                }"
              >
                {{ formatPourcentage(ligne.tauxExecution) }}
              </td>
            </tr>
            <!-- Ligne totaux -->
            <tr class="bg-red-600 text-white font-bold border-t-4 border-red-800">
              <td class="p-3 border border-gray-300">TOTAL DÉPENSES</td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxDepenses.budgetPrimitif) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxDepenses.budgetAdditionnel) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxDepenses.modifications) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxDepenses.previsionDefinitives) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxDepenses.orAdmis) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxDepenses.recouvrement) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatMontant(totauxDepenses.resteRecouvrer) }}
              </td>
              <td class="text-right p-3 border border-gray-300 font-mono">
                {{ formatPourcentage((totauxDepenses.orAdmis / totauxDepenses.previsionDefinitives) * 100) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .print\:hidden {
    display: none !important;
  }

  .print\:bg-blue-700 {
    background-color: #1d4ed8 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
}
</style>
