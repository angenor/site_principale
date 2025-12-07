<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Régions
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Les 22 régions de Madagascar
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Province filter -->
        <div class="w-48">
          <UiFormSelect
            v-model="filters.province_id"
            label="Province"
            :options="provinceOptions"
            placeholder="Toutes les provinces"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <UiFormInput
            v-model="searchQuery"
            placeholder="Rechercher une région..."
            :icon="['fas', 'magnifying-glass']"
            @update:model-value="debouncedSearch"
          />
        </div>

        <!-- Clear filters -->
        <UiButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          :icon="['fas', 'times']"
          @click="clearFilters"
        >
          Effacer
        </UiButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="i in 8"
        :key="i"
        class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5"
      >
        <UiSkeleton class="h-5 w-32 mb-2" />
        <UiSkeleton class="h-3 w-20 mb-3" />
        <UiSkeleton class="h-4 w-24" />
      </div>
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadRegions"
    />

    <!-- Empty state -->
    <UiEmptyState
      v-else-if="!regions.length"
      title="Aucune région trouvée"
      description="Aucune région ne correspond à vos critères de recherche."
      icon="location-dot"
    />

    <!-- Regions grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <NuxtLink
        v-for="region in regions"
        :key="region.id"
        :to="`/admin/geo/regions/${region.id}`"
        class="group bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5 hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
              {{ region.nom }}
            </h3>
            <span class="text-xs text-[var(--text-muted)] font-mono">
              {{ region.code }}
            </span>
          </div>
          <div class="p-2 rounded-lg bg-[var(--color-primary)]/10">
            <font-awesome-icon :icon="['fas', 'location-dot']" class="text-[var(--color-primary)] text-sm" />
          </div>
        </div>

        <!-- Province badge -->
        <div class="mb-3">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
            <font-awesome-icon :icon="['fas', 'map']" class="mr-1 text-xs" />
            {{ region.province_nom || 'Province' }}
          </span>
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'city']" class="text-[var(--text-muted)] text-xs" />
            <span class="text-sm text-[var(--text-secondary)]">
              {{ region.nb_communes || 0 }} communes
            </span>
          </div>
          <font-awesome-icon
            :icon="['fas', 'chevron-right']"
            class="text-[var(--text-muted)] group-hover:text-[var(--color-primary)] text-xs transition-colors"
          />
        </div>
      </NuxtLink>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && !error && pagination.total > pagination.limit"
      class="mt-6 flex items-center justify-between"
    >
      <p class="text-sm text-[var(--text-muted)]">
        Affichage {{ ((pagination.page - 1) * pagination.limit) + 1 }} -
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
        sur {{ pagination.total }} régions
      </p>
      <div class="flex items-center gap-2">
        <UiButton
          variant="outline"
          size="sm"
          :disabled="pagination.page <= 1"
          @click="goToPage(pagination.page - 1)"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </UiButton>
        <span class="text-sm text-[var(--text-secondary)]">
          Page {{ pagination.page }} / {{ pagination.pages }}
        </span>
        <UiButton
          variant="outline"
          size="sm"
          :disabled="pagination.page >= pagination.pages"
          @click="goToPage(pagination.page + 1)"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegionWithStats, ProvinceWithStats } from '~/types/collectivites'
import { useGeoService } from '~/services/geo.service'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const geoService = useGeoService()

