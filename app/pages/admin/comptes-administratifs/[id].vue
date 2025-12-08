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
                          <th
                            v-for="col in colonnesRecettes"
                            :key="'h-rf-' + col.id"
                            class="text-right p-3 font-bold border-r border-green-500/50 whitespace-nowrap"
                            :class="{ 'bg-yellow-600/20': isHighlightedColumn(col.cle) }"
                          >
                            {{ col.label.toUpperCase() }}
                          </th>
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
                          <td
                            v-for="col in colonnesRecettes"
                            :key="'d-rf-' + ligne.code + '-' + col.id"
                            class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono"
                            :class="{
                              'bg-yellow-50 dark:bg-yellow-900/30 font-semibold': isHighlightedColumn(col.cle),
                              'text-gray-700 dark:text-gray-300': !isTauxColumn(col.cle),
                              'font-bold': isTauxColumn(col.cle),
                              'text-green-600 dark:text-green-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) >= 0.9,
                              'text-orange-600 dark:text-orange-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) >= 0.7 && (ligne[col.cle] || 0) < 0.9,
                              'text-red-600 dark:text-red-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) < 0.7
                            }"
                          >
                            {{ getColonneValue(ligne, col.cle, col.type_donnee) }}
                          </td>
                        </tr>
                        <!-- Total Fonctionnement -->
                        <tr class="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
                          <td class="p-3 border border-green-500/50">TOTAL RECETTES FONCTIONNEMENT</td>
                          <td
                            v-for="col in colonnesRecettes"
                            :key="'t-rf-' + col.id"
                            class="text-right p-3 border border-green-500/50 font-mono"
                          >
                            {{ getColonneValue(totauxRecettes.fonctionnement, col.cle, col.type_donnee) }}
                          </td>
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
                          <th
                            v-for="col in colonnesRecettes"
                            :key="'h-ri-' + col.id"
                            class="text-right p-3 font-bold border-r border-teal-500/50 whitespace-nowrap"
                            :class="{ 'bg-yellow-600/20': isHighlightedColumn(col.cle) }"
                          >
                            {{ col.label.toUpperCase() }}
                          </th>
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
                          <td
                            v-for="col in colonnesRecettes"
                            :key="'d-ri-' + ligne.code + '-' + col.id"
                            class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono"
                            :class="{
                              'bg-yellow-50 dark:bg-yellow-900/30 font-semibold': isHighlightedColumn(col.cle),
                              'text-gray-700 dark:text-gray-300': !isTauxColumn(col.cle),
                              'font-bold': isTauxColumn(col.cle),
                              'text-green-600 dark:text-green-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) >= 0.9,
                              'text-orange-600 dark:text-orange-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) >= 0.7 && (ligne[col.cle] || 0) < 0.9,
                              'text-red-600 dark:text-red-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) < 0.7
                            }"
                          >
                            {{ getColonneValue(ligne, col.cle, col.type_donnee) }}
                          </td>
                        </tr>
                        <!-- Total Investissement -->
                        <tr class="bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold">
                          <td class="p-3 border border-teal-500/50">TOTAL RECETTES INVESTISSEMENT</td>
                          <td
                            v-for="col in colonnesRecettes"
                            :key="'t-ri-' + col.id"
                            class="text-right p-3 border border-teal-500/50 font-mono"
                          >
                            {{ getColonneValue(totauxRecettes.investissement, col.cle, col.type_donnee) }}
                          </td>
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
                      <p class="font-mono font-semibold">{{ formatNumber(totauxRecettes.general.budget_primitif) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Prévisions Définitives</span>
                      <p class="font-mono font-semibold">{{ formatNumber(totauxRecettes.general.previsions_definitives) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Reste à Recouvrer</span>
                      <p class="font-mono font-semibold">{{ formatNumber(totauxRecettes.general.reste_a_recouvrer) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Taux d'Exécution</span>
                      <p class="font-mono font-semibold">{{ formatPercent(totauxRecettes.general.taux_execution_recette) }}</p>
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
                          <th
                            v-for="col in colonnesDepenses"
                            :key="'h-df-' + col.id"
                            class="text-right p-3 font-bold border-r border-red-500/50 whitespace-nowrap"
                            :class="{ 'bg-yellow-600/20': isHighlightedColumn(col.cle) }"
                          >
                            {{ col.label.toUpperCase() }}
                          </th>
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
                          <td
                            v-for="col in colonnesDepenses"
                            :key="'d-df-' + ligne.code + '-' + col.id"
                            class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono"
                            :class="{
                              'bg-yellow-50 dark:bg-yellow-900/30 font-semibold': isHighlightedColumn(col.cle),
                              'text-gray-700 dark:text-gray-300': !isTauxColumn(col.cle),
                              'font-bold': isTauxColumn(col.cle),
                              'text-green-600 dark:text-green-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) >= 0.9,
                              'text-orange-600 dark:text-orange-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) >= 0.7 && (ligne[col.cle] || 0) < 0.9,
                              'text-red-600 dark:text-red-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) < 0.7
                            }"
                          >
                            {{ getColonneValue(ligne, col.cle, col.type_donnee) }}
                          </td>
                        </tr>
                        <!-- Total Fonctionnement -->
                        <tr class="bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold">
                          <td class="p-3 border border-red-500/50">TOTAL DÉPENSES FONCTIONNEMENT</td>
                          <td
                            v-for="col in colonnesDepenses"
                            :key="'t-df-' + col.id"
                            class="text-right p-3 border border-red-500/50 font-mono"
                          >
                            {{ getColonneValue(totauxDepenses.fonctionnement, col.cle, col.type_donnee) }}
                          </td>
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
                          <th
                            v-for="col in colonnesDepenses"
                            :key="'h-di-' + col.id"
                            class="text-right p-3 font-bold border-r border-orange-500/50 whitespace-nowrap"
                            :class="{ 'bg-yellow-600/20': isHighlightedColumn(col.cle) }"
                          >
                            {{ col.label.toUpperCase() }}
                          </th>
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
                          <td
                            v-for="col in colonnesDepenses"
                            :key="'d-di-' + ligne.code + '-' + col.id"
                            class="text-right p-3 border border-gray-200 dark:border-gray-600 font-mono"
                            :class="{
                              'bg-yellow-50 dark:bg-yellow-900/30 font-semibold': isHighlightedColumn(col.cle),
                              'text-gray-700 dark:text-gray-300': !isTauxColumn(col.cle),
                              'font-bold': isTauxColumn(col.cle),
                              'text-green-600 dark:text-green-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) >= 0.9,
                              'text-orange-600 dark:text-orange-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) >= 0.7 && (ligne[col.cle] || 0) < 0.9,
                              'text-red-600 dark:text-red-400': isTauxColumn(col.cle) && (ligne[col.cle] || 0) < 0.7
                            }"
                          >
                            {{ getColonneValue(ligne, col.cle, col.type_donnee) }}
                          </td>
                        </tr>
                        <!-- Total Investissement -->
                        <tr class="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold">
                          <td class="p-3 border border-orange-500/50">TOTAL DÉPENSES INVESTISSEMENT</td>
                          <td
                            v-for="col in colonnesDepenses"
                            :key="'t-di-' + col.id"
                            class="text-right p-3 border border-orange-500/50 font-mono"
                          >
                            {{ getColonneValue(totauxDepenses.investissement, col.cle, col.type_donnee) }}
                          </td>
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
                      <p class="font-mono font-semibold">{{ formatNumber(totauxDepenses.general.budget_primitif) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Prévisions Définitives</span>
                      <p class="font-mono font-semibold">{{ formatNumber(totauxDepenses.general.previsions_definitives) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Reste à Payer</span>
                      <p class="font-mono font-semibold">{{ formatNumber(totauxDepenses.general.reste_a_payer) }}</p>
                    </div>
                    <div>
                      <span class="opacity-75">Taux d'Exécution</span>
                      <p class="font-mono font-semibold">{{ formatPercent(totauxDepenses.general.taux_execution_depense) }}</p>
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

// Labels par défaut si les colonnes ne sont pas encore chargées
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

// Récupère le label d'une colonne par sa clé
const getColonneLabel = (cle: string): string => {
  const colonne = colonnes.value.find((c: ColonneDynamique) => c.cle === cle)
  return colonne?.label || defaultLabels[cle] || cle
}

// Colonnes filtrées par type, triées par ordre
const colonnesRecettes = computed(() => {
  return colonnes.value
    .filter((c: ColonneDynamique) =>
      c.est_active && c.est_visible &&
      (c.applicable_a === 'recette' || c.applicable_a === 'tous')
    )
    .sort((a: ColonneDynamique, b: ColonneDynamique) => a.ordre - b.ordre)
})

const colonnesDepenses = computed(() => {
  return colonnes.value
    .filter((c: ColonneDynamique) =>
      c.est_active && c.est_visible &&
      (c.applicable_a === 'depense' || c.applicable_a === 'tous')
    )
    .sort((a: ColonneDynamique, b: ColonneDynamique) => a.ordre - b.ordre)
})

// Récupère la valeur d'une colonne pour une ligne donnée
const getColonneValue = (ligne: Record<string, any>, cle: string, typeDonnee: string): string => {
  const value = ligne[cle]
  if (value === undefined || value === null) return '-'

  if (typeDonnee === 'pourcentage') {
    return formatPercent(value)
  }
  return formatNumber(value)
}

// Détermine si une colonne a un style spécial (surlignée, etc.)
const isHighlightedColumn = (cle: string): boolean => {
  return cle === 'previsions_definitives'
}

// Détermine si une colonne est un taux d'exécution
const isTauxColumn = (cle: string): boolean => {
  return cle.startsWith('taux_')
}

const totaux = computed(() => {
  // Utilisation des totaux généraux de l'API
  const recettes = Number(tableauComplet.value?.recettes?.total_general_or_admis) || 0
  const depenses = Number(tableauComplet.value?.depenses?.total_general_mandat_admis) || 0

  return {
    recettes,
    depenses,
    solde: recettes - depenses,
  }
})

/**
 * Agrège les valeurs des enfants vers les parents dans une hiérarchie
 * @param lignes - Tableau de lignes avec code et niveau
 * @param numericKeys - Clés numériques à agréger
 * @returns Tableau avec les parents contenant les sommes des enfants
 */
const aggregateHierarchicalData = (
  lignes: Record<string, any>[],
  numericKeys: string[]
): Record<string, any>[] => {
  if (!lignes.length) return lignes

  // Créer une map code -> ligne pour un accès rapide
  const codeMap = new Map<string, Record<string, any>>()
  lignes.forEach(l => codeMap.set(l.code, { ...l }))

  // Fonction pour dériver le code parent
  // "2010D" -> "201D", "201D" -> "20D", "701R" -> "70R"
  const getParentCode = (code: string): string | null => {
    // Extraire le suffixe (R ou D) et la partie numérique
    const match = code.match(/^(\d+)([RD])$/)
    if (!match) return null
    const [, numPart, suffix] = match
    if (numPart.length <= 2) return null // Pas de parent au-dessus du niveau 1
    return numPart.slice(0, -1) + suffix
  }

  // Agréger du niveau le plus bas vers le plus haut
  // D'abord niveau 3 -> 2, puis niveau 2 -> 1
  const sortedLignes = [...lignes].sort((a, b) => b.niveau - a.niveau)

  for (const ligne of sortedLignes) {
    const parentCode = getParentCode(ligne.code)
    if (parentCode && codeMap.has(parentCode)) {
      // Important: utiliser la valeur mise à jour depuis codeMap, pas la valeur originale
      const currentLigne = codeMap.get(ligne.code)!
      const parent = codeMap.get(parentCode)!
      for (const key of numericKeys) {
        parent[key] = (parent[key] || 0) + (currentLigne[key] || 0)
      }
    }
  }

  // Retourner dans l'ordre original
  return lignes.map(l => codeMap.get(l.code)!)
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

// Preview data for Excel visualization - RECETTES DE FONCTIONNEMENT
const previewRecettesFonctionnement = computed(() => {
  const apiSection = tableauComplet.value?.recettes?.sections?.find(s => s.section === 'fonctionnement')
  if (apiSection?.lignes?.length) {
    const mapped = apiSection.lignes.map(l => ({
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
    }))
    // Agréger les valeurs des enfants vers les parents
    return aggregateHierarchicalData(mapped, recettesNumericKeys)
  }
  return []
})

// Preview data for Excel visualization - RECETTES D'INVESTISSEMENT
const previewRecettesInvestissement = computed(() => {
  const apiSection = tableauComplet.value?.recettes?.sections?.find(
    (s: SectionTableauRecettesAPI) => s.section === 'investissement'
  )
  if (apiSection?.lignes?.length) {
    const mapped = apiSection.lignes.map((l: LigneRecettesAPI) => ({
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
    }))
    // Agréger les valeurs des enfants vers les parents
    return aggregateHierarchicalData(mapped, recettesNumericKeys)
  }
  return []
})

// Totaux des recettes (Fonctionnement + Investissement + Général)
const totauxRecettes = computed(() => {
  const fonctData = previewRecettesFonctionnement.value.filter(l => l.niveau === 1)
  const investData = previewRecettesInvestissement.value.filter(l => l.niveau === 1)

  const calcTotaux = (data: typeof fonctData): Record<string, number> => {
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
    // Calcul du taux d'exécution
    result.taux_execution_recette = result.previsions_definitives > 0
      ? result.recouvrement / result.previsions_definitives
      : 0
    return result
  }

  const fonctionnement = calcTotaux(fonctData)
  const investissement = calcTotaux(investData)

  const general: Record<string, number> = {
    budget_primitif: fonctionnement.budget_primitif + investissement.budget_primitif,
    budget_additionnel: fonctionnement.budget_additionnel + investissement.budget_additionnel,
    modifications: fonctionnement.modifications + investissement.modifications,
    previsions_definitives: fonctionnement.previsions_definitives + investissement.previsions_definitives,
    or_admis: fonctionnement.or_admis + investissement.or_admis,
    recouvrement: fonctionnement.recouvrement + investissement.recouvrement,
    reste_a_recouvrer: fonctionnement.reste_a_recouvrer + investissement.reste_a_recouvrer,
    taux_execution_recette: 0,
  }
  general.taux_execution_recette = general.previsions_definitives > 0
    ? general.recouvrement / general.previsions_definitives
    : 0

  return { fonctionnement, investissement, general }
})

// Preview data for Excel visualization - DÉPENSES DE FONCTIONNEMENT
const previewDepensesFonctionnement = computed(() => {
  const apiSection = tableauComplet.value?.depenses?.sections?.find(
    (s: SectionTableauDepensesAPI) => s.section === 'fonctionnement'
  )
  if (apiSection?.lignes?.length) {
    const mapped = apiSection.lignes.map((l: LigneDepensesAPI) => ({
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
    }))
    // Agréger les valeurs des enfants vers les parents
    return aggregateHierarchicalData(mapped, depensesNumericKeys)
  }
  return []
})

// Preview data for Excel visualization - DÉPENSES D'INVESTISSEMENT
const previewDepensesInvestissement = computed(() => {
  const apiSection = tableauComplet.value?.depenses?.sections?.find(
    (s: SectionTableauDepensesAPI) => s.section === 'investissement'
  )
  if (apiSection?.lignes?.length) {
    const mapped = apiSection.lignes.map((l: LigneDepensesAPI) => ({
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
    }))
    // Agréger les valeurs des enfants vers les parents
    return aggregateHierarchicalData(mapped, depensesNumericKeys)
  }
  return []
})

// Totaux des dépenses (Fonctionnement + Investissement + Général)
const totauxDepenses = computed(() => {
  const fonctData = previewDepensesFonctionnement.value.filter(l => l.niveau === 1)
  const investData = previewDepensesInvestissement.value.filter(l => l.niveau === 1)

  const calcTotaux = (data: typeof fonctData): Record<string, number> => {
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
    // Calcul du taux d'exécution
    result.taux_execution_depense = result.previsions_definitives > 0
      ? result.paiement / result.previsions_definitives
      : 0
    return result
  }

  const fonctionnement = calcTotaux(fonctData)
  const investissement = calcTotaux(investData)

  const general: Record<string, number> = {
    budget_primitif: fonctionnement.budget_primitif + investissement.budget_primitif,
    budget_additionnel: fonctionnement.budget_additionnel + investissement.budget_additionnel,
    modifications: fonctionnement.modifications + investissement.modifications,
    previsions_definitives: fonctionnement.previsions_definitives + investissement.previsions_definitives,
    engagement: fonctionnement.engagement + investissement.engagement,
    mandat_admis: fonctionnement.mandat_admis + investissement.mandat_admis,
    paiement: fonctionnement.paiement + investissement.paiement,
    reste_a_payer: fonctionnement.reste_a_payer + investissement.reste_a_payer,
    taux_execution_depense: 0,
  }
  general.taux_execution_depense = general.previsions_definitives > 0
    ? general.paiement / general.previsions_definitives
    : 0

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

const formatMontant = (montant: number | string | null | undefined): string => {
  const value = Number(montant)
  if (isNaN(value) || montant === null || montant === undefined) {
    return '0 Ar'
  }
  return new Intl.NumberFormat('fr-MG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' Ar'
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

const formatNumber = (value: number | string | null | undefined): string => {
  const num = Number(value)
  if (isNaN(num) || value === null || value === undefined) return '0'
  return new Intl.NumberFormat('fr-FR').format(num)
}

const formatPercent = (value: number | string | null | undefined): string => {
  const num = Number(value)
  if (isNaN(num) || value === null || value === undefined) return '0%'
  return (num * 100).toFixed(1) + '%'
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadCompte()
})
</script>
