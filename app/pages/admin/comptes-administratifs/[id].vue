<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <UiLoadingSpinner size="lg" />
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadCompte"
    />

    <!-- Content -->
    <template v-else-if="compte">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
          <NuxtLink
            to="/admin/comptes-administratifs"
            class="hover:text-[var(--color-primary)] transition-colors"
          >
            Comptes administratifs
          </NuxtLink>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3 h-3" />
          <span class="text-[var(--text-secondary)]">{{ collectiviteName }}</span>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              {{ collectiviteName }}
            </h1>
            <p class="mt-1 text-[var(--text-secondary)]">
              Compte administratif - Exercice {{ compte.annee }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <UiBadge :variant="getStatutVariant(compte.statut)" size="lg">
              {{ getStatutLabel(compte.statut) }}
            </UiBadge>

            <div class="flex items-center gap-2">
              <UiButton
                v-if="compte.statut === 'brouillon'"
                variant="success"
                size="sm"
                :icon="['fas', 'check']"
                :loading="isValidating"
                @click="handleValider"
              >
                Valider
              </UiButton>
              <UiButton
                v-if="compte.statut === 'valide'"
                variant="primary"
                size="sm"
                :icon="['fas', 'globe']"
                :loading="isPublishing"
                @click="handlePublier"
              >
                Publier
              </UiButton>
              <UiButton
                variant="outline"
                size="sm"
                :icon="['fas', 'file-excel']"
                :loading="isExporting"
                @click="handleExport"
              >
                Exporter Excel
              </UiButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <p class="text-sm text-[var(--text-muted)] mb-1">Total Recettes</p>
          <p class="text-xl font-bold text-[var(--color-success)] font-mono">
            {{ formatMontant(totaux.recettes) }}
          </p>
        </div>
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <p class="text-sm text-[var(--text-muted)] mb-1">Total Dépenses</p>
          <p class="text-xl font-bold text-[var(--color-error)] font-mono">
            {{ formatMontant(totaux.depenses) }}
          </p>
        </div>
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <p class="text-sm text-[var(--text-muted)] mb-1">Solde</p>
          <p
            :class="[
              'text-xl font-bold font-mono',
              totaux.solde >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
            ]"
          >
            {{ formatMontant(totaux.solde) }}
          </p>
        </div>
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <p class="text-sm text-[var(--text-muted)] mb-1">Lignes saisies</p>
          <p class="text-xl font-bold text-[var(--text-primary)] font-mono">
            {{ lignes.length }}
          </p>
        </div>
      </div>

      <!-- Tableaux budgétaires stylisés -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
        <div class="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <!-- Sélecteur de feuille avec design moderne -->
              <div class="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl shadow-inner mb-6 w-fit">
                <button
                  v-for="sheet in [
                    { id: 'RECETTE', label: 'Recettes', icon: 'arrow-trend-up', color: 'green' },
                    { id: 'DEPENSES', label: 'Dépenses', icon: 'arrow-trend-down', color: 'red' },
                    { id: 'EQUILIBRE', label: 'Équilibre', icon: 'scale-balanced', color: 'blue' }
                  ]"
                  :key="sheet.id"
                  type="button"
                  :style="activeSheet === sheet.id ? getSheetButtonActiveStyle(sheet.color) : {}"
                  :class="[
                    'px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer',
                    activeSheet === sheet.id
                      ? 'text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 bg-transparent'
                  ]"
                  @click="activeSheet = sheet.id"
                >
                  <font-awesome-icon :icon="['fas', sheet.icon]" class="w-4 h-4" />
                  <span>{{ sheet.label }}</span>
                </button>
              </div>

              <!-- Tableau RECETTES -->
              <div v-if="activeSheet === 'RECETTE'" class="space-y-8">
                <!-- RECETTES DE FONCTIONNEMENT -->
                <div class="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
                      <font-awesome-icon :icon="['fas', 'arrow-trend-up']" class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 dark:text-white">RECETTES DE FONCTIONNEMENT</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ collectiviteName }} - Exercice {{ compte?.annee }}</p>
                    </div>
                  </div>

                  <div class="overflow-x-auto rounded-xl border-2 border-green-200 dark:border-green-700 shadow-xl">
                    <table class="w-full border-collapse text-sm bg-white dark:bg-gray-800">
                      <thead>
                        <tr class="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                          <th class="text-left p-3 font-bold border-r border-green-500/50">INTITULÉ</th>
                          <th class="text-right p-3 font-bold border-r border-green-500/50 whitespace-nowrap">BUDGET<br>PRIMITIF</th>
                          <th class="text-right p-3 font-bold border-r border-green-500/50 whitespace-nowrap">BUDGET<br>ADDITIONNEL</th>
                          <th class="text-right p-3 font-bold border-r border-green-500/50 whitespace-nowrap">MODIF.<br>+/-</th>
                          <th class="text-right p-3 font-bold border-r border-green-500/50 whitespace-nowrap bg-yellow-600/20">PRÉVISIONS<br>DÉFINITIVES</th>
                          <th class="text-right p-3 font-bold border-r border-green-500/50">OR ADMIS</th>
                          <th class="text-right p-3 font-bold border-r border-green-500/50">RECOUVREMENT</th>
                          <th class="text-right p-3 font-bold border-r border-green-500/50 whitespace-nowrap">RESTE À<br>RECOUVRER</th>
                          <th class="text-right p-3 font-bold whitespace-nowrap">TAUX<br>EXÉC.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="ligne in previewRecettesFonctionnement"
                          :key="ligne.code"
                          :class="{
                            'bg-green-50 dark:bg-green-900/30 font-bold border-t-2 border-green-300 dark:border-green-700': ligne.niveau === 1,
                            'bg-white dark:bg-gray-800': ligne.niveau === 2,
                            'bg-gray-50 dark:bg-gray-700/50': ligne.niveau === 3
                          }"
                        >
                          <td class="p-3 border border-gray-200 dark:border-gray-600" :style="{ paddingLeft: `${ligne.niveau * 1}rem` }">
                            <span class="font-mono text-xs text-gray-500 dark:text-gray-400 mr-2">{{ ligne.code }}</span>
                            <span :class="{ 'font-bold': ligne.niveau <= 2 }">{{ ligne.intitule }}</span>
                          </td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.budget_primitif) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.budget_additionnel) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.modifications) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono font-semibold bg-yellow-50 dark:bg-yellow-900/30">{{ formatNumber(ligne.previsions_definitives) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.or_admis) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.recouvrement) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.reste_a_recouvrer) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono font-bold"
                            :class="{
                              'text-green-600 dark:text-green-400': (ligne.taux_execution || 0) >= 0.9,
                              'text-orange-600 dark:text-orange-400': (ligne.taux_execution || 0) >= 0.7 && (ligne.taux_execution || 0) < 0.9,
                              'text-red-600 dark:text-red-400': (ligne.taux_execution || 0) < 0.7
                            }"
                          >{{ formatPercent(ligne.taux_execution) }}</td>
                        </tr>
                        <!-- Total Fonctionnement -->
                        <tr class="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
                          <td class="p-3 border border-green-500/50">TOTAL RECETTES FONCTIONNEMENT</td>
                          <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(totauxRecettes.fonctionnement.bp) }}</td>
                          <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(totauxRecettes.fonctionnement.ba) }}</td>
                          <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(totauxRecettes.fonctionnement.modif) }}</td>
                          <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(totauxRecettes.fonctionnement.pd) }}</td>
                          <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(totauxRecettes.fonctionnement.or) }}</td>
                          <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(totauxRecettes.fonctionnement.recouvrement) }}</td>
                          <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(totauxRecettes.fonctionnement.reste) }}</td>
                          <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatPercent(totauxRecettes.fonctionnement.taux) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- RECETTES D'INVESTISSEMENT -->
                <div class="bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="bg-gradient-to-r from-teal-600 to-cyan-600 p-3 rounded-xl shadow-lg">
                      <font-awesome-icon :icon="['fas', 'landmark']" class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 dark:text-white">RECETTES D'INVESTISSEMENT</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ collectiviteName }} - Exercice {{ compte?.annee }}</p>
                    </div>
                  </div>

                  <div class="overflow-x-auto rounded-xl border-2 border-teal-200 dark:border-teal-700 shadow-xl">
                    <table class="w-full border-collapse text-sm bg-white dark:bg-gray-800">
                      <thead>
                        <tr class="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                          <th class="text-left p-3 font-bold border-r border-teal-500/50">INTITULÉ</th>
                          <th class="text-right p-3 font-bold border-r border-teal-500/50 whitespace-nowrap">BUDGET<br>PRIMITIF</th>
                          <th class="text-right p-3 font-bold border-r border-teal-500/50 whitespace-nowrap">BUDGET<br>ADDITIONNEL</th>
                          <th class="text-right p-3 font-bold border-r border-teal-500/50 whitespace-nowrap">MODIF.<br>+/-</th>
                          <th class="text-right p-3 font-bold border-r border-teal-500/50 whitespace-nowrap bg-yellow-600/20">PRÉVISIONS<br>DÉFINITIVES</th>
                          <th class="text-right p-3 font-bold border-r border-teal-500/50">OR ADMIS</th>
                          <th class="text-right p-3 font-bold border-r border-teal-500/50">RECOUVREMENT</th>
                          <th class="text-right p-3 font-bold border-r border-teal-500/50 whitespace-nowrap">RESTE À<br>RECOUVRER</th>
                          <th class="text-right p-3 font-bold whitespace-nowrap">TAUX<br>EXÉC.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="ligne in previewRecettesInvestissement"
                          :key="ligne.code"
                          :class="{
                            'bg-teal-50 dark:bg-teal-900/30 font-bold border-t-2 border-teal-300 dark:border-teal-700': ligne.niveau === 1,
                            'bg-white dark:bg-gray-800': ligne.niveau === 2,
                            'bg-gray-50 dark:bg-gray-700/50': ligne.niveau === 3
                          }"
                        >
                          <td class="p-3 border border-gray-200 dark:border-gray-600" :style="{ paddingLeft: `${ligne.niveau * 1}rem` }">
                            <span class="font-mono text-xs text-gray-500 dark:text-gray-400 mr-2">{{ ligne.code }}</span>
                            <span :class="{ 'font-bold': ligne.niveau <= 2 }">{{ ligne.intitule }}</span>
                          </td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.budget_primitif) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.budget_additionnel) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.modifications) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono font-semibold bg-yellow-50 dark:bg-yellow-900/30">{{ formatNumber(ligne.previsions_definitives) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.or_admis) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.recouvrement) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.reste_a_recouvrer) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono font-bold"
                            :class="{
                              'text-green-600 dark:text-green-400': (ligne.taux_execution || 0) >= 0.9,
                              'text-orange-600 dark:text-orange-400': (ligne.taux_execution || 0) >= 0.7 && (ligne.taux_execution || 0) < 0.9,
                              'text-red-600 dark:text-red-400': (ligne.taux_execution || 0) < 0.7
                            }"
                          >{{ formatPercent(ligne.taux_execution) }}</td>
                        </tr>
                        <!-- Total Investissement -->
                        <tr class="bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold">
                          <td class="p-3 border border-teal-500/50">TOTAL RECETTES INVESTISSEMENT</td>
                          <td class="text-right p-3 border border-teal-500/50 font-mono">{{ formatNumber(totauxRecettes.investissement.bp) }}</td>
                          <td class="text-right p-3 border border-teal-500/50 font-mono">{{ formatNumber(totauxRecettes.investissement.ba) }}</td>
                          <td class="text-right p-3 border border-teal-500/50 font-mono">{{ formatNumber(totauxRecettes.investissement.modif) }}</td>
                          <td class="text-right p-3 border border-teal-500/50 font-mono">{{ formatNumber(totauxRecettes.investissement.pd) }}</td>
                          <td class="text-right p-3 border border-teal-500/50 font-mono">{{ formatNumber(totauxRecettes.investissement.or) }}</td>
                          <td class="text-right p-3 border border-teal-500/50 font-mono">{{ formatNumber(totauxRecettes.investissement.recouvrement) }}</td>
                          <td class="text-right p-3 border border-teal-500/50 font-mono">{{ formatNumber(totauxRecettes.investissement.reste) }}</td>
                          <td class="text-right p-3 border border-teal-500/50 font-mono">{{ formatPercent(totauxRecettes.investissement.taux) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- TOTAL GÉNÉRAL RECETTES -->
                <div class="bg-gradient-to-r from-green-700 to-emerald-700 rounded-xl p-4 text-white">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-bold">TOTAL GÉNÉRAL RECETTES</span>
                    <span class="text-2xl font-bold font-mono">{{ formatNumber(totauxRecettes.general.recouvrement) }} Ar</span>
                  </div>
                  <div class="grid grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <span class="opacity-75">Budget Primitif</span>
                      <p class="font-mono font-semibold">{{ formatNumber(totauxRecettes.general.bp) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Prévisions Définitives</span>
                      <p class="font-mono font-semibold">{{ formatNumber(totauxRecettes.general.pd) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Reste à Recouvrer</span>
                      <p class="font-mono font-semibold">{{ formatNumber(totauxRecettes.general.reste) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Taux d'Exécution</span>
                      <p class="font-mono font-semibold">{{ formatPercent(totauxRecettes.general.taux) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tableau DÉPENSES -->
              <div v-else-if="activeSheet === 'DEPENSES'" class="space-y-8">
                <!-- DÉPENSES DE FONCTIONNEMENT -->
                <div class="bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="bg-gradient-to-r from-red-600 to-rose-600 p-3 rounded-xl shadow-lg">
                      <font-awesome-icon :icon="['fas', 'arrow-trend-down']" class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 dark:text-white">DÉPENSES DE FONCTIONNEMENT</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ collectiviteName }} - Exercice {{ compte?.annee }}</p>
                    </div>
                  </div>

                  <div class="overflow-x-auto rounded-xl border-2 border-red-200 dark:border-red-700 shadow-xl">
                    <table class="w-full border-collapse text-sm bg-white dark:bg-gray-800">
                      <thead>
                        <tr class="bg-gradient-to-r from-red-600 to-rose-600 text-white">
                          <th class="text-left p-3 font-bold border-r border-red-500/50">INTITULÉ</th>
                          <th class="text-right p-3 font-bold border-r border-red-500/50 whitespace-nowrap">BUDGET<br>PRIMITIF</th>
                          <th class="text-right p-3 font-bold border-r border-red-500/50 whitespace-nowrap">BUDGET<br>ADDITIONNEL</th>
                          <th class="text-right p-3 font-bold border-r border-red-500/50 whitespace-nowrap">MODIF.<br>+/-</th>
                          <th class="text-right p-3 font-bold border-r border-red-500/50 whitespace-nowrap bg-yellow-600/20">PRÉVISIONS<br>DÉFINITIVES</th>
                          <th class="text-right p-3 font-bold border-r border-red-500/50">ENGAGEMENT</th>
                          <th class="text-right p-3 font-bold border-r border-red-500/50 whitespace-nowrap">MANDAT<br>ADMIS</th>
                          <th class="text-right p-3 font-bold border-r border-red-500/50">PAIEMENT</th>
                          <th class="text-right p-3 font-bold border-r border-red-500/50 whitespace-nowrap">RESTE À<br>PAYER</th>
                          <th class="text-right p-3 font-bold whitespace-nowrap">TAUX<br>EXÉC.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="ligne in previewDepensesFonctionnement"
                          :key="ligne.code"
                          :class="{
                            'bg-red-50 dark:bg-red-900/30 font-bold border-t-2 border-red-300 dark:border-red-700': ligne.niveau === 1,
                            'bg-white dark:bg-gray-800': ligne.niveau === 2,
                            'bg-gray-50 dark:bg-gray-700/50': ligne.niveau === 3
                          }"
                        >
                          <td class="p-3 border border-gray-200 dark:border-gray-600" :style="{ paddingLeft: `${ligne.niveau * 1}rem` }">
                            <span class="font-mono text-xs text-gray-500 dark:text-gray-400 mr-2">{{ ligne.code }}</span>
                            <span :class="{ 'font-bold': ligne.niveau <= 2 }">{{ ligne.intitule }}</span>
                          </td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.budget_primitif) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.budget_additionnel) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.modifications) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono font-semibold bg-yellow-50 dark:bg-yellow-900/30">{{ formatNumber(ligne.previsions_definitives) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.engagement) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.mandat_admis) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.paiement) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.reste_a_payer) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono font-bold"
                            :class="{
                              'text-green-600 dark:text-green-400': (ligne.taux_execution || 0) >= 0.9,
                              'text-orange-600 dark:text-orange-400': (ligne.taux_execution || 0) >= 0.7 && (ligne.taux_execution || 0) < 0.9,
                              'text-red-600 dark:text-red-400': (ligne.taux_execution || 0) < 0.7
                            }"
                          >{{ formatPercent(ligne.taux_execution) }}</td>
                        </tr>
                        <!-- Total Fonctionnement -->
                        <tr class="bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold">
                          <td class="p-3 border border-red-500/50">TOTAL DÉPENSES FONCTIONNEMENT</td>
                          <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxDepenses.fonctionnement.bp) }}</td>
                          <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxDepenses.fonctionnement.ba) }}</td>
                          <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxDepenses.fonctionnement.modif) }}</td>
                          <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxDepenses.fonctionnement.pd) }}</td>
                          <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxDepenses.fonctionnement.engagement) }}</td>
                          <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxDepenses.fonctionnement.mandat) }}</td>
                          <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxDepenses.fonctionnement.paiement) }}</td>
                          <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxDepenses.fonctionnement.reste) }}</td>
                          <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatPercent(totauxDepenses.fonctionnement.taux) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- DÉPENSES D'INVESTISSEMENT -->
                <div class="bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="bg-gradient-to-r from-orange-600 to-amber-600 p-3 rounded-xl shadow-lg">
                      <font-awesome-icon :icon="['fas', 'building']" class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 dark:text-white">DÉPENSES D'INVESTISSEMENT</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ collectiviteName }} - Exercice {{ compte?.annee }}</p>
                    </div>
                  </div>

                  <div class="overflow-x-auto rounded-xl border-2 border-orange-200 dark:border-orange-700 shadow-xl">
                    <table class="w-full border-collapse text-sm bg-white dark:bg-gray-800">
                      <thead>
                        <tr class="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                          <th class="text-left p-3 font-bold border-r border-orange-500/50">INTITULÉ</th>
                          <th class="text-right p-3 font-bold border-r border-orange-500/50 whitespace-nowrap">BUDGET<br>PRIMITIF</th>
                          <th class="text-right p-3 font-bold border-r border-orange-500/50 whitespace-nowrap">BUDGET<br>ADDITIONNEL</th>
                          <th class="text-right p-3 font-bold border-r border-orange-500/50 whitespace-nowrap">MODIF.<br>+/-</th>
                          <th class="text-right p-3 font-bold border-r border-orange-500/50 whitespace-nowrap bg-yellow-600/20">PRÉVISIONS<br>DÉFINITIVES</th>
                          <th class="text-right p-3 font-bold border-r border-orange-500/50">ENGAGEMENT</th>
                          <th class="text-right p-3 font-bold border-r border-orange-500/50 whitespace-nowrap">MANDAT<br>ADMIS</th>
                          <th class="text-right p-3 font-bold border-r border-orange-500/50">PAIEMENT</th>
                          <th class="text-right p-3 font-bold border-r border-orange-500/50 whitespace-nowrap">RESTE À<br>PAYER</th>
                          <th class="text-right p-3 font-bold whitespace-nowrap">TAUX<br>EXÉC.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="ligne in previewDepensesInvestissement"
                          :key="ligne.code"
                          :class="{
                            'bg-orange-50 dark:bg-orange-900/30 font-bold border-t-2 border-orange-300 dark:border-orange-700': ligne.niveau === 1,
                            'bg-white dark:bg-gray-800': ligne.niveau === 2,
                            'bg-gray-50 dark:bg-gray-700/50': ligne.niveau === 3
                          }"
                        >
                          <td class="p-3 border border-gray-200 dark:border-gray-600" :style="{ paddingLeft: `${ligne.niveau * 1}rem` }">
                            <span class="font-mono text-xs text-gray-500 dark:text-gray-400 mr-2">{{ ligne.code }}</span>
                            <span :class="{ 'font-bold': ligne.niveau <= 2 }">{{ ligne.intitule }}</span>
                          </td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.budget_primitif) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.budget_additionnel) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.modifications) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono font-semibold bg-yellow-50 dark:bg-yellow-900/30">{{ formatNumber(ligne.previsions_definitives) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.engagement) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.mandat_admis) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.paiement) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono text-gray-700 dark:text-gray-300">{{ formatNumber(ligne.reste_a_payer) }}</td>
                          <td class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono font-bold"
                            :class="{
                              'text-green-600 dark:text-green-400': (ligne.taux_execution || 0) >= 0.9,
                              'text-orange-600 dark:text-orange-400': (ligne.taux_execution || 0) >= 0.7 && (ligne.taux_execution || 0) < 0.9,
                              'text-red-600 dark:text-red-400': (ligne.taux_execution || 0) < 0.7
                            }"
                          >{{ formatPercent(ligne.taux_execution) }}</td>
                        </tr>
                        <!-- Total Investissement -->
                        <tr class="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold">
                          <td class="p-3 border border-orange-500/50">TOTAL DÉPENSES INVESTISSEMENT</td>
                          <td class="text-right p-3 border border-orange-500/50 font-mono">{{ formatNumber(totauxDepenses.investissement.bp) }}</td>
                          <td class="text-right p-3 border border-orange-500/50 font-mono">{{ formatNumber(totauxDepenses.investissement.ba) }}</td>
                          <td class="text-right p-3 border border-orange-500/50 font-mono">{{ formatNumber(totauxDepenses.investissement.modif) }}</td>
                          <td class="text-right p-3 border border-orange-500/50 font-mono">{{ formatNumber(totauxDepenses.investissement.pd) }}</td>
                          <td class="text-right p-3 border border-orange-500/50 font-mono">{{ formatNumber(totauxDepenses.investissement.engagement) }}</td>
                          <td class="text-right p-3 border border-orange-500/50 font-mono">{{ formatNumber(totauxDepenses.investissement.mandat) }}</td>
                          <td class="text-right p-3 border border-orange-500/50 font-mono">{{ formatNumber(totauxDepenses.investissement.paiement) }}</td>
                          <td class="text-right p-3 border border-orange-500/50 font-mono">{{ formatNumber(totauxDepenses.investissement.reste) }}</td>
                          <td class="text-right p-3 border border-orange-500/50 font-mono">{{ formatPercent(totauxDepenses.investissement.taux) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- TOTAL GÉNÉRAL DÉPENSES -->
                <div class="bg-gradient-to-r from-red-700 to-rose-700 rounded-xl p-4 text-white">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-bold">TOTAL GÉNÉRAL DÉPENSES</span>
                    <span class="text-2xl font-bold font-mono">{{ formatNumber(totauxDepenses.general.paiement) }} Ar</span>
                  </div>
                  <div class="grid grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <span class="opacity-75">Budget Primitif</span>
                      <p class="font-mono font-semibold">{{ formatNumber(totauxDepenses.general.bp) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Prévisions Définitives</span>
                      <p class="font-mono font-semibold">{{ formatNumber(totauxDepenses.general.pd) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Reste à Payer</span>
                      <p class="font-mono font-semibold">{{ formatNumber(totauxDepenses.general.reste) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Taux d'Exécution</span>
                      <p class="font-mono font-semibold">{{ formatPercent(totauxDepenses.general.taux) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tableau ÉQUILIBRE - Conforme au modèle Excel -->
              <div v-else class="space-y-6">
                <!-- Titre principal -->
                <div class="text-center mb-6">
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                    TABLEAU D'ÉQUILIBRE DU COMPTE ADMINISTRATIF
                  </h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    COLLECTIVITÉ : {{ collectiviteName }} - Exercice {{ compte?.annee }}
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
                          <th class="p-2 text-right border-r border-blue-400 w-24">MANDAT ADMIS</th>
                          <th class="p-2 text-right border-r border-blue-400 w-24">PAIEMENT</th>
                          <th class="p-2 text-right border-r border-blue-400 w-24">RESTE À PAYER</th>
                          <th class="p-2 text-left border-r border-blue-400 w-16">COMPTE</th>
                          <th class="p-2 text-left border-r border-blue-400">INTITULÉS</th>
                          <th class="p-2 text-right border-r border-blue-400 w-24">OR ADMIS</th>
                          <th class="p-2 text-right border-r border-blue-400 w-24">RECOUVREMENT</th>
                          <th class="p-2 text-right w-28">RESTE À RECOUVRER</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Lignes de données Fonctionnement -->
                        <tr
                          v-for="(row, idx) in previewEquilibreFonctionnement"
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
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totauxEquilibre.fonctionnement.depenses.mandat) }}</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totauxEquilibre.fonctionnement.depenses.paiement) }}</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totauxEquilibre.fonctionnement.depenses.reste) }}</td>
                          <td colspan="2" class="p-2 border-r border-gray-300 dark:border-gray-600">TOTAL RECETTES RÉELLES DE FONCTIONNEMENT</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totauxEquilibre.fonctionnement.recettes.or) }}</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totauxEquilibre.fonctionnement.recettes.recouvrement) }}</td>
                          <td class="p-2 text-right font-mono">{{ formatNumber(totauxEquilibre.fonctionnement.recettes.reste) }}</td>
                        </tr>

                        <!-- Dépenses/Recettes d'ordre -->
                        <tr class="bg-gray-50 dark:bg-gray-750 text-xs border-b border-gray-200 dark:border-gray-600">
                          <td class="p-2 font-mono text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">12</td>
                          <td class="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">EXCÉDENT DE FONCTIONNEMENT</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 font-mono text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">774</td>
                          <td class="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">PRODUCTION IMMOBILISÉE</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono">-</td>
                        </tr>

                        <!-- TOTAL D'ORDRE -->
                        <tr class="bg-gray-100 dark:bg-gray-700 text-xs">
                          <td colspan="2" class="p-2 border-r border-gray-300 dark:border-gray-600">TOTAL DÉPENSES D'ORDRE DE FONCTIONNEMENT</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">-</td>
                          <td colspan="2" class="p-2 border-r border-gray-300 dark:border-gray-600">TOTAL RECETTES D'ORDRE DE FONCTIONNEMENT</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono">-</td>
                        </tr>

                        <!-- TOTAL GÉNÉRAL FONCTIONNEMENT -->
                        <tr class="bg-blue-600 text-white font-bold text-xs">
                          <td colspan="2" class="p-2 border-r border-blue-500">TOTAL DÉPENSES DE FONCTIONNEMENT (2)</td>
                          <td class="p-2 text-right font-mono border-r border-blue-500">{{ formatNumber(totauxEquilibre.fonctionnement.depenses.mandat) }}</td>
                          <td class="p-2 text-right font-mono border-r border-blue-500">{{ formatNumber(totauxEquilibre.fonctionnement.depenses.paiement) }}</td>
                          <td class="p-2 text-right font-mono border-r border-blue-500">{{ formatNumber(totauxEquilibre.fonctionnement.depenses.reste) }}</td>
                          <td colspan="2" class="p-2 border-r border-blue-500">TOTAL RECETTES DE FONCTIONNEMENT (1)</td>
                          <td class="p-2 text-right font-mono border-r border-blue-500">{{ formatNumber(totauxEquilibre.fonctionnement.recettes.or) }}</td>
                          <td class="p-2 text-right font-mono border-r border-blue-500">{{ formatNumber(totauxEquilibre.fonctionnement.recettes.recouvrement) }}</td>
                          <td class="p-2 text-right font-mono">{{ formatNumber(totauxEquilibre.fonctionnement.recettes.reste) }}</td>
                        </tr>

                        <!-- EXCÉDENT/DÉFICIT FONCTIONNEMENT -->
                        <tr class="bg-blue-100 dark:bg-blue-900/30 font-bold text-xs">
                          <td colspan="5" class="p-3 text-center border-r border-blue-200 dark:border-blue-700">
                            <span :class="totauxEquilibre.fonctionnement.solde >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                              {{ totauxEquilibre.fonctionnement.solde >= 0 ? 'EXCÉDENT' : 'DÉFICIT' }} DE FONCTIONNEMENT (1) - (2) : {{ formatNumber(Math.abs(totauxEquilibre.fonctionnement.solde)) }} Ar
                            </span>
                          </td>
                          <td colspan="5" class="p-3 text-center">
                            <span :class="totauxEquilibre.fonctionnement.solde < 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'">
                              {{ totauxEquilibre.fonctionnement.solde < 0 ? 'DÉFICIT' : 'EXCÉDENT' }} DE FONCTIONNEMENT (1) - (2) : {{ formatNumber(Math.abs(totauxEquilibre.fonctionnement.solde)) }} Ar
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- SECTION INVESTISSEMENT -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                  <!-- En-tête Section Investissement -->
                  <div class="bg-purple-100 dark:bg-purple-900/30 p-3 text-center border-b border-purple-200 dark:border-purple-700">
                    <h3 class="font-bold text-purple-800 dark:text-purple-300 uppercase">SECTION INVESTISSEMENT</h3>
                  </div>

                  <div class="overflow-x-auto">
                    <table class="w-full border-collapse text-sm">
                      <thead>
                        <tr class="bg-purple-500 text-white text-xs">
                          <th class="p-2 text-left border-r border-purple-400 w-16">COMPTE</th>
                          <th class="p-2 text-left border-r border-purple-400">INTITULÉ</th>
                          <th class="p-2 text-right border-r border-purple-400 w-24">MANDAT ADMIS</th>
                          <th class="p-2 text-right border-r border-purple-400 w-24">PAIEMENT</th>
                          <th class="p-2 text-right border-r border-purple-400 w-24">RESTE À PAYER</th>
                          <th class="p-2 text-left border-r border-purple-400 w-16">COMPTE</th>
                          <th class="p-2 text-left border-r border-purple-400">INTITULÉ</th>
                          <th class="p-2 text-right border-r border-purple-400 w-24">OR ADMIS</th>
                          <th class="p-2 text-right border-r border-purple-400 w-24">RECOUVREMENT</th>
                          <th class="p-2 text-right w-28">RESTE À RECOUVRER</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Lignes de données Investissement -->
                        <tr
                          v-for="(row, idx) in previewEquilibreInvestissement"
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
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totauxEquilibre.investissement.depenses.mandat) }}</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totauxEquilibre.investissement.depenses.paiement) }}</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totauxEquilibre.investissement.depenses.reste) }}</td>
                          <td colspan="2" class="p-2 border-r border-gray-300 dark:border-gray-600">TOTAL RECETTES RÉELLES D'INVESTISSEMENT</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totauxEquilibre.investissement.recettes.or) }}</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">{{ formatNumber(totauxEquilibre.investissement.recettes.recouvrement) }}</td>
                          <td class="p-2 text-right font-mono">{{ formatNumber(totauxEquilibre.investissement.recettes.reste) }}</td>
                        </tr>

                        <!-- Dépenses/Recettes d'ordre Investissement -->
                        <tr class="bg-gray-50 dark:bg-gray-750 text-xs border-b border-gray-200 dark:border-gray-600">
                          <td class="p-2 font-mono text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">20</td>
                          <td class="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">IMMOBILISATIONS INCORPORELLES</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 font-mono text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">1012</td>
                          <td class="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">DOTATION DE L'ÉTAT</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono">-</td>
                        </tr>
                        <tr class="bg-gray-50 dark:bg-gray-750 text-xs border-b border-gray-200 dark:border-gray-600">
                          <td class="p-2 font-mono text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">21</td>
                          <td class="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">IMMOBILISATIONS CORPORELLES</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 font-mono text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">1064</td>
                          <td class="p-2 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">EXCÉDENT DE FONCT. CAPITALISÉ</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-200 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono">-</td>
                        </tr>

                        <!-- TOTAL D'ORDRE INVESTISSEMENT -->
                        <tr class="bg-gray-100 dark:bg-gray-700 text-xs">
                          <td colspan="2" class="p-2 border-r border-gray-300 dark:border-gray-600">TOTAL DÉPENSES D'ORDRE D'INVESTISSEMENT</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">-</td>
                          <td colspan="2" class="p-2 border-r border-gray-300 dark:border-gray-600">TOTAL RECETTES D'ORDRE D'INVESTISSEMENT</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono border-r border-gray-300 dark:border-gray-600">-</td>
                          <td class="p-2 text-right font-mono">-</td>
                        </tr>

                        <!-- TOTAL GÉNÉRAL INVESTISSEMENT -->
                        <tr class="bg-purple-600 text-white font-bold text-xs">
                          <td colspan="2" class="p-2 border-r border-purple-500">TOTAL DÉPENSES D'INVESTISSEMENT (4)</td>
                          <td class="p-2 text-right font-mono border-r border-purple-500">{{ formatNumber(totauxEquilibre.investissement.depenses.mandat) }}</td>
                          <td class="p-2 text-right font-mono border-r border-purple-500">{{ formatNumber(totauxEquilibre.investissement.depenses.paiement) }}</td>
                          <td class="p-2 text-right font-mono border-r border-purple-500">{{ formatNumber(totauxEquilibre.investissement.depenses.reste) }}</td>
                          <td colspan="2" class="p-2 border-r border-purple-500">TOTAL RECETTES D'INVESTISSEMENT (3)</td>
                          <td class="p-2 text-right font-mono border-r border-purple-500">{{ formatNumber(totauxEquilibre.investissement.recettes.or) }}</td>
                          <td class="p-2 text-right font-mono border-r border-purple-500">{{ formatNumber(totauxEquilibre.investissement.recettes.recouvrement) }}</td>
                          <td class="p-2 text-right font-mono">{{ formatNumber(totauxEquilibre.investissement.recettes.reste) }}</td>
                        </tr>

                        <!-- EXCÉDENT/DÉFICIT INVESTISSEMENT -->
                        <tr class="bg-purple-100 dark:bg-purple-900/30 font-bold text-xs">
                          <td colspan="5" class="p-3 text-center border-r border-purple-200 dark:border-purple-700">
                            <span :class="totauxEquilibre.investissement.solde >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                              {{ totauxEquilibre.investissement.solde >= 0 ? 'EXCÉDENT' : 'DÉFICIT' }} D'INVESTISSEMENT (3) - (4) : {{ formatNumber(Math.abs(totauxEquilibre.investissement.solde)) }} Ar
                            </span>
                          </td>
                          <td colspan="5" class="p-3 text-center">
                            <span :class="totauxEquilibre.investissement.solde < 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'">
                              {{ totauxEquilibre.investissement.solde < 0 ? 'DÉFICIT' : 'EXCÉDENT' }} D'INVESTISSEMENT (3) - (4) : {{ formatNumber(Math.abs(totauxEquilibre.investissement.solde)) }} Ar
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- RÉSUMÉ ÉQUILIBRE GÉNÉRAL -->
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white shadow-xl">
                  <h3 class="text-lg font-bold text-center mb-4 uppercase tracking-wide">Résumé de l'Équilibre Général</h3>

                  <div class="grid grid-cols-3 gap-4">
                    <!-- Fonctionnement -->
                    <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <p class="text-xs opacity-75 mb-1 uppercase">Section Fonctionnement</p>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm">Recettes (1)</span>
                        <span class="font-mono font-semibold text-green-300">{{ formatNumber(totauxEquilibre.fonctionnement.recettes.recouvrement) }}</span>
                      </div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm">Dépenses (2)</span>
                        <span class="font-mono font-semibold text-red-300">{{ formatNumber(totauxEquilibre.fonctionnement.depenses.paiement) }}</span>
                      </div>
                      <div class="border-t border-white/20 pt-2 mt-2">
                        <div class="flex justify-between items-center">
                          <span class="text-sm font-semibold">Solde</span>
                          <span :class="['font-mono font-bold', totauxEquilibre.fonctionnement.solde >= 0 ? 'text-green-300' : 'text-red-300']">
                            {{ formatNumber(totauxEquilibre.fonctionnement.solde) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Investissement -->
                    <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <p class="text-xs opacity-75 mb-1 uppercase">Section Investissement</p>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm">Recettes (3)</span>
                        <span class="font-mono font-semibold text-green-300">{{ formatNumber(totauxEquilibre.investissement.recettes.recouvrement) }}</span>
                      </div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm">Dépenses (4)</span>
                        <span class="font-mono font-semibold text-red-300">{{ formatNumber(totauxEquilibre.investissement.depenses.paiement) }}</span>
                      </div>
                      <div class="border-t border-white/20 pt-2 mt-2">
                        <div class="flex justify-between items-center">
                          <span class="text-sm font-semibold">Solde</span>
                          <span :class="['font-mono font-bold', totauxEquilibre.investissement.solde >= 0 ? 'text-green-300' : 'text-red-300']">
                            {{ formatNumber(totauxEquilibre.investissement.solde) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Général -->
                    <div class="bg-white/20 rounded-lg p-4 backdrop-blur-sm border-2 border-white/30">
                      <p class="text-xs opacity-75 mb-1 uppercase">Équilibre Général</p>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm">Total Recettes</span>
                        <span class="font-mono font-semibold text-green-300">{{ formatNumber(totauxEquilibre.general.recettes.recouvrement) }}</span>
                      </div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm">Total Dépenses</span>
                        <span class="font-mono font-semibold text-red-300">{{ formatNumber(totauxEquilibre.general.depenses.paiement) }}</span>
                      </div>
                      <div class="border-t border-white/30 pt-2 mt-2">
                        <div class="flex justify-between items-center">
                          <span class="text-sm font-bold">SOLDE FINAL</span>
                          <span :class="['font-mono font-bold text-lg', totauxEquilibre.general.solde >= 0 ? 'text-green-300' : 'text-red-300']">
                            {{ formatNumber(totauxEquilibre.general.solde) }} Ar
                          </span>
                        </div>
                        <p class="text-xs text-center mt-2 opacity-75">
                          {{ totauxEquilibre.general.solde >= 0 ? 'Excédent budgétaire' : 'Déficit budgétaire' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions d'export -->
              <div class="mt-6 flex items-center justify-between">
                <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 bg-green-100 dark:bg-green-900/50 rounded border border-green-300"></span>
                    <span>Niveau 1 (Catégorie)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 bg-white dark:bg-gray-800 rounded border border-gray-300"></span>
                    <span>Niveau 2/3 (Détail)</span>
                  </div>
                </div>
                <UiButton
                  variant="primary"
                  :icon="['fas', 'file-excel']"
                  :loading="isExporting"
                  @click="handleExport"
                >
                  Télécharger Excel
                </UiButton>
              </div>
        </div>
      </div>

      <!-- Notes section -->
      <div
        v-if="compte.notes"
        class="mt-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4"
      >
        <h3 class="font-medium text-[var(--text-primary)] mb-2">Notes</h3>
        <p class="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{{ compte.notes }}</p>
      </div>

      <!-- Metadata -->
      <div class="mt-6 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Créé le {{ formatDate(compte.created_at) }}</span>
        <span>Dernière modification le {{ formatDate(compte.updated_at) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { CompteAdministratif, LigneBudgetaire, ColonneDynamique } from '~/types/comptes-administratifs'

// Types pour les tableaux financiers (API /api/v1/tableaux)
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

interface TableauCompletAPI {
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

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const toast = useAppToast()
const comptesService = useComptesAdministratifsService()
const config = useRuntimeConfig()

// Export Excel
const exportComposable = useCompteAdministratifExport()

// ============================================================================
// STATE
// ============================================================================

const compte = ref<CompteAdministratif | null>(null)
const lignes = ref<LigneBudgetaire[]>([])
const colonnes = ref<ColonneDynamique[]>([])
const isLoading = ref(true)
const isLoadingLignes = ref(false)
const isLoadingTableau = ref(false)
const error = ref<string | null>(null)
const activeSheet = ref<'RECETTE' | 'DEPENSES' | 'EQUILIBRE'>('RECETTE')

// Données des tableaux (API)
const tableauComplet = ref<TableauCompletAPI | null>(null)
const useMockData = ref(false) // Flag pour utiliser les données mock si l'API échoue

// Action states
const isValidating = ref(false)
const isPublishing = ref(false)
const isExporting = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================

const compteId = computed(() => route.params.id as string)

const collectiviteName = computed(() => {
  if (!compte.value) return ''
  return compte.value.commune?.nom || compte.value.district?.nom || compte.value.region?.nom || 'N/A'
})

const isEditable = computed(() => {
  return compte.value?.statut === 'brouillon' || compte.value?.statut === 'valide'
})

const lignesRecettes = computed(() => {
  return lignes.value.filter(l => l.rubrique?.type === 'recette')
})

const lignesDepenses = computed(() => {
  return lignes.value.filter(l => l.rubrique?.type === 'depense')
})

const lignesEquilibre = computed(() => {
  return lignes.value.filter(l => l.rubrique?.type === 'equilibre')
})

const totaux = computed(() => {
  const recettes = lignesRecettes.value.reduce((sum, l) => {
    const montant = l.valeurs?.realisation || l.valeurs?.prevision || 0
    return sum + (typeof montant === 'number' ? montant : 0)
  }, 0)

  const depenses = lignesDepenses.value.reduce((sum, l) => {
    const montant = l.valeurs?.realisation || l.valeurs?.prevision || 0
    return sum + (typeof montant === 'number' ? montant : 0)
  }, 0)

  return {
    recettes,
    depenses,
    solde: recettes - depenses,
  }
})

// Données mock par défaut pour le développement
const mockRecettesFonctionnement = [
  { code: '70', intitule: 'IMPOTS SUR LES REVENUS, BENEFICES ET GAINS', niveau: 1, budget_primitif: 5000000, budget_additionnel: 500000, modifications: 0, previsions_definitives: 5500000, or_admis: 4800000, recouvrement: 4500000, reste_a_recouvrer: 300000, taux_execution: 0.87 },
  { code: '708', intitule: 'Autres impôts sur les revenus', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, or_admis: 0, recouvrement: 0, reste_a_recouvrer: 0, taux_execution: 0 },
  { code: '7080', intitule: 'Autres impôts - Impôt synthétique', niveau: 3, budget_primitif: 5000000, budget_additionnel: 500000, modifications: 0, previsions_definitives: 5500000, or_admis: 4800000, recouvrement: 4500000, reste_a_recouvrer: 300000, taux_execution: 0.87 },
  { code: '71', intitule: 'IMPOTS SUR LE PATRIMOINE', niveau: 1, budget_primitif: 8000000, budget_additionnel: 1000000, modifications: 200000, previsions_definitives: 9200000, or_admis: 8500000, recouvrement: 8000000, reste_a_recouvrer: 500000, taux_execution: 0.92 },
  { code: '714', intitule: 'Impôts fonciers sur les terrains - IFT', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, or_admis: 0, recouvrement: 0, reste_a_recouvrer: 0, taux_execution: 0 },
  { code: '7140', intitule: 'Impôts fonciers sur les terrains - IFT', niveau: 3, budget_primitif: 4000000, budget_additionnel: 500000, modifications: 100000, previsions_definitives: 4600000, or_admis: 4200000, recouvrement: 4000000, reste_a_recouvrer: 200000, taux_execution: 0.91 },
  { code: '72', intitule: 'IMPOTS ET TAXES SUR BIENS ET SERVICES', niveau: 1, budget_primitif: 3000000, budget_additionnel: 200000, modifications: 0, previsions_definitives: 3200000, or_admis: 2800000, recouvrement: 2600000, reste_a_recouvrer: 200000, taux_execution: 0.88 },
]

// Preview data for Excel visualization - RECETTES DE FONCTIONNEMENT
// Utilise les données de l'API si disponibles, sinon fallback sur mock
const previewRecettesFonctionnement = computed(() => {
  // Si données API disponibles (section 0 = FONCTIONNEMENT)
  const apiSection = tableauComplet.value?.recettes?.sections?.find(s => s.section === 'fonctionnement')
  if (apiSection?.lignes?.length) {
    return apiSection.lignes.map(l => ({
      code: l.code,
      intitule: l.intitule,
      niveau: l.niveau,
      budget_primitif: l.budget_primitif,
      budget_additionnel: l.budget_additionnel,
      modifications: l.modifications,
      previsions_definitives: l.previsions_definitives,
      or_admis: l.or_admis,
      recouvrement: l.recouvrement,
      reste_a_recouvrer: l.reste_a_recouvrer,
      taux_execution: l.taux_execution ? l.taux_execution / 100 : 0,
    }))
  }
  // Fallback mock
  return mockRecettesFonctionnement
})

// Données mock pour recettes investissement
const mockRecettesInvestissement = [
  { code: '20', intitule: 'SUBVENTIONS D\'INVESTISSEMENT', niveau: 1, budget_primitif: 15000000, budget_additionnel: 2000000, modifications: 500000, previsions_definitives: 17500000, or_admis: 16000000, recouvrement: 14500000, reste_a_recouvrer: 1500000, taux_execution: 0.91 },
  { code: '201', intitule: 'Subventions d\'équipement de l\'État', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, or_admis: 0, recouvrement: 0, reste_a_recouvrer: 0, taux_execution: 0 },
  { code: '2010', intitule: 'Dotations d\'équipement des collectivités', niveau: 3, budget_primitif: 10000000, budget_additionnel: 1500000, modifications: 300000, previsions_definitives: 11800000, or_admis: 11000000, recouvrement: 10000000, reste_a_recouvrer: 1000000, taux_execution: 0.91 },
  { code: '21', intitule: 'EMPRUNTS', niveau: 1, budget_primitif: 5000000, budget_additionnel: 0, modifications: 0, previsions_definitives: 5000000, or_admis: 5000000, recouvrement: 5000000, reste_a_recouvrer: 0, taux_execution: 1.0 },
  { code: '211', intitule: 'Emprunts bancaires', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, or_admis: 0, recouvrement: 0, reste_a_recouvrer: 0, taux_execution: 0 },
  { code: '2110', intitule: 'Emprunts à long terme', niveau: 3, budget_primitif: 5000000, budget_additionnel: 0, modifications: 0, previsions_definitives: 5000000, or_admis: 5000000, recouvrement: 5000000, reste_a_recouvrer: 0, taux_execution: 1.0 },
  { code: '22', intitule: 'CESSIONS D\'ACTIFS', niveau: 1, budget_primitif: 2000000, budget_additionnel: 500000, modifications: 0, previsions_definitives: 2500000, or_admis: 2000000, recouvrement: 1800000, reste_a_recouvrer: 200000, taux_execution: 0.80 },
]

// Preview data for Excel visualization - RECETTES D'INVESTISSEMENT
const previewRecettesInvestissement = computed(() => {
  // Si données API disponibles (section INVESTISSEMENT)
  const apiSection = tableauComplet.value?.recettes?.sections?.find(
    (s: SectionTableauRecettesAPI) => s.section === 'investissement'
  )
  if (apiSection?.lignes?.length) {
    return apiSection.lignes.map((l: LigneRecettesAPI) => ({
      code: l.code,
      intitule: l.intitule,
      niveau: l.niveau,
      budget_primitif: l.budget_primitif,
      budget_additionnel: l.budget_additionnel,
      modifications: l.modifications,
      previsions_definitives: l.previsions_definitives,
      or_admis: l.or_admis,
      recouvrement: l.recouvrement,
      reste_a_recouvrer: l.reste_a_recouvrer,
      taux_execution: l.taux_execution ? l.taux_execution / 100 : 0,
    }))
  }
  return mockRecettesInvestissement
})

// Totaux des recettes (Fonctionnement + Investissement + Général)
const totauxRecettes = computed(() => {
  const fonctData = previewRecettesFonctionnement.value.filter(l => l.niveau === 1)
  const investData = previewRecettesInvestissement.value.filter(l => l.niveau === 1)

  const calcTotaux = (data: typeof fonctData) => ({
    bp: data.reduce((s, l) => s + (l.budget_primitif || 0), 0),
    ba: data.reduce((s, l) => s + (l.budget_additionnel || 0), 0),
    modif: data.reduce((s, l) => s + (l.modifications || 0), 0),
    pd: data.reduce((s, l) => s + (l.previsions_definitives || 0), 0),
    or: data.reduce((s, l) => s + (l.or_admis || 0), 0),
    recouvrement: data.reduce((s, l) => s + (l.recouvrement || 0), 0),
    reste: data.reduce((s, l) => s + (l.reste_a_recouvrer || 0), 0),
    taux: 0, // Calculé après
  })

  const fonctionnement = calcTotaux(fonctData)
  fonctionnement.taux = fonctionnement.pd > 0 ? fonctionnement.recouvrement / fonctionnement.pd : 0

  const investissement = calcTotaux(investData)
  investissement.taux = investissement.pd > 0 ? investissement.recouvrement / investissement.pd : 0

  const general = {
    bp: fonctionnement.bp + investissement.bp,
    ba: fonctionnement.ba + investissement.ba,
    modif: fonctionnement.modif + investissement.modif,
    pd: fonctionnement.pd + investissement.pd,
    or: fonctionnement.or + investissement.or,
    recouvrement: fonctionnement.recouvrement + investissement.recouvrement,
    reste: fonctionnement.reste + investissement.reste,
    taux: 0,
  }
  general.taux = general.pd > 0 ? general.recouvrement / general.pd : 0

  return { fonctionnement, investissement, general }
})

// Données mock pour dépenses fonctionnement
const mockDepensesFonctionnement = [
  { code: '60', intitule: 'CHARGES DE PERSONNEL', niveau: 1, budget_primitif: 6000000, budget_additionnel: 500000, modifications: 0, previsions_definitives: 6500000, engagement: 6500000, mandat_admis: 6000000, paiement: 5800000, reste_a_payer: 200000, taux_execution: 0.92 },
  { code: '601', intitule: 'Salaires et accessoires', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, engagement: 0, mandat_admis: 0, paiement: 0, reste_a_payer: 0, taux_execution: 0 },
  { code: '6011', intitule: 'Personnel permanent', niveau: 3, budget_primitif: 4000000, budget_additionnel: 300000, modifications: 0, previsions_definitives: 4300000, engagement: 4300000, mandat_admis: 4000000, paiement: 3900000, reste_a_payer: 100000, taux_execution: 0.93 },
  { code: '61', intitule: 'ACHATS DE BIENS', niveau: 1, budget_primitif: 3000000, budget_additionnel: 200000, modifications: 100000, previsions_definitives: 3300000, engagement: 3300000, mandat_admis: 3000000, paiement: 2800000, reste_a_payer: 200000, taux_execution: 0.91 },
  { code: '611', intitule: 'Achats de biens de fonctionnement', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, engagement: 0, mandat_admis: 0, paiement: 0, reste_a_payer: 0, taux_execution: 0 },
  { code: '6111', intitule: 'Fournitures et articles de bureau', niveau: 3, budget_primitif: 1500000, budget_additionnel: 100000, modifications: 50000, previsions_definitives: 1650000, engagement: 1650000, mandat_admis: 1500000, paiement: 1400000, reste_a_payer: 100000, taux_execution: 0.91 },
  { code: '62', intitule: 'ACHATS DE SERVICES', niveau: 1, budget_primitif: 2000000, budget_additionnel: 150000, modifications: 0, previsions_definitives: 2150000, engagement: 2150000, mandat_admis: 2000000, paiement: 1900000, reste_a_payer: 100000, taux_execution: 0.93 },
]

// Preview data for Excel visualization - DÉPENSES DE FONCTIONNEMENT
const previewDepensesFonctionnement = computed(() => {
  // Si données API disponibles (section FONCTIONNEMENT)
  const apiSection = tableauComplet.value?.depenses?.sections?.find(
    (s: SectionTableauDepensesAPI) => s.section === 'fonctionnement'
  )
  if (apiSection?.lignes?.length) {
    return apiSection.lignes.map((l: LigneDepensesAPI) => ({
      code: l.code,
      intitule: l.intitule,
      niveau: l.niveau,
      budget_primitif: l.budget_primitif,
      budget_additionnel: l.budget_additionnel,
      modifications: l.modifications,
      previsions_definitives: l.previsions_definitives,
      engagement: l.engagement,
      mandat_admis: l.mandat_admis,
      paiement: l.paiement,
      reste_a_payer: l.reste_a_payer,
      taux_execution: l.taux_execution ? l.taux_execution / 100 : 0,
    }))
  }
  return mockDepensesFonctionnement
})

// Données mock pour dépenses investissement
const mockDepensesInvestissement = [
  { code: '20', intitule: 'IMMOBILISATIONS INCORPORELLES', niveau: 1, budget_primitif: 2000000, budget_additionnel: 300000, modifications: 0, previsions_definitives: 2300000, engagement: 2300000, mandat_admis: 2100000, paiement: 2000000, reste_a_payer: 100000, taux_execution: 0.91 },
  { code: '201', intitule: 'Logiciels et brevets', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, engagement: 0, mandat_admis: 0, paiement: 0, reste_a_payer: 0, taux_execution: 0 },
  { code: '2010', intitule: 'Logiciels informatiques', niveau: 3, budget_primitif: 2000000, budget_additionnel: 300000, modifications: 0, previsions_definitives: 2300000, engagement: 2300000, mandat_admis: 2100000, paiement: 2000000, reste_a_payer: 100000, taux_execution: 0.91 },
  { code: '21', intitule: 'IMMOBILISATIONS CORPORELLES', niveau: 1, budget_primitif: 12000000, budget_additionnel: 1500000, modifications: 500000, previsions_definitives: 14000000, engagement: 14000000, mandat_admis: 13000000, paiement: 12000000, reste_a_payer: 1000000, taux_execution: 0.92 },
  { code: '211', intitule: 'Constructions', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, engagement: 0, mandat_admis: 0, paiement: 0, reste_a_payer: 0, taux_execution: 0 },
  { code: '2110', intitule: 'Bâtiments administratifs', niveau: 3, budget_primitif: 8000000, budget_additionnel: 1000000, modifications: 300000, previsions_definitives: 9300000, engagement: 9300000, mandat_admis: 8700000, paiement: 8000000, reste_a_payer: 700000, taux_execution: 0.92 },
  { code: '22', intitule: 'REMBOURSEMENT D\'EMPRUNTS', niveau: 1, budget_primitif: 3000000, budget_additionnel: 0, modifications: 0, previsions_definitives: 3000000, engagement: 3000000, mandat_admis: 3000000, paiement: 3000000, reste_a_payer: 0, taux_execution: 1.0 },
]

// Preview data for Excel visualization - DÉPENSES D'INVESTISSEMENT
const previewDepensesInvestissement = computed(() => {
  // Si données API disponibles (section INVESTISSEMENT)
  const apiSection = tableauComplet.value?.depenses?.sections?.find(
    (s: SectionTableauDepensesAPI) => s.section === 'investissement'
  )
  if (apiSection?.lignes?.length) {
    return apiSection.lignes.map((l: LigneDepensesAPI) => ({
      code: l.code,
      intitule: l.intitule,
      niveau: l.niveau,
      budget_primitif: l.budget_primitif,
      budget_additionnel: l.budget_additionnel,
      modifications: l.modifications,
      previsions_definitives: l.previsions_definitives,
      engagement: l.engagement,
      mandat_admis: l.mandat_admis,
      paiement: l.paiement,
      reste_a_payer: l.reste_a_payer,
      taux_execution: l.taux_execution ? l.taux_execution / 100 : 0,
    }))
  }
  return mockDepensesInvestissement
})

// Totaux des dépenses (Fonctionnement + Investissement + Général)
const totauxDepenses = computed(() => {
  const fonctData = previewDepensesFonctionnement.value.filter(l => l.niveau === 1)
  const investData = previewDepensesInvestissement.value.filter(l => l.niveau === 1)

  const calcTotaux = (data: typeof fonctData) => ({
    bp: data.reduce((s, l) => s + (l.budget_primitif || 0), 0),
    ba: data.reduce((s, l) => s + (l.budget_additionnel || 0), 0),
    modif: data.reduce((s, l) => s + (l.modifications || 0), 0),
    pd: data.reduce((s, l) => s + (l.previsions_definitives || 0), 0),
    engagement: data.reduce((s, l) => s + (l.engagement || 0), 0),
    mandat: data.reduce((s, l) => s + (l.mandat_admis || 0), 0),
    paiement: data.reduce((s, l) => s + (l.paiement || 0), 0),
    reste: data.reduce((s, l) => s + (l.reste_a_payer || 0), 0),
    taux: 0,
  })

  const fonctionnement = calcTotaux(fonctData)
  fonctionnement.taux = fonctionnement.pd > 0 ? fonctionnement.paiement / fonctionnement.pd : 0

  const investissement = calcTotaux(investData)
  investissement.taux = investissement.pd > 0 ? investissement.paiement / investissement.pd : 0

  const general = {
    bp: fonctionnement.bp + investissement.bp,
    ba: fonctionnement.ba + investissement.ba,
    modif: fonctionnement.modif + investissement.modif,
    pd: fonctionnement.pd + investissement.pd,
    engagement: fonctionnement.engagement + investissement.engagement,
    mandat: fonctionnement.mandat + investissement.mandat,
    paiement: fonctionnement.paiement + investissement.paiement,
    reste: fonctionnement.reste + investissement.reste,
    taux: 0,
  }
  general.taux = general.pd > 0 ? general.paiement / general.pd : 0

  return { fonctionnement, investissement, general }
})

// Preview Recettes (combined - kept for equilibre table)
const previewRecettes = computed(() => {
  return [...previewRecettesFonctionnement.value, ...previewRecettesInvestissement.value]
})

// Preview Dépenses (combined - kept for equilibre table)
const previewDepenses = computed(() => {
  return [...previewDepensesFonctionnement.value, ...previewDepensesInvestissement.value]
})

// Équilibre Fonctionnement (Dépenses Fonct. vs Recettes Fonct.)
const previewEquilibreFonctionnement = computed(() => {
  const depN1 = previewDepensesFonctionnement.value.filter(l => l.niveau === 1)
  const recN1 = previewRecettesFonctionnement.value.filter(l => l.niveau === 1)
  const maxLen = Math.max(depN1.length, recN1.length)
  const rows = []
  for (let i = 0; i < maxLen; i++) {
    rows.push({
      depense: depN1[i] || null,
      recette: recN1[i] || null,
    })
  }
  return rows
})

// Équilibre Investissement (Dépenses Invest. vs Recettes Invest.)
const previewEquilibreInvestissement = computed(() => {
  const depN1 = previewDepensesInvestissement.value.filter(l => l.niveau === 1)
  const recN1 = previewRecettesInvestissement.value.filter(l => l.niveau === 1)
  const maxLen = Math.max(depN1.length, recN1.length)
  const rows = []
  for (let i = 0; i < maxLen; i++) {
    rows.push({
      depense: depN1[i] || null,
      recette: recN1[i] || null,
    })
  }
  return rows
})

// Totaux Équilibre (Fonctionnement + Investissement + Général)
const totauxEquilibre = computed(() => {
  // Fonctionnement
  const depFonctN1 = previewDepensesFonctionnement.value.filter(l => l.niveau === 1)
  const recFonctN1 = previewRecettesFonctionnement.value.filter(l => l.niveau === 1)

  const fonctDepenses = {
    mandat: depFonctN1.reduce((s, l) => s + (l.mandat_admis || 0), 0),
    paiement: depFonctN1.reduce((s, l) => s + (l.paiement || 0), 0),
    reste: depFonctN1.reduce((s, l) => s + (l.reste_a_payer || 0), 0),
  }
  const fonctRecettes = {
    or: recFonctN1.reduce((s, l) => s + (l.or_admis || 0), 0),
    recouvrement: recFonctN1.reduce((s, l) => s + (l.recouvrement || 0), 0),
    reste: recFonctN1.reduce((s, l) => s + (l.reste_a_recouvrer || 0), 0),
  }
  const fonctSolde = fonctRecettes.recouvrement - fonctDepenses.paiement

  // Investissement
  const depInvestN1 = previewDepensesInvestissement.value.filter(l => l.niveau === 1)
  const recInvestN1 = previewRecettesInvestissement.value.filter(l => l.niveau === 1)

  const investDepenses = {
    mandat: depInvestN1.reduce((s, l) => s + (l.mandat_admis || 0), 0),
    paiement: depInvestN1.reduce((s, l) => s + (l.paiement || 0), 0),
    reste: depInvestN1.reduce((s, l) => s + (l.reste_a_payer || 0), 0),
  }
  const investRecettes = {
    or: recInvestN1.reduce((s, l) => s + (l.or_admis || 0), 0),
    recouvrement: recInvestN1.reduce((s, l) => s + (l.recouvrement || 0), 0),
    reste: recInvestN1.reduce((s, l) => s + (l.reste_a_recouvrer || 0), 0),
  }
  const investSolde = investRecettes.recouvrement - investDepenses.paiement

  // Général
  const generalDepenses = {
    mandat: fonctDepenses.mandat + investDepenses.mandat,
    paiement: fonctDepenses.paiement + investDepenses.paiement,
    reste: fonctDepenses.reste + investDepenses.reste,
  }
  const generalRecettes = {
    or: fonctRecettes.or + investRecettes.or,
    recouvrement: fonctRecettes.recouvrement + investRecettes.recouvrement,
    reste: fonctRecettes.reste + investRecettes.reste,
  }
  const generalSolde = generalRecettes.recouvrement - generalDepenses.paiement

  return {
    fonctionnement: {
      depenses: fonctDepenses,
      recettes: fonctRecettes,
      solde: fonctSolde,
    },
    investissement: {
      depenses: investDepenses,
      recettes: investRecettes,
      solde: investSolde,
    },
    general: {
      depenses: generalDepenses,
      recettes: generalRecettes,
      solde: generalSolde,
    },
  }
})

// ============================================================================
// METHODS
// ============================================================================

const loadCompte = async () => {
  isLoading.value = true
  error.value = null

  try {
    compte.value = await comptesService.getCompte(compteId.value)
    await Promise.all([loadLignes(), loadColonnes(), loadTableauComplet()])
  } catch (err: any) {
    console.error('Erreur lors du chargement du compte:', err)
    error.value = err.message || 'Erreur lors du chargement du compte administratif'
    toast.error(error.value)
  } finally {
    isLoading.value = false
  }
}

// Charge le tableau complet depuis l'API /api/v1/tableaux
const loadTableauComplet = async () => {
  if (!compte.value?.commune_id || !compte.value?.annee) return

  isLoadingTableau.value = true
  try {
    const apiBaseUrl = config.public.apiBaseUrl
    const response = await $fetch<TableauCompletAPI>(`${apiBaseUrl}/api/v1/tableaux`, {
      params: {
        commune_id: compte.value.commune_id,
        exercice_annee: compte.value.annee,
      },
    })
    tableauComplet.value = response
    console.log('Tableau chargé depuis l\'API:', response)
  } catch (err: any) {
    console.error('Erreur lors du chargement du tableau:', err.message)
    toast.error('Erreur lors du chargement des données financières')
  } finally {
    isLoadingTableau.value = false
  }
}

// Génère un compte mock pour le développement
// Format ID attendu: {commune_id}-{exercice_id}
const generateMockCompte = (id: string): CompteAdministratif => {
  const communes = [
    'Antananarivo Renivohitra', 'Toamasina I', 'Antsirabe I',
    'Fianarantsoa I', 'Mahajanga I', 'Toliara I', 'Antsiranana I', 'Ambatondrazaka'
  ]

  // Parse l'ID au format {commune_id}-{exercice_id}
  const parts = id.split('-')
  const communeId = parts[0] || '1'
  const exerciceId = parts[1] || '1'
  const idx = parseInt(communeId) - 1 || 0
  const exerciceIdx = parseInt(exerciceId) - 1 || 0

  const communeNom = communes[idx % communes.length]
  const currentYear = new Date().getFullYear()

  return {
    id,
    commune_id: communeId,
    commune: { id: communeId, code: `COM${communeId.padStart(3, '0')}`, nom: communeNom } as any,
    district_id: null,
    district: null,
    region_id: null,
    region: null,
    annee: currentYear - exerciceIdx,
    statut: idx % 3 === 0 ? 'brouillon' : idx % 3 === 1 ? 'valide' : 'publie',
    notes: 'Compte administratif de démonstration',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Génère des lignes budgétaires mock
const generateMockLignes = (): LigneBudgetaire[] => {
  const rubriquesRecettes = [
    { code: '70', intitule: 'IMPOTS SUR LES REVENUS' },
    { code: '71', intitule: 'IMPOTS SUR LE PATRIMOINE' },
    { code: '72', intitule: 'IMPOTS SUR LES BIENS ET SERVICES' },
    { code: '73', intitule: 'DROITS ET TAXES DIVERSES' },
  ]
  const rubriquesDepenses = [
    { code: '60', intitule: 'CHARGES DE PERSONNEL' },
    { code: '61', intitule: 'ACHATS DE BIENS' },
    { code: '62', intitule: 'ACHATS DE SERVICES' },
    { code: '63', intitule: 'CHARGES FINANCIERES' },
  ]

  const lignes: LigneBudgetaire[] = []
  let idCounter = 1

  // Recettes
  rubriquesRecettes.forEach(r => {
    lignes.push({
      id: String(idCounter++),
      compte_administratif_id: compteId.value,
      rubrique_id: r.code,
      rubrique: { id: r.code, code: r.code, intitule: r.intitule, type: 'recette' } as any,
      valeurs: {
        budget_primitif: Math.floor(Math.random() * 50000000) + 10000000,
        prevision: Math.floor(Math.random() * 60000000) + 15000000,
        realisation: Math.floor(Math.random() * 55000000) + 12000000,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  })

  // Dépenses
  rubriquesDepenses.forEach(r => {
    lignes.push({
      id: String(idCounter++),
      compte_administratif_id: compteId.value,
      rubrique_id: r.code,
      rubrique: { id: r.code, code: r.code, intitule: r.intitule, type: 'depense' } as any,
      valeurs: {
        budget_primitif: Math.floor(Math.random() * 40000000) + 8000000,
        prevision: Math.floor(Math.random() * 45000000) + 10000000,
        realisation: Math.floor(Math.random() * 42000000) + 9000000,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  })

  return lignes
}

// Génère des colonnes mock
const generateMockColonnes = (): ColonneDynamique[] => [
  { id: '1', cle: 'budget_primitif', label: 'Budget Primitif', type_donnee: 'nombre', applicable_a: 'tous', ordre: 1, est_editable: true, est_visible: true, est_active: true } as ColonneDynamique,
  { id: '2', cle: 'prevision', label: 'Prévision', type_donnee: 'nombre', applicable_a: 'tous', ordre: 2, est_editable: true, est_visible: true, est_active: true } as ColonneDynamique,
  { id: '3', cle: 'realisation', label: 'Réalisation', type_donnee: 'nombre', applicable_a: 'tous', ordre: 3, est_editable: true, est_visible: true, est_active: true } as ColonneDynamique,
]

const loadLignes = async () => {
  isLoadingLignes.value = true
  try {
    lignes.value = await comptesService.getLignes(compteId.value)
  } catch (err) {
    console.error('Erreur lors du chargement des lignes:', err)
    toast.error('Erreur lors du chargement des lignes budgétaires')
  } finally {
    isLoadingLignes.value = false
  }
}

const loadColonnes = async () => {
  try {
    colonnes.value = await comptesService.getColonnes({ est_active: true })
  } catch (err) {
    console.error('Erreur lors du chargement des colonnes:', err)
  }
}

const handleLigneUpdate = async (ligne: LigneBudgetaire, valeurs: Record<string, any>) => {
  try {
    await comptesService.updateLigne(compteId.value, ligne.id, { valeurs })
    // Update local state
    const index = lignes.value.findIndex(l => l.id === ligne.id)
    if (index !== -1) {
      lignes.value[index] = { ...lignes.value[index], valeurs }
    }
    toast.success('Ligne mise à jour')
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de la mise à jour')
  }
}

const handleValider = async () => {
  if (!compte.value) return

  isValidating.value = true
  try {
    compte.value = await comptesService.validerCompte(compte.value.id)
    toast.success('Compte validé avec succès')
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de la validation')
  } finally {
    isValidating.value = false
  }
}

const handlePublier = async () => {
  if (!compte.value) return

  isPublishing.value = true
  try {
    compte.value = await comptesService.publierCompte(compte.value.id)
    toast.success('Compte publié avec succès')
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de la publication')
  } finally {
    isPublishing.value = false
  }
}

const handleExport = async () => {
  if (!compte.value) return

  isExporting.value = true
  try {
    // Pour l'instant, utiliser les données de démonstration
    // À remplacer par les vraies données quand l'API sera prête
    await exportComposable.exportDemoData(collectiviteName.value, compte.value.annee)
  } catch (err: any) {
    console.error('Erreur lors de l\'export:', err)
    toast.error('Erreur lors de l\'export Excel')
  } finally {
    isExporting.value = false
  }
}

// Helpers
const getSheetButtonActiveStyle = (color: string): Record<string, string> => {
  const gradients: Record<string, string> = {
    green: 'linear-gradient(to right, #16a34a, #059669)',
    red: 'linear-gradient(to right, #dc2626, #e11d48)',
    blue: 'linear-gradient(to right, #2563eb, #4f46e5)',
  }
  return {
    background: gradients[color] || gradients.blue,
    color: 'white',
  }
}

const getStatutVariant = (statut: string): string => {
  const variants: Record<string, string> = {
    brouillon: 'warning',
    valide: 'info',
    publie: 'success',
    archive: 'default',
  }
  return variants[statut] || 'default'
}

const getStatutLabel = (statut: string): string => {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    valide: 'Validé',
    publie: 'Publié',
    archive: 'Archivé',
  }
  return labels[statut] || statut
}

const formatMontant = (montant: number): string => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant) + ' Ar'
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || value === 0) return ''
  return new Intl.NumberFormat('fr-FR').format(value)
}

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || value === 0) return ''
  return (value * 100).toFixed(1) + '%'
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadCompte()
})
</script>
