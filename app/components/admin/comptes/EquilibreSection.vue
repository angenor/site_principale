<template>
  <div class="space-y-6">
    <!-- Titre principal -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
        TABLEAU D'ÉQUILIBRE DU COMPTE ADMINISTRATIF
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        COLLECTIVITÉ : {{ collectiviteName }} - Exercice {{ exerciceAnnee }}
      </p>
    </div>

    <!-- SECTION FONCTIONNEMENT -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <!-- En-têtes principaux -->
          <thead>
            <tr class="bg-blue-600 text-white">
              <th colspan="5" class="p-3 text-center border-r border-blue-500 font-bold">DÉPENSES</th>
              <th colspan="5" class="p-3 text-center font-bold">RECETTES</th>
            </tr>
            <tr class="bg-blue-500 text-white text-xs">
              <th class="p-2 text-left border-r border-blue-400 w-16">COMPTE</th>
              <th class="p-2 text-left border-r border-blue-400">INTITULÉS</th>
              <th class="p-2 text-right border-r border-blue-400 w-24">{{ getColonneLabel('mandat_admis').toUpperCase() }}</th>
              <th class="p-2 text-right border-r border-blue-400 w-24">{{ getColonneLabel('paiement').toUpperCase() }}</th>
              <th class="p-2 text-right border-r border-blue-400 w-24">{{ getColonneLabel('reste_a_payer').toUpperCase() }}</th>
              <th class="p-2 text-left border-r border-blue-400 w-16">COMPTE</th>
              <th class="p-2 text-left border-r border-blue-400">INTITULÉS</th>
              <th class="p-2 text-right border-r border-blue-400 w-24">{{ getColonneLabel('or_admis').toUpperCase() }}</th>
              <th class="p-2 text-right border-r border-blue-400 w-24">{{ getColonneLabel('recouvrement').toUpperCase() }}</th>
              <th class="p-2 text-right w-28">{{ getColonneLabel('reste_a_recouvrer').toUpperCase() }}</th>
            </tr>
          </thead>
          <tbody>
            <!-- Lignes de données Fonctionnement -->
            <tr
              v-for="(row, idx) in equilibreFonctionnement"
              :key="'fonct-' + idx"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700"
            >
              <td class="p-2 font-mono text-xs text-gray-700 dark:text-gray-300 bg-red-50/30 dark:bg-red-900/10 border-r border-gray-200 dark:border-gray-600">{{ row.depense?.code }}</td>
              <td class="p-2 text-xs font-medium text-gray-800 dark:text-gray-200 bg-red-50/30 dark:bg-red-900/10 border-r border-gray-200 dark:border-gray-600 uppercase">{{ row.depense?.intitule }}</td>
              <td class="p-2 text-right font-mono text-xs bg-red-50/30 dark:bg-red-900/10 border-r border-gray-200 dark:border-gray-600">{{ formatNumber(row.depense?.mandat_admis) }}</td>
              <td class="p-2 text-right font-mono text-xs bg-red-50/30 dark:bg-red-900/10 border-r border-gray-200 dark:border-gray-600">{{ formatNumber(row.depense?.paiement) }}</td>
              <td class="p-2 text-right font-mono text-xs bg-red-50/30 dark:bg-red-900/10 border-r border-gray-200 dark:border-gray-600">{{ formatNumber(row.depense?.reste_a_payer) }}</td>
              <td class="p-2 font-mono text-xs text-gray-700 dark:text-gray-300 bg-green-50/30 dark:bg-green-900/10 border-r border-gray-200 dark:border-gray-600">{{ row.recette?.code }}</td>
              <td class="p-2 text-xs font-medium text-gray-800 dark:text-gray-200 bg-green-50/30 dark:bg-green-900/10 border-r border-gray-200 dark:border-gray-600 uppercase">{{ row.recette?.intitule }}</td>
              <td class="p-2 text-right font-mono text-xs bg-green-50/30 dark:bg-green-900/10 border-r border-gray-200 dark:border-gray-600">{{ formatNumber(row.recette?.or_admis) }}</td>
              <td class="p-2 text-right font-mono text-xs bg-green-50/30 dark:bg-green-900/10 border-r border-gray-200 dark:border-gray-600">{{ formatNumber(row.recette?.recouvrement) }}</td>
              <td class="p-2 text-right font-mono text-xs bg-green-50/30 dark:bg-green-900/10">{{ formatNumber(row.recette?.reste_a_recouvrer) }}</td>
            </tr>

            <!-- TOTAL DÉPENSES RÉELLES DE FONCTIONNEMENT -->
            <tr class="bg-gray-100 dark:bg-gray-700 font-semibold text-xs">
              <td colspan="2" class="p-2 border-r border-gray-300 dark:border-gray-600">TOTAL DÉPENSES RÉELLES DE FONCTIONNEMENT</td>
              <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totaux.fonctionnement.depenses.mandat) }}</td>
              <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totaux.fonctionnement.depenses.paiement) }}</td>
              <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totaux.fonctionnement.depenses.reste) }}</td>
              <td colspan="2" class="p-2 border-r border-gray-300 dark:border-gray-600">TOTAL RECETTES RÉELLES DE FONCTIONNEMENT</td>
              <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totaux.fonctionnement.recettes.or) }}</td>
              <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totaux.fonctionnement.recettes.recouvrement) }}</td>
              <td class="p-2 text-right font-mono">{{ formatNumber(totaux.fonctionnement.recettes.reste) }}</td>
            </tr>

            <!-- TOTAL GÉNÉRAL FONCTIONNEMENT -->
            <tr class="bg-blue-600 text-white font-bold text-xs">
              <td colspan="2" class="p-2 border-r border-blue-500">TOTAL DÉPENSES DE FONCTIONNEMENT (2)</td>
              <td class="p-2 text-right font-mono border-r border-blue-500">{{ formatNumber(totaux.fonctionnement.depenses.mandat) }}</td>
              <td class="p-2 text-right font-mono border-r border-blue-500">{{ formatNumber(totaux.fonctionnement.depenses.paiement) }}</td>
              <td class="p-2 text-right font-mono border-r border-blue-500">{{ formatNumber(totaux.fonctionnement.depenses.reste) }}</td>
              <td colspan="2" class="p-2 border-r border-blue-500">TOTAL RECETTES DE FONCTIONNEMENT (1)</td>
              <td class="p-2 text-right font-mono border-r border-blue-500">{{ formatNumber(totaux.fonctionnement.recettes.or) }}</td>
              <td class="p-2 text-right font-mono border-r border-blue-500">{{ formatNumber(totaux.fonctionnement.recettes.recouvrement) }}</td>
              <td class="p-2 text-right font-mono">{{ formatNumber(totaux.fonctionnement.recettes.reste) }}</td>
            </tr>

            <!-- EXCÉDENT/DÉFICIT FONCTIONNEMENT -->
            <tr class="bg-blue-100 dark:bg-blue-900/30 font-bold text-xs">
              <td colspan="5" class="p-3 text-center border-r border-blue-200 dark:border-blue-700">
                <span :class="totaux.fonctionnement.solde >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                  {{ totaux.fonctionnement.solde >= 0 ? 'EXCÉDENT' : 'DÉFICIT' }} DE FONCTIONNEMENT (1) - (2) : {{ formatNumber(Math.abs(totaux.fonctionnement.solde)) }} Ar
                </span>
              </td>
              <td colspan="5" class="p-3 text-center">
                <span :class="totaux.fonctionnement.solde < 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'">
                  {{ totaux.fonctionnement.solde < 0 ? 'DÉFICIT' : 'EXCÉDENT' }} DE FONCTIONNEMENT (1) - (2) : {{ formatNumber(Math.abs(totaux.fonctionnement.solde)) }} Ar
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- SECTION INVESTISSEMENT -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div class="bg-purple-100 dark:bg-purple-900/30 p-3 text-center border-b border-purple-200 dark:border-purple-700">
        <h3 class="font-bold text-purple-800 dark:text-purple-300 uppercase">SECTION INVESTISSEMENT</h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="bg-purple-500 text-white text-xs">
              <th class="p-2 text-left border-r border-purple-400 w-16">COMPTE</th>
              <th class="p-2 text-left border-r border-purple-400">INTITULÉ</th>
              <th class="p-2 text-right border-r border-purple-400 w-24">{{ getColonneLabel('mandat_admis').toUpperCase() }}</th>
              <th class="p-2 text-right border-r border-purple-400 w-24">{{ getColonneLabel('paiement').toUpperCase() }}</th>
              <th class="p-2 text-right border-r border-purple-400 w-24">{{ getColonneLabel('reste_a_payer').toUpperCase() }}</th>
              <th class="p-2 text-left border-r border-purple-400 w-16">COMPTE</th>
              <th class="p-2 text-left border-r border-purple-400">INTITULÉ</th>
              <th class="p-2 text-right border-r border-purple-400 w-24">{{ getColonneLabel('or_admis').toUpperCase() }}</th>
              <th class="p-2 text-right border-r border-purple-400 w-24">{{ getColonneLabel('recouvrement').toUpperCase() }}</th>
              <th class="p-2 text-right w-28">{{ getColonneLabel('reste_a_recouvrer').toUpperCase() }}</th>
            </tr>
          </thead>
          <tbody>
            <!-- Lignes de données Investissement -->
            <tr
              v-for="(row, idx) in equilibreInvestissement"
              :key="'invest-' + idx"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700"
            >
              <td class="p-2 font-mono text-xs text-gray-700 dark:text-gray-300 bg-orange-50/30 dark:bg-orange-900/10 border-r border-gray-200 dark:border-gray-600">{{ row.depense?.code }}</td>
              <td class="p-2 text-xs font-medium text-gray-800 dark:text-gray-200 bg-orange-50/30 dark:bg-orange-900/10 border-r border-gray-200 dark:border-gray-600 uppercase">{{ row.depense?.intitule }}</td>
              <td class="p-2 text-right font-mono text-xs bg-orange-50/30 dark:bg-orange-900/10 border-r border-gray-200 dark:border-gray-600">{{ formatNumber(row.depense?.mandat_admis) }}</td>
              <td class="p-2 text-right font-mono text-xs bg-orange-50/30 dark:bg-orange-900/10 border-r border-gray-200 dark:border-gray-600">{{ formatNumber(row.depense?.paiement) }}</td>
              <td class="p-2 text-right font-mono text-xs bg-orange-50/30 dark:bg-orange-900/10 border-r border-gray-200 dark:border-gray-600">{{ formatNumber(row.depense?.reste_a_payer) }}</td>
              <td class="p-2 font-mono text-xs text-gray-700 dark:text-gray-300 bg-teal-50/30 dark:bg-teal-900/10 border-r border-gray-200 dark:border-gray-600">{{ row.recette?.code }}</td>
              <td class="p-2 text-xs font-medium text-gray-800 dark:text-gray-200 bg-teal-50/30 dark:bg-teal-900/10 border-r border-gray-200 dark:border-gray-600 uppercase">{{ row.recette?.intitule }}</td>
              <td class="p-2 text-right font-mono text-xs bg-teal-50/30 dark:bg-teal-900/10 border-r border-gray-200 dark:border-gray-600">{{ formatNumber(row.recette?.or_admis) }}</td>
              <td class="p-2 text-right font-mono text-xs bg-teal-50/30 dark:bg-teal-900/10 border-r border-gray-200 dark:border-gray-600">{{ formatNumber(row.recette?.recouvrement) }}</td>
              <td class="p-2 text-right font-mono text-xs bg-teal-50/30 dark:bg-teal-900/10">{{ formatNumber(row.recette?.reste_a_recouvrer) }}</td>
            </tr>

            <!-- TOTAL DÉPENSES RÉELLES D'INVESTISSEMENT -->
            <tr class="bg-gray-100 dark:bg-gray-700 font-semibold text-xs">
              <td colspan="2" class="p-2 border-r border-gray-300 dark:border-gray-600">TOTAL DÉPENSES RÉELLES D'INVESTISSEMENT</td>
              <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totaux.investissement.depenses.mandat) }}</td>
              <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totaux.investissement.depenses.paiement) }}</td>
              <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totaux.investissement.depenses.reste) }}</td>
              <td colspan="2" class="p-2 border-r border-gray-300 dark:border-gray-600">TOTAL RECETTES RÉELLES D'INVESTISSEMENT</td>
              <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totaux.investissement.recettes.or) }}</td>
              <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totaux.investissement.recettes.recouvrement) }}</td>
              <td class="p-2 text-right font-mono">{{ formatNumber(totaux.investissement.recettes.reste) }}</td>
            </tr>

            <!-- TOTAL GÉNÉRAL INVESTISSEMENT -->
            <tr class="bg-purple-600 text-white font-bold text-xs">
              <td colspan="2" class="p-2 border-r border-purple-500">TOTAL DÉPENSES D'INVESTISSEMENT (4)</td>
              <td class="p-2 text-right font-mono border-r border-purple-500">{{ formatNumber(totaux.investissement.depenses.mandat) }}</td>
              <td class="p-2 text-right font-mono border-r border-purple-500">{{ formatNumber(totaux.investissement.depenses.paiement) }}</td>
              <td class="p-2 text-right font-mono border-r border-purple-500">{{ formatNumber(totaux.investissement.depenses.reste) }}</td>
              <td colspan="2" class="p-2 border-r border-purple-500">TOTAL RECETTES D'INVESTISSEMENT (3)</td>
              <td class="p-2 text-right font-mono border-r border-purple-500">{{ formatNumber(totaux.investissement.recettes.or) }}</td>
              <td class="p-2 text-right font-mono border-r border-purple-500">{{ formatNumber(totaux.investissement.recettes.recouvrement) }}</td>
              <td class="p-2 text-right font-mono">{{ formatNumber(totaux.investissement.recettes.reste) }}</td>
            </tr>

            <!-- EXCÉDENT/DÉFICIT INVESTISSEMENT -->
            <tr class="bg-purple-100 dark:bg-purple-900/30 font-bold text-xs">
              <td colspan="5" class="p-3 text-center border-r border-purple-200 dark:border-purple-700">
                <span :class="totaux.investissement.solde >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                  {{ totaux.investissement.solde >= 0 ? 'EXCÉDENT' : 'DÉFICIT' }} D'INVESTISSEMENT (3) - (4) : {{ formatNumber(Math.abs(totaux.investissement.solde)) }} Ar
                </span>
              </td>
              <td colspan="5" class="p-3 text-center">
                <span :class="totaux.investissement.solde < 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'">
                  {{ totaux.investissement.solde < 0 ? 'DÉFICIT' : 'EXCÉDENT' }} D'INVESTISSEMENT (3) - (4) : {{ formatNumber(Math.abs(totaux.investissement.solde)) }} Ar
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- RÉSULTAT GÉNÉRAL -->
    <div class="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl p-6 text-white shadow-xl">
      <h3 class="text-xl font-bold mb-4 text-center uppercase tracking-wide">RÉSULTAT GÉNÉRAL</h3>
      <div class="grid grid-cols-3 gap-6 text-center">
        <div>
          <p class="text-sm opacity-75 mb-1">Total Recettes</p>
          <p class="text-2xl font-bold font-mono">{{ formatNumber(totaux.general.recettes) }} Ar</p>
        </div>
        <div>
          <p class="text-sm opacity-75 mb-1">Total Dépenses</p>
          <p class="text-2xl font-bold font-mono">{{ formatNumber(totaux.general.depenses) }} Ar</p>
        </div>
        <div>
          <p class="text-sm opacity-75 mb-1">{{ totaux.general.solde >= 0 ? 'Excédent' : 'Déficit' }} Général</p>
          <p
            :class="[
              'text-2xl font-bold font-mono',
              totaux.general.solde >= 0 ? 'text-green-300' : 'text-red-300'
            ]"
          >
            {{ formatNumber(Math.abs(totaux.general.solde)) }} Ar
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface EquilibreRow {
  depense: Record<string, any> | null
  recette: Record<string, any> | null
}

interface TotauxSection {
  recettes: { or: number; recouvrement: number; reste: number }
  depenses: { mandat: number; paiement: number; reste: number }
  solde: number
}

interface TotauxEquilibre {
  fonctionnement: TotauxSection
  investissement: TotauxSection
  general: { recettes: number; depenses: number; solde: number }
}

interface Props {
  collectiviteName: string
  exerciceAnnee: number
  equilibreFonctionnement: EquilibreRow[]
  equilibreInvestissement: EquilibreRow[]
  totaux: TotauxEquilibre
  getColonneLabel: (cle: string) => string
}

defineProps<Props>()

const formatNumber = (value: number | undefined | null): string => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('fr-FR').format(value)
}
</script>
