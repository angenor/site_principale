<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Communes
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Gestion des communes de Madagascar
        </p>
      </div>
      <NuxtLink to="/admin/geo/communes/create">
        <UiButton variant="primary" :icon="['fas', 'plus']">
          Nouvelle commune
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Province filter -->
        <div class="w-44">
          <UiFormSelect
            v-model="filters.province_id"
            label="Province"
            :options="provinceOptions"
            placeholder="Toutes"
            @update:model-value="handleProvinceChange"
          />
        </div>

        <!-- Region filter -->
        <div class="w-44">
          <UiFormSelect
            v-model="filters.region_id"
            label="Région"
            :options="regionOptions"
            placeholder="Toutes"
            :disabled="!filters.province_id"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Type filter -->
        <div class="w-36">
          <UiFormSelect
            v-model="filters.type_commune"
            label="Type"
            :options="typeOptions"
            placeholder="Tous"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <UiFormInput
            v-model="searchQuery"
            placeholder="Rechercher une commune..."
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

    <!-- Data table -->
    <UiDataTable
      :columns="columns"
      :data="communes"
      :loading="loading"
      :sortable="true"
      :pagination="{
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
      }"
      empty-message="Aucune commune trouvée"
      @sort="handleSort"
      @page-change="handlePageChange"
    >
      <!-- Nom column -->
      <template #cell-nom="{ row }">
        <div>
          <NuxtLink
            :to="`/admin/geo/communes/${row.id}`"
            class="font-medium text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            {{ row.nom }}
          </NuxtLink>
          <p class="text-xs text-[var(--text-muted)] font-mono">{{ row.code }}</p>
        </div>
      </template>

      <!-- Type column -->
      <template #cell-type_commune="{ value }">
        <span
          :class="[
            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
            value === 'urbaine'
              ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
              : 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
          ]"
        >
          {{ value === 'urbaine' ? 'Urbaine' : 'Rurale' }}
        </span>
      </template>

      <!-- Region column -->
      <template #cell-region_nom="{ row }">
        <NuxtLink
          v-if="row.region_id"
          :to="`/admin/geo/regions/${row.region_id}`"
          class="text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          {{ row.region_nom || '-' }}
        </NuxtLink>
        <span v-else class="text-[var(--text-muted)]">-</span>
      </template>

      <!-- Province column -->
      <template #cell-province_nom="{ value }">
        <span class="text-[var(--text-secondary)]">{{ value || '-' }}</span>
      </template>

      <!-- Population column -->
      <template #cell-population="{ value }">
        <span v-if="value" class="font-mono text-sm">{{ formatNumber(value) }}</span>
        <span v-else class="text-[var(--text-muted)]">-</span>
      </template>

      <!-- Actions column -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <NuxtLink :to="`/admin/geo/communes/${row.id}`">
            <UiButton variant="ghost" size="sm" :icon="['fas', 'eye']" title="Voir" />
          </NuxtLink>
          <NuxtLink :to="`/admin/geo/communes/${row.id}?edit=true`">
            <UiButton variant="ghost" size="sm" :icon="['fas', 'edit']" title="Modifier" />
          </NuxtLink>
          <UiButton
            variant="ghost"
            size="sm"
            :icon="['fas', 'trash']"
            title="Supprimer"
            class="text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            @click="confirmDelete(row)"
          />
        </div>
      </template>
    </UiDataTable>

    <!-- Delete confirmation modal -->
    <UiModal
      v-model="showDeleteModal"
      title="Supprimer la commune"
      size="sm"
      :confirm-loading="deleting"
      confirm-text="Supprimer"
      confirm-variant="danger"
      @confirm="handleDelete"
    >
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer la commune
        <strong class="text-[var(--text-primary)]">{{ communeToDelete?.nom }}</strong> ?
      </p>
      <p class="mt-2 text-sm text-[var(--text-muted)]">
        Cette action est irréversible.
      </p>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { CommuneWithStats, ProvinceWithStats, RegionWithStats } from '~/types/collectivites'
import { useGeoService } from '~/services/geo.service'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const geoService = useGeoService()
const toast = useAppToast()

// State
const communes = ref<CommuneWithStats[]>([])
const provinces = ref<ProvinceWithStats[]>([])
const regions = ref<RegionWithStats[]>([])
const loading = ref(true)
const searchQuery = ref('')
const filters = ref<{
  province_id: number | null
  region_id: number | null
  type_commune: 'urbaine' | 'rurale' | null
}>({
  province_id: null,
  region_id: null,
  type_commune: null,
})
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 1,
})
const sortBy = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

// Delete modal
const showDeleteModal = ref(false)
const communeToDelete = ref<CommuneWithStats | null>(null)
const deleting = ref(false)

// Table columns
const columns = [
  { key: 'nom', label: 'Commune', sortable: true },
  { key: 'type_commune', label: 'Type', sortable: true, width: '100px' },
  { key: 'region_nom', label: 'Région', sortable: true },
  { key: 'province_nom', label: 'Province', sortable: true },
  { key: 'population', label: 'Population', sortable: true, width: '120px' },
  { key: 'actions', label: '', width: '140px' },
]

// Computed
const provinceOptions = computed(() => [
  { value: '', label: 'Toutes les provinces' },
  ...provinces.value.map(p => ({ value: p.id, label: p.nom })),
])

