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
  <div class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
    <!-- En-tête du tableau avec design moderne -->
    <div class="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 dark:from-indigo-700 dark:via-blue-700 dark:to-purple-700 p-8 print:bg-blue-700">
      <!-- Motif de fond décoratif -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div class="flex-1 min-w-[300px]">
            <div class="flex items-center gap-3 mb-3">
              <div class="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <font-awesome-icon icon="table" class="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 class="text-3xl font-bold text-white">
                  COMPTE ADMINISTRATIF {{ compte.annee }}
                </h2>
                <p class="text-blue-100 text-sm mt-1">Tableau détaillé des finances publiques</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              <div class="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <p class="text-blue-100 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                  <font-awesome-icon icon="map-marker-alt" class="text-xs" />
                  Localisation
                </p>
                <p class="text-white font-semibold">{{ compte.region.nom }} → {{ compte.district.nom }}</p>
                <p class="text-white font-bold text-lg">{{ compte.commune.nom }}</p>
              </div>
              <div v-if="compte.commune.maire" class="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <p class="text-blue-100 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                  <font-awesome-icon icon="user" class="text-xs" />
                  Autorité
                </p>
                <p class="text-white font-semibold">{{ compte.commune.maire }}</p>
                <p class="text-blue-100 text-sm">Maire de la commune</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barre d'actions moderne -->
    <div class="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700 p-6 print:hidden">
      <div class="max-w-7xl mx-auto flex flex-wrap gap-4 justify-between items-center">
        <!-- Onglets Recettes/Dépenses -->
        <div class="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl shadow-inner">
          <button
            @click="ongletActif = 'recettes'"
            :class="[
              'px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2',
              ongletActif === 'recettes'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white shadow-lg transform scale-105'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
            ]"
          >
            <font-awesome-icon icon="arrow-up" :class="ongletActif === 'recettes' ? 'text-white' : 'text-green-600 dark:text-green-400'" />
            Recettes
          </button>
          <button
            @click="ongletActif = 'depenses'"
            :class="[
              'px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2',
              ongletActif === 'depenses'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-500 dark:to-rose-500 text-white shadow-lg transform scale-105'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
            ]"
          >
            <font-awesome-icon icon="arrow-down" :class="ongletActif === 'depenses' ? 'text-white' : 'text-red-600 dark:text-red-400'" />
            Dépenses
          </button>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-wrap gap-2">
          <button
            @click="handlePrint"
            class="group px-5 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <font-awesome-icon icon="print" class="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
            Imprimer
          </button>
          <button
            @click="handleTelecharger('excel')"
            class="group px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all flex items-center gap-2 font-medium"
          >
            <font-awesome-icon icon="file-excel" class="group-hover:scale-110 transition-transform" />
            Excel
          </button>
          <button
            @click="handleTelecharger('word')"
            class="group px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all flex items-center gap-2 font-medium"
          >
            <font-awesome-icon icon="file-word" class="group-hover:scale-110 transition-transform" />
            Word
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des RECETTES -->
    <div v-if="ongletActif === 'recettes'" class="p-8 overflow-x-auto bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/10">
      <div class="flex items-center gap-3 mb-6">
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
          <font-awesome-icon icon="arrow-up" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">RECETTES</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Tableau détaillé des recettes budgétaires</p>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border-2 border-green-200 dark:border-green-700 shadow-xl">
        <table class="w-full border-collapse text-sm bg-white dark:bg-gray-800">
          <thead>
            <tr class="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white border-b-2 border-green-700 dark:border-green-800">
              <th class="text-left p-4 font-bold text-white border-r border-green-500/50">INTITULÉ</th>
              <th class="text-right p-4 font-bold text-white border-r border-green-500/50 whitespace-nowrap">BUDGET<br>PRIMITIF</th>
              <th class="text-right p-4 font-bold text-white border-r border-green-500/50 whitespace-nowrap">BUDGET<br>ADDITIONNEL</th>
              <th class="text-right p-4 font-bold text-white border-r border-green-500/50 whitespace-nowrap">MODIFICATIONS<br>+/-</th>
              <th class="text-right p-4 font-bold text-white border-r border-green-500/50 whitespace-nowrap bg-yellow-600/20">PRÉVISIONS<br>DÉFINITIVES</th>
              <th class="text-right p-4 font-bold text-white border-r border-green-500/50 whitespace-nowrap">OR ADMIS</th>
              <th class="text-right p-4 font-bold text-white border-r border-green-500/50">RECOUVREMENT</th>
              <th class="text-right p-4 font-bold text-white border-r border-green-500/50 whitespace-nowrap">RESTE À<br>RECOUVRER</th>
              <th class="text-right p-4 font-bold text-white whitespace-nowrap">TAUX<br>EXÉCUTION</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ligne in compte.lignesRecettes"
              :key="ligne.code"
              :class="{
                'bg-blue-50 dark:bg-blue-900/20 font-bold': ligne.niveau === 1,
                'bg-white dark:bg-gray-800': ligne.niveau === 2,
                'bg-gray-50 dark:bg-gray-700/50': ligne.niveau === 3,
                'border-t-2 border-blue-400 dark:border-blue-600': ligne.niveau === 1
              }"
            >
              <td
                class="p-3 border border-gray-300 dark:border-gray-600 dark:text-gray-200"
                :style="{ paddingLeft: `${ligne.niveau * 1.5}rem` }"
              >
                <span :class="{ 'font-bold': ligne.niveau <= 2 }">
                  {{ ligne.intitule }}
                </span>
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.budgetPrimitif) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.budgetAdditionnel) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.modifications) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono font-semibold bg-yellow-50 dark:bg-yellow-900/30 dark:text-gray-200">
                {{ formatMontant(ligne.previsionDefinitives) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.orAdmis) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.recouvrement) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.resteRecouvrer) }}
              </td>
              <td
                class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono"
                :class="{
                  'text-green-700 dark:text-green-400 font-bold': (ligne.tauxExecution || 0) >= 100,
                  'text-orange-700 dark:text-orange-400': (ligne.tauxExecution || 0) >= 80 && (ligne.tauxExecution || 0) < 100,
                  'text-red-700 dark:text-red-400': (ligne.tauxExecution || 0) < 80
                }"
              >
                {{ formatPourcentage(ligne.tauxExecution) }}
              </td>
            </tr>
            <!-- Ligne totaux -->
            <tr class="bg-blue-600 dark:bg-blue-700 text-white font-bold border-t-4 border-blue-800 dark:border-blue-900">
              <td class="p-3 border border-gray-300 dark:border-gray-600">TOTAL RECETTES</td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxRecettes.budgetPrimitif) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxRecettes.budgetAdditionnel) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxRecettes.modifications) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxRecettes.previsionDefinitives) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxRecettes.orAdmis) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxRecettes.recouvrement) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxRecettes.resteRecouvrer) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatPourcentage((totauxRecettes.orAdmis / totauxRecettes.previsionDefinitives) * 100) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tableau des DÉPENSES -->
    <div v-if="ongletActif === 'depenses'" class="p-8 overflow-x-auto bg-gradient-to-br from-red-50/30 to-rose-50/30 dark:from-red-900/10 dark:to-rose-900/10">
      <div class="flex items-center gap-3 mb-6">
        <div class="bg-gradient-to-r from-red-600 to-rose-600 p-3 rounded-xl shadow-lg">
          <font-awesome-icon icon="arrow-down" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">DÉPENSES</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Tableau détaillé des dépenses budgétaires</p>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border-2 border-red-200 dark:border-red-700 shadow-xl">
        <table class="w-full border-collapse text-sm bg-white dark:bg-gray-800">
          <thead>
            <tr class="bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700 text-white border-b-2 border-red-700 dark:border-red-800">
              <th class="text-left p-4 font-bold text-white border-r border-red-500/50">INTITULÉ</th>
              <th class="text-right p-4 font-bold text-white border-r border-red-500/50 whitespace-nowrap">BUDGET<br>PRIMITIF</th>
              <th class="text-right p-4 font-bold text-white border-r border-red-500/50 whitespace-nowrap">BUDGET<br>ADDITIONNEL</th>
              <th class="text-right p-4 font-bold text-white border-r border-red-500/50 whitespace-nowrap">MODIFICATIONS<br>+/-</th>
              <th class="text-right p-4 font-bold text-white border-r border-red-500/50 whitespace-nowrap bg-yellow-600/20">PRÉVISIONS<br>DÉFINITIVES</th>
              <th class="text-right p-4 font-bold text-white border-r border-red-500/50 whitespace-nowrap">MANDAT<br>ADMIS</th>
              <th class="text-right p-4 font-bold text-white border-r border-red-500/50">PAIEMENT</th>
              <th class="text-right p-4 font-bold text-white border-r border-red-500/50 whitespace-nowrap">RESTE À<br>PAYER</th>
              <th class="text-right p-4 font-bold text-white whitespace-nowrap">TAUX<br>EXÉCUTION</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ligne in compte.lignesDepenses"
              :key="ligne.code"
              :class="{
                'bg-red-50 dark:bg-red-900/20 font-bold': ligne.niveau === 1,
                'bg-white dark:bg-gray-800': ligne.niveau === 2,
                'bg-gray-50 dark:bg-gray-700/50': ligne.niveau === 3,
                'border-t-2 border-red-400 dark:border-red-600': ligne.niveau === 1
              }"
            >
              <td
                class="p-3 border border-gray-300 dark:border-gray-600 dark:text-gray-200"
                :style="{ paddingLeft: `${ligne.niveau * 1.5}rem` }"
              >
                <span :class="{ 'font-bold': ligne.niveau <= 2 }">
                  {{ ligne.intitule }}
                </span>
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.budgetPrimitif) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.budgetAdditionnel) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.modifications) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono font-semibold bg-yellow-50 dark:bg-yellow-900/30 dark:text-gray-200">
                {{ formatMontant(ligne.previsionDefinitives) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.orAdmis) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.recouvrement) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono dark:text-gray-300">
                {{ formatMontant(ligne.resteRecouvrer) }}
              </td>
              <td
                class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono"
                :class="{
                  'text-green-700 dark:text-green-400 font-bold': (ligne.tauxExecution || 0) >= 90,
                  'text-orange-700 dark:text-orange-400': (ligne.tauxExecution || 0) >= 80 && (ligne.tauxExecution || 0) < 90,
                  'text-red-700 dark:text-red-400': (ligne.tauxExecution || 0) < 80
                }"
              >
                {{ formatPourcentage(ligne.tauxExecution) }}
              </td>
            </tr>
            <!-- Ligne totaux -->
            <tr class="bg-red-600 dark:bg-red-700 text-white font-bold border-t-4 border-red-800 dark:border-red-900">
              <td class="p-3 border border-gray-300 dark:border-gray-600">TOTAL DÉPENSES</td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxDepenses.budgetPrimitif) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxDepenses.budgetAdditionnel) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxDepenses.modifications) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxDepenses.previsionDefinitives) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxDepenses.orAdmis) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxDepenses.recouvrement) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
                {{ formatMontant(totauxDepenses.resteRecouvrer) }}
              </td>
              <td class="text-right p-3 border border-gray-300 dark:border-gray-600 font-mono">
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
