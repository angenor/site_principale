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

      <!-- Tabs -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
        <UiTabs v-model="activeTab" variant="underline">
          <UiTabPanel name="recettes" label="Recettes">
            <div class="p-4">
              <AdminComptesLignesTable
                :lignes="lignesRecettes"
                :colonnes="colonnes"
                :loading="isLoadingLignes"
                :editable="isEditable"
                @update="handleLigneUpdate"
              />
            </div>
          </UiTabPanel>

          <UiTabPanel name="depenses" label="Dépenses">
            <div class="p-4">
              <AdminComptesLignesTable
                :lignes="lignesDepenses"
                :colonnes="colonnes"
                :loading="isLoadingLignes"
                :editable="isEditable"
                @update="handleLigneUpdate"
              />
            </div>
          </UiTabPanel>

          <UiTabPanel name="equilibre" label="Équilibre">
            <div class="p-4">
              <AdminComptesLignesTable
                :lignes="lignesEquilibre"
                :colonnes="colonnes"
                :loading="isLoadingLignes"
                :editable="isEditable"
                @update="handleLigneUpdate"
              />
            </div>
          </UiTabPanel>

          <UiTabPanel name="apercu" label="Aperçu Excel">
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
                  :class="[
                    'px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2',
                    activeSheet === sheet.id
                      ? sheet.color === 'green' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' :
                        sheet.color === 'red' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg' :
                        'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  ]"
                  @click="activeSheet = sheet.id"
                >
                  <font-awesome-icon :icon="['fas', sheet.icon]" />
                  {{ sheet.label }}
                </button>
              </div>

              <!-- Tableau RECETTES -->
              <div v-if="activeSheet === 'RECETTE'" class="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
                    <font-awesome-icon :icon="['fas', 'arrow-trend-up']" class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">TABLEAU DÉTAILLÉ DES RECETTES</h3>
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
                        v-for="ligne in previewRecettes"
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
                      <!-- Total -->
                      <tr class="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
                        <td class="p-3 border border-green-500/50">TOTAL RECETTES</td>
                        <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(16000000) }}</td>
                        <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(1700000) }}</td>
                        <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(200000) }}</td>
                        <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(17900000) }}</td>
                        <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(16100000) }}</td>
                        <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(15100000) }}</td>
                        <td class="text-right p-3 border border-green-500/50 font-mono">{{ formatNumber(1000000) }}</td>
                        <td class="text-right p-3 border border-green-500/50 font-mono">90.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Tableau DÉPENSES -->
              <div v-else-if="activeSheet === 'DEPENSES'" class="bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="bg-gradient-to-r from-red-600 to-rose-600 p-3 rounded-xl shadow-lg">
                    <font-awesome-icon :icon="['fas', 'arrow-trend-down']" class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">TABLEAU DÉTAILLÉ DES DÉPENSES</h3>
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
                        v-for="ligne in previewDepenses"
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
                      <!-- Total -->
                      <tr class="bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold">
                        <td class="p-3 border border-red-500/50">TOTAL DÉPENSES</td>
                        <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxEquilibre.depenses.mandat) }}</td>
                        <td class="text-right p-3 border border-red-500/50 font-mono">-</td>
                        <td class="text-right p-3 border border-red-500/50 font-mono">-</td>
                        <td class="text-right p-3 border border-red-500/50 font-mono">-</td>
                        <td class="text-right p-3 border border-red-500/50 font-mono">-</td>
                        <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxEquilibre.depenses.mandat) }}</td>
                        <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxEquilibre.depenses.paiement) }}</td>
                        <td class="text-right p-3 border border-red-500/50 font-mono">{{ formatNumber(totauxEquilibre.depenses.reste) }}</td>
                        <td class="text-right p-3 border border-red-500/50 font-mono">91.5%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Tableau ÉQUILIBRE -->
              <div v-else class="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                    <font-awesome-icon :icon="['fas', 'scale-balanced']" class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">TABLEAU D'ÉQUILIBRE</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ collectiviteName }} - Exercice {{ compte?.annee }}</p>
                  </div>
                </div>

                <div class="overflow-x-auto rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-xl">
                  <table class="w-full border-collapse text-sm bg-white dark:bg-gray-800">
                    <thead>
                      <tr class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <th colspan="5" class="p-3 text-center border-r border-blue-500/50 bg-red-600/30">DÉPENSES</th>
                        <th colspan="5" class="p-3 text-center bg-green-600/30">RECETTES</th>
                      </tr>
                      <tr class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs">
                        <th class="p-2 text-left border-r border-blue-400/50">COMPTE</th>
                        <th class="p-2 text-left border-r border-blue-400/50">INTITULÉS</th>
                        <th class="p-2 text-right border-r border-blue-400/50">MANDAT ADMIS</th>
                        <th class="p-2 text-right border-r border-blue-400/50">PAIEMENT</th>
                        <th class="p-2 text-right border-r border-blue-400/50">RESTE À PAYER</th>
                        <th class="p-2 text-left border-r border-blue-400/50">COMPTE</th>
                        <th class="p-2 text-left border-r border-blue-400/50">INTITULÉS</th>
                        <th class="p-2 text-right border-r border-blue-400/50">OR ADMIS</th>
                        <th class="p-2 text-right border-r border-blue-400/50">RECOUVREMENT</th>
                        <th class="p-2 text-right">RESTE À RECOUVRER</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(row, idx) in previewEquilibre"
                        :key="idx"
                        class="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <td class="p-2 border border-gray-200 dark:border-gray-600 font-mono text-xs bg-red-50/50 dark:bg-red-900/10">{{ row.depense?.code }}</td>
                        <td class="p-2 border border-gray-200 dark:border-gray-600 text-sm font-medium bg-red-50/50 dark:bg-red-900/10">{{ row.depense?.intitule }}</td>
                        <td class="p-2 border border-gray-200 dark:border-gray-600 text-right font-mono bg-red-50/50 dark:bg-red-900/10">{{ formatNumber(row.depense?.mandat_admis) }}</td>
                        <td class="p-2 border border-gray-200 dark:border-gray-600 text-right font-mono bg-red-50/50 dark:bg-red-900/10">{{ formatNumber(row.depense?.paiement) }}</td>
                        <td class="p-2 border border-gray-200 dark:border-gray-600 text-right font-mono bg-red-50/50 dark:bg-red-900/10">{{ formatNumber(row.depense?.reste_a_payer) }}</td>
                        <td class="p-2 border border-gray-200 dark:border-gray-600 font-mono text-xs bg-green-50/50 dark:bg-green-900/10">{{ row.recette?.code }}</td>
                        <td class="p-2 border border-gray-200 dark:border-gray-600 text-sm font-medium bg-green-50/50 dark:bg-green-900/10">{{ row.recette?.intitule }}</td>
                        <td class="p-2 border border-gray-200 dark:border-gray-600 text-right font-mono bg-green-50/50 dark:bg-green-900/10">{{ formatNumber(row.recette?.or_admis) }}</td>
                        <td class="p-2 border border-gray-200 dark:border-gray-600 text-right font-mono bg-green-50/50 dark:bg-green-900/10">{{ formatNumber(row.recette?.recouvrement) }}</td>
                        <td class="p-2 border border-gray-200 dark:border-gray-600 text-right font-mono bg-green-50/50 dark:bg-green-900/10">{{ formatNumber(row.recette?.reste_a_recouvrer) }}</td>
                      </tr>
                      <!-- Totaux -->
                      <tr class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold">
                        <td colspan="2" class="p-3 border border-blue-500/50">TOTAL DÉPENSES</td>
                        <td class="p-3 border border-blue-500/50 text-right font-mono">{{ formatNumber(totauxEquilibre.depenses.mandat) }}</td>
                        <td class="p-3 border border-blue-500/50 text-right font-mono">{{ formatNumber(totauxEquilibre.depenses.paiement) }}</td>
                        <td class="p-3 border border-blue-500/50 text-right font-mono">{{ formatNumber(totauxEquilibre.depenses.reste) }}</td>
                        <td colspan="2" class="p-3 border border-blue-500/50">TOTAL RECETTES</td>
                        <td class="p-3 border border-blue-500/50 text-right font-mono">{{ formatNumber(totauxEquilibre.recettes.or) }}</td>
                        <td class="p-3 border border-blue-500/50 text-right font-mono">{{ formatNumber(totauxEquilibre.recettes.recouvrement) }}</td>
                        <td class="p-3 border border-blue-500/50 text-right font-mono">{{ formatNumber(totauxEquilibre.recettes.reste) }}</td>
                      </tr>
                      <!-- Solde -->
                      <tr class="bg-gray-100 dark:bg-gray-700 font-bold">
                        <td colspan="5" class="p-3 border border-gray-200 dark:border-gray-600 text-center">
                          <span class="text-red-600 dark:text-red-400">Total Dépenses: {{ formatNumber(totauxEquilibre.depenses.paiement) }} Ar</span>
                        </td>
                        <td colspan="5" class="p-3 border border-gray-200 dark:border-gray-600 text-center">
                          <span class="text-green-600 dark:text-green-400">Total Recettes: {{ formatNumber(totauxEquilibre.recettes.recouvrement) }} Ar</span>
                        </td>
                      </tr>
                      <tr class="bg-blue-100 dark:bg-blue-900/50 font-bold">
                        <td colspan="10" class="p-4 text-center text-lg">
                          <span>SOLDE: </span>
                          <span :class="totauxEquilibre.recettes.recouvrement - totauxEquilibre.depenses.paiement >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                            {{ formatNumber(totauxEquilibre.recettes.recouvrement - totauxEquilibre.depenses.paiement) }} Ar
                            {{ totauxEquilibre.recettes.recouvrement - totauxEquilibre.depenses.paiement >= 0 ? '(Excédent)' : '(Déficit)' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
          </UiTabPanel>

          <UiTabPanel name="historique" label="Historique">
            <div class="p-4">
              <div class="text-center py-8 text-[var(--text-muted)]">
                <font-awesome-icon :icon="['fas', 'history']" class="text-4xl mb-3" />
                <p>Historique des modifications à venir</p>
              </div>
            </div>
          </UiTabPanel>
        </UiTabs>
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

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const toast = useAppToast()
const comptesService = useComptesAdministratifsService()

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
const error = ref<string | null>(null)
const activeTab = ref('recettes')
const activeSheet = ref<'RECETTE' | 'DEPENSES' | 'EQUILIBRE'>('RECETTE')

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

// Preview data for Excel visualization
const previewRecettes = computed(() => {
  return [
    { code: '70', intitule: 'IMPOTS SUR LES REVENUS, BENEFICES ET GAINS', niveau: 1, budget_primitif: 5000000, budget_additionnel: 500000, modifications: 0, previsions_definitives: 5500000, or_admis: 4800000, recouvrement: 4500000, reste_a_recouvrer: 300000, taux_execution: 0.87 },
    { code: '708', intitule: 'Autres impôts sur les revenus', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, or_admis: 0, recouvrement: 0, reste_a_recouvrer: 0, taux_execution: 0 },
    { code: '7080', intitule: 'Autres impôts - Impôt synthétique', niveau: 3, budget_primitif: 5000000, budget_additionnel: 500000, modifications: 0, previsions_definitives: 5500000, or_admis: 4800000, recouvrement: 4500000, reste_a_recouvrer: 300000, taux_execution: 0.87 },
    { code: '71', intitule: 'IMPOTS SUR LE PATRIMOINE', niveau: 1, budget_primitif: 8000000, budget_additionnel: 1000000, modifications: 200000, previsions_definitives: 9200000, or_admis: 8500000, recouvrement: 8000000, reste_a_recouvrer: 500000, taux_execution: 0.92 },
    { code: '714', intitule: 'Impôts fonciers sur les terrains - IFT', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, or_admis: 0, recouvrement: 0, reste_a_recouvrer: 0, taux_execution: 0 },
    { code: '7140', intitule: 'Impôts fonciers sur les terrains - IFT', niveau: 3, budget_primitif: 4000000, budget_additionnel: 500000, modifications: 100000, previsions_definitives: 4600000, or_admis: 4200000, recouvrement: 4000000, reste_a_recouvrer: 200000, taux_execution: 0.91 },
    { code: '715', intitule: 'Impôt foncier sur les propriétés bâties – IFPB', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, or_admis: 0, recouvrement: 0, reste_a_recouvrer: 0, taux_execution: 0 },
    { code: '7151', intitule: 'Impôt foncier sur les propriétés bâties – IFPB', niveau: 3, budget_primitif: 4000000, budget_additionnel: 500000, modifications: 100000, previsions_definitives: 4600000, or_admis: 4300000, recouvrement: 4000000, reste_a_recouvrer: 300000, taux_execution: 0.93 },
    { code: '72', intitule: 'IMPOTS ET TAXES SUR BIENS ET SERVICES', niveau: 1, budget_primitif: 3000000, budget_additionnel: 200000, modifications: 0, previsions_definitives: 3200000, or_admis: 2800000, recouvrement: 2600000, reste_a_recouvrer: 200000, taux_execution: 0.88 },
  ]
})

const previewDepenses = computed(() => {
  return [
    { code: '60', intitule: 'CHARGES DE PERSONNEL', niveau: 1, budget_primitif: 6000000, budget_additionnel: 500000, modifications: 0, previsions_definitives: 6500000, engagement: 6500000, mandat_admis: 6000000, paiement: 5800000, reste_a_payer: 200000, taux_execution: 0.92 },
    { code: '601', intitule: 'Salaires et accessoires', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, engagement: 0, mandat_admis: 0, paiement: 0, reste_a_payer: 0, taux_execution: 0 },
    { code: '6011', intitule: 'Personnel permanent', niveau: 3, budget_primitif: 4000000, budget_additionnel: 300000, modifications: 0, previsions_definitives: 4300000, engagement: 4300000, mandat_admis: 4000000, paiement: 3900000, reste_a_payer: 100000, taux_execution: 0.93 },
    { code: '6012', intitule: 'Personnel non permanent', niveau: 3, budget_primitif: 2000000, budget_additionnel: 200000, modifications: 0, previsions_definitives: 2200000, engagement: 2200000, mandat_admis: 2000000, paiement: 1900000, reste_a_payer: 100000, taux_execution: 0.91 },
    { code: '61', intitule: 'ACHATS DE BIENS', niveau: 1, budget_primitif: 3000000, budget_additionnel: 200000, modifications: 100000, previsions_definitives: 3300000, engagement: 3300000, mandat_admis: 3000000, paiement: 2800000, reste_a_payer: 200000, taux_execution: 0.91 },
    { code: '611', intitule: 'Achats de biens de fonctionnement général', niveau: 2, budget_primitif: 0, budget_additionnel: 0, modifications: 0, previsions_definitives: 0, engagement: 0, mandat_admis: 0, paiement: 0, reste_a_payer: 0, taux_execution: 0 },
    { code: '6111', intitule: 'Fournitures et articles de bureau', niveau: 3, budget_primitif: 1500000, budget_additionnel: 100000, modifications: 50000, previsions_definitives: 1650000, engagement: 1650000, mandat_admis: 1500000, paiement: 1400000, reste_a_payer: 100000, taux_execution: 0.91 },
    { code: '62', intitule: 'ACHATS DE SERVICES', niveau: 1, budget_primitif: 2000000, budget_additionnel: 150000, modifications: 0, previsions_definitives: 2150000, engagement: 2150000, mandat_admis: 2000000, paiement: 1900000, reste_a_payer: 100000, taux_execution: 0.93 },
  ]
})

const previewEquilibre = computed(() => {
  const depN1 = previewDepenses.value.filter(l => l.niveau === 1)
  const recN1 = previewRecettes.value.filter(l => l.niveau === 1)
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

const totauxEquilibre = computed(() => {
  const depN1 = previewDepenses.value.filter(l => l.niveau === 1)
  const recN1 = previewRecettes.value.filter(l => l.niveau === 1)
  return {
    depenses: {
      mandat: depN1.reduce((s, l) => s + (l.mandat_admis || 0), 0),
      paiement: depN1.reduce((s, l) => s + (l.paiement || 0), 0),
      reste: depN1.reduce((s, l) => s + (l.reste_a_payer || 0), 0),
    },
    recettes: {
      or: recN1.reduce((s, l) => s + (l.or_admis || 0), 0),
      recouvrement: recN1.reduce((s, l) => s + (l.recouvrement || 0), 0),
      reste: recN1.reduce((s, l) => s + (l.reste_a_recouvrer || 0), 0),
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
    await Promise.all([loadLignes(), loadColonnes()])
  } catch (err: any) {
    console.error('Erreur lors du chargement du compte:', err)
    // Fallback avec données mock pour développement
    compte.value = generateMockCompte(compteId.value)
    lignes.value = generateMockLignes()
    colonnes.value = generateMockColonnes()
  } finally {
    isLoading.value = false
  }
}

// Génère un compte mock pour le développement
const generateMockCompte = (id: string): CompteAdministratif => {
  const communes = [
    'Antananarivo Renivohitra', 'Toamasina I', 'Antsirabe I',
    'Fianarantsoa I', 'Mahajanga I', 'Toliara I', 'Antsiranana I', 'Ambatondrazaka'
  ]
  const idx = parseInt(id) - 1 || 0
  const communeNom = communes[idx % communes.length]
  const currentYear = new Date().getFullYear()

  return {
    id,
    commune_id: id,
    commune: { id, nom: communeNom } as any,
    district_id: null,
    district: null,
    region_id: null,
    region: null,
    annee: currentYear - (idx % 3),
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