const regionOptions = computed(() => {
  if (!filters.value.province_id) {
    return [{ value: '', label: 'Sélectionnez une province' }]
  }
  const filtered = regions.value.filter(r => r.province_id === filters.value.province_id)
  return [
    { value: '', label: 'Toutes les régions' },
    ...filtered.map(r => ({ value: r.id, label: r.nom })),
  ]
})

const typeOptions = [
  { value: '', label: 'Tous les types' },
  { value: 'urbaine', label: 'Urbaine' },
  { value: 'rurale', label: 'Rurale' },
]

const hasActiveFilters = computed(() =>
  filters.value.province_id !== null ||
  filters.value.region_id !== null ||
  filters.value.type_commune !== null ||
  searchQuery.value !== ''
)

// Methods
const formatNumber = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

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
  try {
    const response = await geoService.getRegions({ limit: 100 })
    regions.value = response.items
  } catch (e) {
    console.error('Erreur chargement régions:', e)
    // Mock data
    regions.value = [
      { id: 1, code: 'ANA', nom: 'Analamanga', province_id: 1, nb_communes: 55, created_at: '', updated_at: '' },
      { id: 2, code: 'BON', nom: 'Bongolava', province_id: 1, nb_communes: 25, created_at: '', updated_at: '' },
      { id: 3, code: 'ITA', nom: 'Itasy', province_id: 1, nb_communes: 45, created_at: '', updated_at: '' },
      { id: 4, code: 'VAK', nom: 'Vakinankaratra', province_id: 1, nb_communes: 55, created_at: '', updated_at: '' },
    ]
  }
}

const loadCommunes = async () => {
  loading.value = true

  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }

    if (filters.value.province_id) params.province_id = filters.value.province_id
    if (filters.value.region_id) params.region_id = filters.value.region_id
    if (filters.value.type_commune) params.type_commune = filters.value.type_commune
    if (searchQuery.value) params.search = searchQuery.value
    if (sortBy.value) {
      params.sort_by = sortBy.value
      params.sort_order = sortOrder.value
    }

    const response = await geoService.getCommunes(params)
    communes.value = response.items
    pagination.value.total = response.total
    pagination.value.pages = response.pages
  } catch (e: any) {
    console.error('Erreur chargement communes:', e)

    // Mock data
    const mockCommunes: CommuneWithStats[] = [
      { id: 1, code: 'ANT-001', nom: 'Antananarivo Renivohitra', type_commune: 'urbaine', region_id: 1, region_nom: 'Analamanga', province_nom: 'Antananarivo', population: 1275207, created_at: '', updated_at: '' },
      { id: 2, code: 'ANT-002', nom: 'Ambohidratrimo', type_commune: 'urbaine', region_id: 1, region_nom: 'Analamanga', province_nom: 'Antananarivo', population: 45000, created_at: '', updated_at: '' },
      { id: 3, code: 'ANT-003', nom: 'Andramasina', type_commune: 'rurale', region_id: 1, region_nom: 'Analamanga', province_nom: 'Antananarivo', population: 28000, created_at: '', updated_at: '' },
      { id: 4, code: 'ANT-004', nom: 'Anjozorobe', type_commune: 'rurale', region_id: 1, region_nom: 'Analamanga', province_nom: 'Antananarivo', population: 32000, created_at: '', updated_at: '' },
      { id: 5, code: 'TOA-001', nom: 'Toamasina I', type_commune: 'urbaine', region_id: 21, region_nom: 'Atsinanana', province_nom: 'Toamasina', population: 274667, created_at: '', updated_at: '' },
      { id: 6, code: 'FIA-001', nom: 'Fianarantsoa I', type_commune: 'urbaine', region_id: 8, region_nom: 'Haute Matsiatra', province_nom: 'Fianarantsoa', population: 195000, created_at: '', updated_at: '' },
      { id: 7, code: 'MAH-001', nom: 'Mahajanga I', type_commune: 'urbaine', region_id: 16, region_nom: 'Boeny', province_nom: 'Mahajanga', population: 226000, created_at: '', updated_at: '' },
      { id: 8, code: 'TOL-001', nom: 'Toliara I', type_commune: 'urbaine', region_id: 11, region_nom: 'Atsimo Andrefana', province_nom: 'Toliara', population: 137000, created_at: '', updated_at: '' },
    ]

    communes.value = mockCommunes
    pagination.value.total = mockCommunes.length
    pagination.value.pages = 1
  } finally {
    loading.value = false
  }
}

const handleProvinceChange = () => {
  filters.value.region_id = null
  handleFilterChange()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  loadCommunes()
}

const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  loadCommunes()
}, 300)

const clearFilters = () => {
  filters.value = {
    province_id: null,
    region_id: null,
    type_commune: null,
  }
  searchQuery.value = ''
  pagination.value.page = 1
  loadCommunes()
}

const handleSort = ({ key, order }: { key: string; order: 'asc' | 'desc' }) => {
  sortBy.value = key
  sortOrder.value = order
  loadCommunes()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadCommunes()
}

const confirmDelete = (commune: CommuneWithStats) => {
  communeToDelete.value = commune
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!communeToDelete.value) return

  deleting.value = true
  try {
    await geoService.deleteCommune(communeToDelete.value.id)
    toast.success(`Commune "${communeToDelete.value.nom}" supprimée`)
    showDeleteModal.value = false
    communeToDelete.value = null
    await loadCommunes()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la suppression')
  } finally {
    deleting.value = false
  }
}

// Load on mount
onMounted(async () => {
  await Promise.all([loadProvinces(), loadRegions()])
  await loadCommunes()
})
</script>
