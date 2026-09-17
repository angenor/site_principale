<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface AudioVideoRow {
  id: string
  title: string
  format: AudioVideoFormat
  speakers: string[]
  externalUrl: string
  coverImage: string | null
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  category: { id: string; name: string; color: string | null; icon: string | null } | null
}

interface AudioVideoResponse {
  data: AudioVideoRow[]
  categories: { id: string; name: string }[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const search = ref('')
const status = ref('all')
const categoryId = ref('')
const page = ref(1)
const limit = 10

const debouncedSearch = refDebounced(search, 300)

// Retour à la première page quand les filtres changent
watch([debouncedSearch, status, categoryId], () => {
  page.value = 1
})

const { data: response, pending, refresh } = await useFetch<AudioVideoResponse>('/api/admin/audio-videos', {
  query: computed(() => ({
    page: page.value,
    limit,
    search: debouncedSearch.value,
    status: status.value,
    category: categoryId.value
  }))
})

const items = computed(() => response.value?.data || [])
const categories = computed(() => response.value?.categories || [])
const pagination = computed(() => response.value?.pagination)

function resetFilters() {
  search.value = ''
  status.value = 'all'
  categoryId.value = ''
}

async function deleteItem(item: AudioVideoRow) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer « ${item.title} » ?`)) return

  try {
    await $fetch(`/api/admin/audio-videos/${item.id}`, { method: 'DELETE' })
    await refresh()
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
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Audios/Vidéos</h2>
        <p class="text-gray-600 dark:text-gray-400">Contenus audios et vidéos de la rubrique Ressources</p>
      </div>
      <NuxtLink
        to="/admin/audio-videos/new"
        class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <font-awesome-icon icon="plus" />
        Nouvel audio/vidéo
      </NuxtLink>
    </div>

    <!-- Filtres -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 relative">
          <font-awesome-icon
            icon="search"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher..."
            aria-label="Rechercher"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
          />
        </div>

        <select
          v-model="categoryId"
          aria-label="Catégorie"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue cursor-pointer"
        >
          <option value="">Toutes les catégories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <select
          v-model="status"
          aria-label="Statut"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
        </select>

        <button
          v-if="search || status !== 'all' || categoryId"
          class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
          @click="resetFilters"
        >
          <font-awesome-icon icon="xmark" class="mr-1" />
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Liste -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div v-if="pending && !items.length" class="p-8 text-center">
        <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-2xl" />
        <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>

      <div v-else-if="items.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contenu
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Catégorie
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Publication
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="item in items"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="relative w-20 aspect-video shrink-0 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                      v-if="item.coverImage"
                      :src="getImageVariant(item.coverImage, 'thumb')"
                      alt=""
                      class="w-full h-full object-cover"
                    />
                    <span class="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                      <font-awesome-icon :icon="item.format === 'AUDIO' ? 'headphones' : 'play'" class="text-[0.55rem]" />
                    </span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {{ item.title }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {{ getUrlHost(item.externalUrl) }}
                      <template v-if="item.speakers.length"> · {{ item.speakers.join(', ') }}</template>
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 hidden lg:table-cell">
                <span
                  v-if="item.category"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :style="{
                    backgroundColor: (item.category.color || '#6B7280') + '20',
                    color: item.category.color || '#6B7280'
                  }"
                >
                  <CategoryIcon :icon="item.category.icon" />
                  {{ item.category.name }}
                </span>
                <span v-else class="text-gray-400 dark:text-gray-500 text-sm">-</span>
              </td>
              <td class="px-6 py-4 hidden md:table-cell text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {{ formatDate(item.publishedAt) }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    item.isPublished
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                  ]"
                >
                  {{ item.isPublished ? 'Publié' : 'Brouillon' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <a
                    :href="item.externalUrl"
                    target="_blank"
                    rel="noopener"
                    class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Ouvrir sur le site source"
                  >
                    <font-awesome-icon icon="external-link-alt" />
                  </a>
                  <NuxtLink
                    :to="`/admin/audio-videos/${item.id}`"
                    class="p-2 text-gray-400 hover:text-ti-blue transition-colors"
                    title="Modifier"
                  >
                    <font-awesome-icon icon="edit" />
                  </NuxtLink>
                  <button
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    title="Supprimer"
                    @click="deleteItem(item)"
                  >
                    <font-awesome-icon icon="trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="p-8 text-center">
        <font-awesome-icon icon="video" class="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
        <p class="text-gray-600 dark:text-gray-400">Aucun audio/vidéo trouvé</p>
        <NuxtLink
          to="/admin/audio-videos/new"
          class="mt-4 inline-flex items-center gap-2 text-ti-blue hover:underline"
        >
          <font-awesome-icon icon="plus" />
          Ajouter un audio/vidéo
        </NuxtLink>
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
            class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            @click="page = pagination.page - 1"
          >
            Précédent
          </button>
          <button
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            @click="page = pagination.page + 1"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
