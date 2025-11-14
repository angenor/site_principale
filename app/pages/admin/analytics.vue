<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics & Statistiques</h1>
        <p class="text-gray-600 dark:text-gray-400">Analyses des visites et téléchargements</p>
      </div>
      <div class="flex gap-2">
        <select v-model="selectedPeriod" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
        </select>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Visites</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stats.totalVisites }}</p>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Téléchargements</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stats.totalTelechargements }}</p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Durée Moyenne</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ formatDuration(stats.dureeMovenne) }}</p>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Visiteurs Uniques</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stats.visiteursUniques }}</p>
          </div>
          <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button @click="activeTab = 'visites'" :class="activeTab === 'visites' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Visites Récentes
          </button>
          <button @click="activeTab = 'telechargements'" :class="activeTab === 'telechargements' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Téléchargements
          </button>
          <button @click="activeTab = 'pages'" :class="activeTab === 'pages' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
            Pages Populaires
          </button>
        </nav>
      </div>
    </div>

    <!-- Visites Table -->
    <div v-if="activeTab === 'visites'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Page</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Localisation</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Durée</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Referrer</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="visite in visites" :key="visite.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(visite.created_at) }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ visite.page_url }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ visite.ville || '-' }}, {{ visite.pays || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ formatDuration(visite.duree_visite) }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ visite.referrer || 'Direct' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Téléchargements Table -->
    <div v-if="activeTab === 'telechargements'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Document</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Utilisateur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="download in telechargements" :key="download.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(download.created_at) }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ download.document?.titre || 'Document supprimé' }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ download.user_id ? 'Connecté' : 'Anonyme' }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ download.ip_address || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pages Populaires -->
    <div v-if="activeTab === 'pages'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
      <div v-else class="p-6">
        <div v-for="page in pagesPopulaires" :key="page.url" class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ page.url }}</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ page.count }} visites</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div :style="{ width: `${(page.count / pagesPopulaires[0].count) * 100}%` }" class="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalyticsVisite, AnalyticsTelechargement } from '~/types/autres-modules'

definePageMeta({ layout: 'admin' })

const supabase = useSupabaseClient()
const loading = ref(false)
const activeTab = ref<'visites' | 'telechargements' | 'pages'>('visites')
const selectedPeriod = ref<string>('30')

const visites = ref<AnalyticsVisite[]>([])
const telechargements = ref<AnalyticsTelechargement[]>([])
const pagesPopulaires = ref<Array<{ url: string; count: number }>>([])

const stats = ref({
  totalVisites: 0,
  totalTelechargements: 0,
  dureeMovenne: 0,
  visiteursUniques: 0
})

onMounted(async () => {
  await loadAnalytics()
})

watch(selectedPeriod, async () => {
  await loadAnalytics()
})

async function loadAnalytics() {
  loading.value = true
  try {
    const daysAgo = parseInt(selectedPeriod.value)
    const dateFilter = new Date()
    dateFilter.setDate(dateFilter.getDate() - daysAgo)

    // Load visites
    const { data: visitesData, error: visitesError } = await supabase
      .from('analytics_visites')
      .select('*')
      .gte('created_at', dateFilter.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (visitesError) throw visitesError
    visites.value = visitesData || []

    // Load téléchargements
    const { data: downloadsData, error: downloadsError } = await supabase
      .from('analytics_telechargements')
      .select('*, document:documents(titre)')
      .gte('created_at', dateFilter.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (downloadsError) throw downloadsError
    telechargements.value = downloadsData || []

    // Calculate stats
    stats.value.totalVisites = visites.value.length
    stats.value.totalTelechargements = telechargements.value.length
    stats.value.dureeMovenne = Math.round(
      visites.value.reduce((sum, v) => sum + (v.duree_visite || 0), 0) / (visites.value.length || 1)
    )
    stats.value.visiteursUniques = new Set(visites.value.map(v => v.session_id)).size

    // Calculate pages populaires
    const pageCounts = visites.value.reduce((acc, v) => {
      acc[v.page_url] = (acc[v.page_url] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    pagesPopulaires.value = Object.entries(pageCounts)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

  } catch (err) {
    console.error('Erreur lors du chargement des analytics:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return '-'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}
</script>
