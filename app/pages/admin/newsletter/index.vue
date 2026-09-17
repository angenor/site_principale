<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

type SubscriberStatus = 'all' | 'active' | 'inactive'

interface Subscriber {
  id: string
  name: string
  email: string
  isActive: boolean
  subscribedAt: string
  unsubscribedAt: string | null
}

interface SubscribersResponse {
  data: Subscriber[]
  counts: { active: number, inactive: number }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const search = ref('')
const status = ref<SubscriberStatus>('all')
const page = ref(1)
const limit = 20

const debouncedSearch = refDebounced(search, 300)

watch([debouncedSearch, status], () => {
  page.value = 1
})

const { data: response, pending, refresh } = await useFetch<SubscribersResponse>('/api/admin/newsletter', {
  query: computed(() => ({
    page: page.value,
    limit,
    search: debouncedSearch.value,
    status: status.value
  })),
  watch: [page, debouncedSearch, status]
})

const subscribers = computed(() => response.value?.data || [])
const pagination = computed(() => response.value?.pagination)
const counts = computed(() => response.value?.counts || { active: 0, inactive: 0 })

const exportUrl = computed(() => {
  const params = new URLSearchParams({ search: debouncedSearch.value, status: status.value })
  return `/api/admin/newsletter/export?${params.toString()}`
})

function resetFilters() {
  search.value = ''
  status.value = 'all'
}

async function toggleActive(subscriber: Subscriber) {
  try {
    await $fetch(`/api/admin/newsletter/${subscriber.id}`, {
      method: 'PUT',
      body: { isActive: !subscriber.isActive }
    })
    refresh()
  } catch {
    alert('Erreur lors de la mise à jour de l\'abonnement')
  }
}

async function deleteSubscriber(subscriber: Subscriber) {
  if (!confirm(`Supprimer définitivement l'abonné « ${subscriber.email} » ?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/newsletter/${subscriber.id}`, { method: 'DELETE' })
    refresh()
  } catch {
    alert('Erreur lors de la suppression')
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const statuses: { value: SubscriberStatus, label: string }[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'active', label: 'Abonnés' },
  { value: 'inactive', label: 'Désinscrits' }
]
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Newsletter</h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ counts.active }} abonné{{ counts.active > 1 ? 's' : '' }} actif{{ counts.active > 1 ? 's' : '' }}
          · {{ counts.inactive }} désinscrit{{ counts.inactive > 1 ? 's' : '' }}
        </p>
      </div>
      <a
        :href="exportUrl"
        class="inline-flex items-center gap-2 px-4 py-2 bg-ti-blue hover:bg-ti-blue-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
      >
        <font-awesome-icon icon="download" />
        Exporter en CSV
      </a>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <font-awesome-icon
              icon="search"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              v-model="search"
              type="text"
              placeholder="Rechercher par nom ou adresse..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
            />
          </div>
        </div>

        <select
          v-model="status"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
        >
          <option v-for="s in statuses" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>

        <button
          v-if="search || status !== 'all'"
          @click="resetFilters"
          class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
        >
          <font-awesome-icon icon="xmark" class="mr-1" />
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div v-if="pending" class="p-8 text-center">
        <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-2xl" />
        <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>

      <div v-else-if="subscribers.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Adresse électronique</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Abonné le</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="subscriber in subscribers"
              :key="subscriber.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{{ subscriber.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                <a :href="`mailto:${subscriber.email}`" class="hover:text-ti-blue">{{ subscriber.email }}</a>
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap">
                <span
                  v-if="subscriber.isActive"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                >
                  Abonné
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  :title="`Désinscrit le ${formatDate(subscriber.unsubscribedAt)}`"
                >
                  Désinscrit
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {{ formatDate(subscriber.subscribedAt) }}
              </td>
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <button
                  @click="toggleActive(subscriber)"
                  class="p-2 text-gray-400 hover:text-ti-blue transition-colors cursor-pointer"
                  :title="subscriber.isActive ? 'Désinscrire' : 'Réabonner'"
                >
                  <font-awesome-icon :icon="subscriber.isActive ? 'eye-slash' : 'eye'" />
                </button>
                <button
                  @click="deleteSubscriber(subscriber)"
                  class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                  title="Supprimer"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="p-8 text-center">
        <font-awesome-icon icon="inbox" class="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
        <p class="text-gray-600 dark:text-gray-400">Aucun abonné trouvé</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.totalPages > 1"
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ (pagination.page - 1) * limit + 1 }} - {{ Math.min(pagination.page * limit, pagination.total) }}
          sur {{ pagination.total }} résultats
        </p>
        <div class="flex gap-2">
          <button
            :disabled="pagination.page === 1"
            @click="page = pagination.page - 1"
            class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          >
            Précédent
          </button>
          <button
            :disabled="pagination.page === pagination.totalPages"
            @click="page = pagination.page + 1"
            class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
