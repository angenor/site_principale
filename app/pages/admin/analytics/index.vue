<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface AnalyticsData {
  period: number
  summary: {
    totalVisits: number
    uniqueVisitors: number
    totalDownloads: number
    avgVisitsPerDay: number
  }
  visitsByDay: {
    labels: string[]
    data: number[]
  }
  topPages: {
    path: string
    visits: number
  }[]
  referrers: {
    domain: string
    count: number
  }[]
}

const selectedPeriod = ref(30)

const { data: analytics, pending, refresh } = await useFetch<AnalyticsData>('/api/admin/analytics', {
  query: computed(() => ({ days: selectedPeriod.value })),
  watch: [selectedPeriod]
})

const maxVisits = computed(() => {
  if (!analytics.value?.visitsByDay.data.length) return 1
  return Math.max(...analytics.value.visitsByDay.data, 1)
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getPageName(path: string) {
  if (path === '/') return 'Accueil'
  if (path.startsWith('/cas/')) return path.replace('/cas/', 'Cas: ')
  if (path.startsWith('/actualites/')) return path.replace('/actualites/', 'Actu: ')
  return path
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Statistiques</h2>
        <p class="text-gray-600 dark:text-gray-400">Analyse du trafic et des performances</p>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="selectedPeriod"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option :value="7">7 derniers jours</option>
          <option :value="30">30 derniers jours</option>
          <option :value="90">90 derniers jours</option>
        </select>
        <button
          @click="refresh()"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
        >
          <font-awesome-icon icon="arrow-right" class="rotate-[-45deg]" />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-12">
      <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-3xl" />
    </div>

    <template v-else-if="analytics">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <font-awesome-icon icon="eye" class="text-xl" />
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Visites totales</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ analytics.summary.totalVisits.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
              <font-awesome-icon icon="users" class="text-xl" />
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Visiteurs uniques</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ analytics.summary.uniqueVisitors.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
              <font-awesome-icon icon="download" class="text-xl" />
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Téléchargements</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ analytics.summary.totalDownloads.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <font-awesome-icon icon="chart-line" class="text-xl" />
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Moy. visites/jour</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ analytics.summary.avgVisitsPerDay }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Visites par jour
        </h3>

        <div class="h-64 flex items-end gap-1">
          <div
            v-for="(value, index) in analytics.visitsByDay.data"
            :key="index"
            class="flex-1 flex flex-col items-center justify-end"
          >
            <div
              class="w-full bg-ti-blue rounded-t transition-all hover:bg-blue-600 cursor-pointer group relative"
              :style="{ height: `${(value / maxVisits) * 100}%`, minHeight: value > 0 ? '4px' : '0' }"
            >
              <!-- Tooltip -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div class="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {{ value }} visite{{ value > 1 ? 's' : '' }}
                  <br />
                  {{ formatDate(analytics.visitsByDay.labels[index]) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- X-axis labels (show every few days) -->
        <div class="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{{ formatDate(analytics.visitsByDay.labels[0]) }}</span>
          <span v-if="analytics.visitsByDay.labels.length > 14">
            {{ formatDate(analytics.visitsByDay.labels[Math.floor(analytics.visitsByDay.labels.length / 2)]) }}
          </span>
          <span>{{ formatDate(analytics.visitsByDay.labels[analytics.visitsByDay.labels.length - 1]) }}</span>
        </div>
      </div>

      <!-- Bottom Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Pages -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pages les plus visitées
          </h3>

          <div v-if="analytics.topPages.length > 0" class="space-y-3">
            <div
              v-for="(page, index) in analytics.topPages"
              :key="page.path"
              class="flex items-center gap-3"
            >
              <span class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                {{ index + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 dark:text-white truncate">
                  {{ getPageName(page.path) }}
                </p>
                <div class="mt-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-ti-blue rounded-full"
                    :style="{ width: `${(page.visits / analytics.topPages[0].visits) * 100}%` }"
                  />
                </div>
              </div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ page.visits }}
              </span>
            </div>
          </div>
          <p v-else class="text-gray-500 dark:text-gray-400 text-sm">
            Aucune donnée disponible
          </p>
        </div>

        <!-- Referrers -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sources de trafic
          </h3>

          <div v-if="analytics.referrers.length > 0" class="space-y-3">
            <div
              v-for="referrer in analytics.referrers"
              :key="referrer.domain"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <font-awesome-icon
                  :icon="referrer.domain === 'Direct' ? 'link' : 'globe'"
                  class="text-gray-400"
                />
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ referrer.domain }}
                </span>
              </div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ referrer.count }}
              </span>
            </div>
          </div>
          <p v-else class="text-gray-500 dark:text-gray-400 text-sm">
            Aucune donnée disponible
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
