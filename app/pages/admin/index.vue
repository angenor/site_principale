<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Tableau de Bord
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Bienvenue sur le BackOffice de gestion des collectivités territoriales
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Card: Collectivités -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {{ stats.collectivites }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Collectivités territoriales
        </p>
      </div>

      <!-- Card: Projets Miniers -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {{ stats.projets }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Projets miniers actifs
        </p>
      </div>

      <!-- Card: Comptes Administratifs -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {{ stats.comptes }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Comptes administratifs
        </p>
      </div>

      <!-- Card: Utilisateurs -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {{ stats.utilisateurs }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Utilisateurs actifs
        </p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Actions Rapides -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions Rapides
        </h2>
        <div class="space-y-2">
          <NuxtLink
            to="/admin/comptes-administratifs/comptes"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Créer un nouveau compte administratif
            </span>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
          <NuxtLink
            to="/admin/collectivites/communes"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Gérer les collectivités
            </span>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
          <NuxtLink
            to="/admin/projets-miniers/revenus"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Enregistrer des revenus miniers
            </span>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
          <NuxtLink
            to="/admin/utilisateurs"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Gérer les utilisateurs
            </span>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>

      <!-- Activité Récente -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activité Récente
        </h2>
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Nouveau compte administratif créé
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Il y a 2 heures
              </p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Revenus miniers mis à jour
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Il y a 4 heures
              </p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 mt-2 rounded-full bg-purple-600"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Nouvelle commune ajoutée
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Hier
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Items Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Comptes Administratifs Récents
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Collectivité
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Année
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="compte in recentComptes" :key="compte.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ compte.collectivite }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ compte.annee }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  compte.statut === 'Publié' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  compte.statut === 'Validé' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                ]">
                  {{ compte.statut }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {{ compte.date }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  Voir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

// Stats fictives (à remplacer par des données réelles)
const stats = ref({
  collectivites: 119,
  projets: 24,
  comptes: 156,
  utilisateurs: 12
})

// Comptes récents fictifs (à remplacer par des données réelles)
const recentComptes = ref([
  { id: 1, collectivite: 'Commune Urbaine d\'Antananarivo', annee: 2024, statut: 'Publié', date: '15/11/2025' },
  { id: 2, collectivite: 'Région Analamanga', annee: 2024, statut: 'Validé', date: '14/11/2025' },
  { id: 3, collectivite: 'District d\'Ambatondrazaka', annee: 2023, statut: 'Brouillon', date: '12/11/2025' },
  { id: 4, collectivite: 'Commune de Toamasina', annee: 2024, statut: 'Publié', date: '10/11/2025' },
  { id: 5, collectivite: 'Région Atsinanana', annee: 2023, statut: 'Validé', date: '08/11/2025' }
])
</script>
