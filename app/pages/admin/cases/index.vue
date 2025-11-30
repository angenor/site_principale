<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface Category {
  name: string
  color: string | null
}

interface CaseStudy {
  id: string
  slug: string
  title: string
  summary: string
  coverImage: string | null
  isPublished: boolean
  publishedAt: string | null
  viewCount: number
  createdAt: string
  author: string | null
  region: string | null
  categories: Category[]
}

interface CasesResponse {
  data: CaseStudy[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// États de filtre
const search = ref('')
const status = ref('all')
const page = ref(1)
const limit = 10

// Debounce pour la recherche
const debouncedSearch = refDebounced(search, 300)

// Récupérer les cas
const { data: casesResponse, pending, refresh } = await useFetch<CasesResponse>('/api/admin/cases', {
  query: computed(() => ({
    page: page.value,
    limit,
    search: debouncedSearch.value,
    status: status.value
  })),
  watch: [page, debouncedSearch, status]
})

const cases = computed(() => casesResponse.value?.data || [])
const pagination = computed(() => casesResponse.value?.pagination)

// Changement de page
function goToPage(p: number) {
  page.value = p
}

// Réinitialiser les filtres
function resetFilters() {
  search.value = ''
  status.value = 'all'
  page.value = 1
}

// Supprimer un cas
async function deleteCase(id: string, title: string) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/cases/${id}`, { method: 'DELETE' })
    refresh()
  } catch {
    alert('Erreur lors de la suppression')
  }
}

// Formater la date
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
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Études de cas</h2>
        <p class="text-gray-600 dark:text-gray-400">Gérer les études de cas du site</p>
      </div>
      <NuxtLink
        to="/admin/cases/new"
        class="inline-flex items-center gap-2 px-4 py-2 bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <font-awesome-icon icon="plus" />
        Nouvelle étude de cas
      </NuxtLink>
    </div>

    <!-- Filtres -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Recherche -->
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

        <!-- Statut -->
        <select
          v-model="status"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
        </select>

        <!-- Réinitialiser -->
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

    <!-- Liste -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <!-- Loading -->
      <div v-if="pending" class="p-8 text-center">
        <font-awesome-icon icon="spinner" class="animate-spin text-ti-blue text-2xl" />
        <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>

      <!-- Tableau -->
      <div v-else-if="cases.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Titre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Région
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Catégories
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Vues
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="caseStudy in cases"
              :key="caseStudy.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="caseStudy.coverImage"
                    :src="caseStudy.coverImage"
                    :alt="caseStudy.title"
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                  <div
                    v-else
                    class="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                  >
                    <font-awesome-icon icon="image" class="text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {{ caseStudy.title }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(caseStudy.createdAt) }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 hidden md:table-cell">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ caseStudy.region || '-' }}
                </span>
              </td>
              <td class="px-6 py-4 hidden lg:table-cell">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="cat in caseStudy.categories.slice(0, 2)"
                    :key="cat.name"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :style="{ backgroundColor: cat.color ? `${cat.color}20` : '#e5e7eb', color: cat.color || '#374151' }"
                  >
                    {{ cat.name }}
                  </span>
                  <span
                    v-if="caseStudy.categories.length > 2"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    +{{ caseStudy.categories.length - 2 }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    caseStudy.isPublished
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                  ]"
                >
                  {{ caseStudy.isPublished ? 'Publié' : 'Brouillon' }}
                </span>
              </td>
              <td class="px-6 py-4 hidden sm:table-cell">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ caseStudy.viewCount }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/cas/${caseStudy.slug}`"
                    target="_blank"
                    class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Voir sur le site"
                  >
                    <font-awesome-icon icon="external-link-alt" />
                  </NuxtLink>
                  <NuxtLink
                    :to="`/admin/cases/${caseStudy.id}`"
                    class="p-2 text-gray-400 hover:text-ti-blue transition-colors"
                    title="Modifier"
                  >
                    <font-awesome-icon icon="edit" />
                  </NuxtLink>
                  <button
                    @click="deleteCase(caseStudy.id, caseStudy.title)"
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

      <!-- Aucun résultat -->
      <div v-else class="p-8 text-center">
        <font-awesome-icon icon="folder-open" class="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
        <p class="text-gray-600 dark:text-gray-400">Aucune étude de cas trouvée</p>
        <NuxtLink
          to="/admin/cases/new"
          class="mt-4 inline-flex items-center gap-2 text-ti-blue hover:underline"
        >
          <font-awesome-icon icon="plus" />
          Créer une étude de cas
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