// State
const regions = ref<RegionWithStats[]>([])
const provinces = ref<ProvinceWithStats[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filters = ref<{
  province_id: number | null
}>({
  province_id: null,
})
const pagination = ref({
  page: 1,
  limit: 24,
  total: 0,
  pages: 1,
})

// Computed
const provinceOptions = computed(() => [
  { value: '', label: 'Toutes les provinces' },
  ...provinces.value.map(p => ({ value: p.id, label: p.nom })),
])

const hasActiveFilters = computed(() =>
  filters.value.province_id !== null || searchQuery.value !== ''
)

// Methods
const loadProvinces = async () => {
  try {
    provinces.value = await geoService.getProvinces()
  } catch (e) {
    console.error('Erreur chargement provinces:', e)
    // Mock data
    provinces.value = [
      { id: 1, code: 'ANT', nom: 'Antananarivo', nb_regions: 4, nb_communes: 180, created_at: '', updated_at: '' },
      { id: 2, code: 'ANS', nom: 'Antsiranana', nb_regions: 3, nb_communes: 82, created_at: '', updated_at: '' },
      { id: 3, code: 'FIA', nom: 'Fianarantsoa', nb_regions: 4, nb_communes: 200, created_at: '', updated_at: '' },
      { id: 4, code: 'MAH', nom: 'Mahajanga', nb_regions: 4, nb_communes: 125, created_at: '', updated_at: '' },
      { id: 5, code: 'TOA', nom: 'Toamasina', nb_regions: 3, nb_communes: 110, created_at: '', updated_at: '' },
      { id: 6, code: 'TOL', nom: 'Toliara', nb_regions: 4, nb_communes: 153, created_at: '', updated_at: '' },
    ]
  }
}

const loadRegions = async () => {
  loading.value = true
  error.value = null

  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }

    if (filters.value.province_id) {
      params.province_id = filters.value.province_id
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await geoService.getRegions(params)
    regions.value = response.items
    pagination.value.total = response.total
    pagination.value.pages = response.pages
  } catch (e: any) {
    console.error('Erreur chargement régions:', e)
    error.value = e?.message || 'Erreur lors du chargement des régions'

    // Mock data
    const allRegions: RegionWithStats[] = [
      { id: 1, code: 'ANA', nom: 'Analamanga', province_id: 1, province_nom: 'Antananarivo', nb_communes: 55, created_at: '', updated_at: '' },
      { id: 2, code: 'BON', nom: 'Bongolava', province_id: 1, province_nom: 'Antananarivo', nb_communes: 25, created_at: '', updated_at: '' },
      { id: 3, code: 'ITA', nom: 'Itasy', province_id: 1, province_nom: 'Antananarivo', nb_communes: 45, created_at: '', updated_at: '' },
      { id: 4, code: 'VAK', nom: 'Vakinankaratra', province_id: 1, province_nom: 'Antananarivo', nb_communes: 55, created_at: '', updated_at: '' },
      { id: 5, code: 'DIA', nom: 'Diana', province_id: 2, province_nom: 'Antsiranana', nb_communes: 30, created_at: '', updated_at: '' },
      { id: 6, code: 'SAV', nom: 'Sava', province_id: 2, province_nom: 'Antsiranana', nb_communes: 52, created_at: '', updated_at: '' },
      { id: 7, code: 'AMO', nom: 'Amoron\'i Mania', province_id: 3, province_nom: 'Fianarantsoa', nb_communes: 45, created_at: '', updated_at: '' },
      { id: 8, code: 'HMN', nom: 'Haute Matsiatra', province_id: 3, province_nom: 'Fianarantsoa', nb_communes: 55, created_at: '', updated_at: '' },
      { id: 9, code: 'IHO', nom: 'Ihorombe', province_id: 3, province_nom: 'Fianarantsoa', nb_communes: 25, created_at: '', updated_at: '' },
      { id: 10, code: 'VVS', nom: 'Vatovavy', province_id: 3, province_nom: 'Fianarantsoa', nb_communes: 75, created_at: '', updated_at: '' },
      { id: 11, code: 'ATS', nom: 'Atsimo Andrefana', province_id: 6, province_nom: 'Toliara', nb_communes: 45, created_at: '', updated_at: '' },
      { id: 12, code: 'AND', nom: 'Androy', province_id: 6, province_nom: 'Toliara', nb_communes: 35, created_at: '', updated_at: '' },
      { id: 13, code: 'ANO', nom: 'Anosy', province_id: 6, province_nom: 'Toliara', nb_communes: 40, created_at: '', updated_at: '' },
      { id: 14, code: 'MEN', nom: 'Menabe', province_id: 6, province_nom: 'Toliara', nb_communes: 33, created_at: '', updated_at: '' },
      { id: 15, code: 'BET', nom: 'Betsiboka', province_id: 4, province_nom: 'Mahajanga', nb_communes: 28, created_at: '', updated_at: '' },
      { id: 16, code: 'BOE', nom: 'Boeny', province_id: 4, province_nom: 'Mahajanga', nb_communes: 32, created_at: '', updated_at: '' },
      { id: 17, code: 'MEL', nom: 'Melaky', province_id: 4, province_nom: 'Mahajanga', nb_communes: 25, created_at: '', updated_at: '' },
      { id: 18, code: 'SOF', nom: 'Sofia', province_id: 4, province_nom: 'Mahajanga', nb_communes: 40, created_at: '', updated_at: '' },
      { id: 19, code: 'ALA', nom: 'Alaotra Mangoro', province_id: 5, province_nom: 'Toamasina', nb_communes: 38, created_at: '', updated_at: '' },
      { id: 20, code: 'ANA', nom: 'Analanjirofo', province_id: 5, province_nom: 'Toamasina', nb_communes: 32, created_at: '', updated_at: '' },
      { id: 21, code: 'ATS', nom: 'Atsinanana', province_id: 5, province_nom: 'Toamasina', nb_communes: 40, created_at: '', updated_at: '' },
      { id: 22, code: 'FIF', nom: 'Fitovinany', province_id: 3, province_nom: 'Fianarantsoa', nb_communes: 48, created_at: '', updated_at: '' },
    ]

    let filtered = allRegions
    if (filters.value.province_id) {
      filtered = filtered.filter(r => r.province_id === filters.value.province_id)
    }
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(r =>
        r.nom.toLowerCase().includes(query) || r.code.toLowerCase().includes(query)
      )
    }

    regions.value = filtered
    pagination.value.total = filtered.length
    pagination.value.pages = Math.ceil(filtered.length / pagination.value.limit)
    error.value = null
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.value.page = 1
  loadRegions()
}

const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  loadRegions()
}, 300)

const clearFilters = () => {
  filters.value.province_id = null
  searchQuery.value = ''
  pagination.value.page = 1
  loadRegions()
}

const goToPage = (page: number) => {
  pagination.value.page = page
  loadRegions()
}

// Load on mount
onMounted(async () => {
  await loadProvinces()
  await loadRegions()
})
</script>
