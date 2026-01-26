<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface Category {
  id: string
  name: string
  color: string | null
  icon: string | null
}

interface ResourceItem {
  id: string
  slug: string
  title: string
  description: string | null
  coverImage: string | null
  fileUrl: string
  filename: string
  mimeType: string
  fileSize: number
  isPublished: boolean
  publishedAt: string | null
  downloadCount: number
  createdAt: string
  author: string | null
  category: Category | null
}

interface ResourceResponse {
  data: ResourceItem[]
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

const { data: resourcesResponse, pending, refresh } = await useFetch<ResourceResponse>('/api/admin/resources', {
  query: computed(() => ({
    page: page.value,
    limit,
    search: debouncedSearch.value,
    status: status.value,
    category: categoryId.value
  })),
  watch: [page, debouncedSearch, status, categoryId]
})

const resources = computed(() => resourcesResponse.value?.data || [])
const categories = computed(() => resourcesResponse.value?.categories || [])
const pagination = computed(() => resourcesResponse.value?.pagination)

function goToPage(p: number) {
  page.value = p
}

function resetFilters() {
  search.value = ''
  status.value = 'all'
  categoryId.value = ''
  page.value = 1
}

async function deleteResource(id: string, title: string) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/resources/${id}`, { method: 'DELETE' })
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

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'file-pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint'
  if (mimeType.includes('image')) return 'file-image'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'file-archive'
  return 'file'
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Ressources</h2>
        <p class="text-gray-600 dark:text-gray-400">Gérer les ressources téléchargeables</p>
      </div>
      <NuxtLink
        to="/admin/resources/new"
        class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <font-awesome-icon icon="plus" />
        Nouvelle ressource
      </NuxtLink>
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
              placeholder="Rechercher..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
            />
          </div>
        </div>

        <select
          v-model="categoryId"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
        >
          <option value="">Toutes les catégories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <select
          v-model="status"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiées</option>
          <option value="draft">Brouillons</option>
        </select>

        <button
          v-if="search || status !== 'all' || categoryId"
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

      <div v-else-if="resources.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ressource
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Catégorie
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Téléchargements
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="item in resources"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="item.coverImage"
                    :src="item.coverImage"
                    :alt="item.title"
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                  <div
                    v-else
                    class="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="getFileIcon(item.mimeType)" class="text-gray-400 dark:text-gray-500 text-lg" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {{ item.title }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ item.filename }} ({{ formatFileSize(item.fileSize) }})
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
                  <font-awesome-icon
                    v-if="item.category.icon && !item.category.icon.startsWith('/')"
                    :icon="item.category.icon"
                    class="text-xs"
                  />
                  {{ item.category.name }}
                </span>
                <span v-else class="text-gray-400 dark:text-gray-500 text-sm">-</span>
              </td>
              <td class="px-6 py-4 hidden md:table-cell">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(item.createdAt) }}
                </span>
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
                  {{ item.isPublished ? 'Publiée' : 'Brouillon' }}
                </span>
              </td>
              <td class="px-6 py-4 hidden sm:table-cell">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  <font-awesome-icon icon="download" class="mr-1 text-gray-400" />
                  {{ item.downloadCount }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <a
                    :href="item.fileUrl"
                    target="_blank"
                    class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Voir le fichier"
                  >
                    <font-awesome-icon icon="external-link-alt" />
                  </a>
                  <NuxtLink
                    :to="`/admin/resources/${item.id}`"
                    class="p-2 text-gray-400 hover:text-ti-blue transition-colors"
                    title="Modifier"
                  >
                    <font-awesome-icon icon="edit" />
                  </NuxtLink>
                  <button
                    @click="deleteResource(item.id, item.title)"
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    title="Supprimer"
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
        <font-awesome-icon icon="book" class="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
        <p class="text-gray-600 dark:text-gray-400">Aucune ressource trouvée</p>
        <NuxtLink
          to="/admin/resources/new"
          class="mt-4 inline-flex items-center gap-2 text-ti-blue hover:underline"
        >
          <font-awesome-icon icon="plus" />
          Créer une ressource
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
            @click="goToPage(pagination.page - 1)"
            class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          >
            Précédent
          </button>
          <button
            :disabled="pagination.page === pagination.totalPages"
            @click="goToPage(pagination.page + 1)"
            class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
