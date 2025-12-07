<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Recettes
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Vue consolidée des recettes par collectivité et exercice
        </p>
      </div>
      <div class="flex items-center gap-3">
        <UiButton
          variant="outline"
          :icon="['fas', 'download']"
          @click="handleExport"
        >
          Exporter
        </UiButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Region filter -->
        <div class="w-48">
          <UiFormSelect
            v-model="filters.region_id"
            label="Région"
            :options="regionOptions"
            placeholder="Toutes les régions"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Year filter -->
        <div class="w-36">
          <UiFormSelect
            v-model="filters.annee"
            label="Année"
            :options="yearOptions"
            placeholder="Toutes"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Section filter -->
        <div class="w-44">
          <UiFormSelect
            v-model="filters.section"
            label="Section"
            :options="sectionOptions"
            placeholder="Toutes"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <UiFormInput
            v-model="searchQuery"
            placeholder="Rechercher..."
            :icon="['fas', 'search']"
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

    <!-- Summary cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Total Prévisions</p>
        <p class="text-xl font-bold text-[var(--color-primary)] font-mono">
          {{ formatMontant(totaux.prevision) }}
        </p>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Total Réalisations</p>
        <p class="text-xl font-bold text-[var(--color-success)] font-mono">
          {{ formatMontant(totaux.realisation) }}
        </p>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Écart</p>
        <p
          :class="[
            'text-xl font-bold font-mono',
            totaux.ecart >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
          ]"
        >
          {{ formatMontant(totaux.ecart) }}
        </p>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Taux d'exécution</p>
        <p class="text-xl font-bold text-[var(--text-primary)] font-mono">
          {{ totaux.tauxExecution.toFixed(1) }}%
        </p>
      </div>
    </div>

    <!-- Data table -->
    <UiDataTable
      :columns="columns"
      :data="recettes"
      :loading="isLoading"
      :total="pagination.total.value"
      :page="pagination.page.value"
      :limit="pagination.limit.value"
      :sortable="true"
      row-key="id"
      @page-change="pagination.goToPage"
      @limit-change="pagination.setLimit"
      @sort-change="handleSortChange"
    >
      <!-- Collectivité column -->
      <template #cell-collectivite="{ row }">
        <div>
          <p class="font-medium text-[var(--text-primary)]">
            {{ row.compte_administratif?.commune?.nom || 'N/A' }}
          </p>
          <p class="text-xs text-[var(--text-muted)]">
            Exercice {{ row.compte_administratif?.annee }}
          </p>
        </div>
      </template>

      <!-- Rubrique column -->
      <template #cell-rubrique="{ row }">
        <div>
          <span class="font-mono text-[var(--text-muted)] text-xs mr-2">
            {{ row.rubrique?.code }}
          </span>
          <span class="text-[var(--text-primary)]">
            {{ row.rubrique?.intitule }}
          </span>
        </div>
      </template>

      <!-- Section column -->
      <template #cell-section="{ row }">
        <UiBadge :variant="getSectionVariant(row.rubrique?.section)">
          {{ getSectionLabel(row.rubrique?.section) }}
        </UiBadge>
      </template>

      <!-- Prevision column -->
      <template #cell-prevision="{ row }">
        <span class="font-mono text-[var(--text-primary)]">
          {{ formatMontant(row.valeurs?.prevision || 0) }}
        </span>
      </template>

      <!-- Realisation column -->
      <template #cell-realisation="{ row }">
        <span class="font-mono text-[var(--color-success)]">
          {{ formatMontant(row.valeurs?.realisation || 0) }}
        </span>
      </template>

      <!-- Taux column -->
      <template #cell-taux="{ row }">
        <span class="font-mono">
          {{ calculateTaux(row) }}%
        </span>
      </template>

      <!-- Actions column -->
      <template #cell-actions="{ row }">
        <UiButton
          variant="ghost"
          size="sm"
          :icon="['fas', 'eye']"
          title="Voir le compte"
          @click="navigateTo(`/admin/comptes-administratifs/${row.compte_administratif_id}`)"
        />
      </template>

      <!-- Empty state -->
      <template #empty>
        <UiEmptyState
          :icon="['fas', 'arrow-trend-up']"
          title="Aucune recette"
          :description="hasActiveFilters ? 'Aucun résultat pour ces filtres' : 'Aucune donnée de recette disponible'"
        >
          <template #action>
            <UiButton
              v-if="hasActiveFilters"
              variant="outline"
              @click="clearFilters"
            >
              Effacer les filtres
            </UiButton>
          </template>
        </UiEmptyState>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
import type { LigneBudgetaire } from '~/types/comptes-administratifs'

definePageMeta({
  layout: 'admin',
})

const toast = useToast()
const comptesService = useComptesAdministratifsService()
const geoService = useGeoService()

// ============================================================================
// STATE
// ============================================================================

const recettes = ref<LigneBudgetaire[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

// Filters
const filters = reactive({
  region_id: null as string | null,
  annee: null as number | null,
  section: null as string | null,
})

// Geography data
const regions = ref<Array<{ id: string; nom: string }>>([])

// ============================================================================
// PAGINATION
// ============================================================================

const pagination = usePagination({
  defaultLimit: 50,
  syncWithUrl: true,
})

// ============================================================================
// COMPUTED
// ============================================================================

const columns = [
  { key: 'collectivite', label: 'Collectivité', sortable: false },
  { key: 'rubrique', label: 'Rubrique', sortable: false },
  { key: 'section', label: 'Section', sortable: true, width: '140px' },
  { key: 'prevision', label: 'Prévision', sortable: true, width: '130px' },
  { key: 'realisation', label: 'Réalisation', sortable: true, width: '130px' },
  { key: 'taux', label: 'Taux', sortable: false, width: '80px' },
  { key: 'actions', label: '', width: '60px' },
]

const regionOptions = computed(() => [
  { value: '', label: 'Toutes les régions' },
  ...regions.value.map(r => ({ value: r.id, label: r.nom })),
])

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = [{ value: '', label: 'Toutes les années' }]
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push({ value: y, label: String(y) })
  }
  return years
})

const sectionOptions = [
  { value: '', label: 'Toutes les sections' },
  { value: 'fonctionnement', label: 'Fonctionnement' },
  { value: 'investissement', label: 'Investissement' },
]

const hasActiveFilters = computed(() => {
  return !!(filters.region_id || filters.annee || filters.section || searchQuery.value)
})

const totaux = computed(() => {
  const prevision = recettes.value.reduce((sum, r) => sum + (r.valeurs?.prevision || 0), 0)
  const realisation = recettes.value.reduce((sum, r) => sum + (r.valeurs?.realisation || 0), 0)

  return {
    prevision,
    realisation,
    ecart: realisation - prevision,
    tauxExecution: prevision > 0 ? (realisation / prevision) * 100 : 0,
  }
})

// ============================================================================
// METHODS
// ============================================================================

const loadRecettes = async () => {
  isLoading.value = true
  try {
    // Note: This would need a dedicated API endpoint to get lignes with filters
    // For now, we simulate by getting comptes and their lignes
    const params = {
      ...pagination.getParams(),
      region_id: filters.region_id || undefined,
      annee: filters.annee || undefined,
      statut: 'publie' as const,
    }
    const response = await comptesService.getComptes(params)

    // Flatten lignes from all comptes (this is a simplification)
    const allLignes: LigneBudgetaire[] = []
    for (const compte of response.items.slice(0, 10)) {
      const lignes = await comptesService.getLignes(compte.id, { type: 'recette' })
      allLignes.push(...lignes.map(l => ({
        ...l,
        compte_administratif: compte,
      })))
    }

    recettes.value = allLignes
    // Note: pagination would need to be handled differently with a proper API
  } catch (error) {
    console.error('Erreur lors du chargement des recettes:', error)
    toast.error('Erreur lors du chargement des recettes')
  } finally {
    isLoading.value = false
  }
}

const loadGeography = async () => {
  try {
    const response = await geoService.getRegions({ limit: 100 })
    regions.value = response.items
  } catch (error) {
    console.error('Erreur lors du chargement des régions:', error)
  }
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.goToPage(1)
    loadRecettes()
  }, 300)
}

const handleFilterChange = () => {
  pagination.goToPage(1)
  loadRecettes()
}

const handleSortChange = ({ key, order }: { key: string; order: 'asc' | 'desc' }) => {
  pagination.setSort(key, order)
  loadRecettes()
}

const clearFilters = () => {
  filters.region_id = null
  filters.annee = null
  filters.section = null
  searchQuery.value = ''
  pagination.goToPage(1)
  loadRecettes()
}

const handleExport = () => {
  toast.info('Fonctionnalité d\'export à venir')
}

// Helpers
const getSectionVariant = (section: string | undefined): string => {
  const variants: Record<string, string> = {
    fonctionnement: 'primary',
    investissement: 'success',
  }
  return variants[section || ''] || 'default'
}

const getSectionLabel = (section: string | undefined): string => {
  const labels: Record<string, string> = {
    fonctionnement: 'Fonctionnement',
    investissement: 'Investissement',
  }
  return labels[section || ''] || section || 'N/A'
}

const calculateTaux = (ligne: LigneBudgetaire): string => {
  const prevision = ligne.valeurs?.prevision || 0
  const realisation = ligne.valeurs?.realisation || 0
  if (prevision === 0) return '0'
  return ((realisation / prevision) * 100).toFixed(1)
}

const formatMontant = (montant: number): string => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant) + ' Ar'
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadGeography()
  loadRecettes()
})

watch(
  () => [pagination.page.value, pagination.limit.value],
  () => loadRecettes(),
  { deep: true }
)
</script>
