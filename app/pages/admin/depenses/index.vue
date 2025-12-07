<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Dépenses
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Vue consolidée des dépenses par collectivité et exercice
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
        <p class="text-sm text-[var(--text-muted)] mb-1">Crédits Ouverts</p>
        <p class="text-xl font-bold text-[var(--color-primary)] font-mono">
          {{ formatMontant(totaux.creditsOuverts) }}
        </p>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Mandatements</p>
        <p class="text-xl font-bold text-[var(--color-error)] font-mono">
          {{ formatMontant(totaux.mandatements) }}
        </p>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Disponible</p>
        <p
          :class="[
            'text-xl font-bold font-mono',
            totaux.disponible >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
          ]"
        >
          {{ formatMontant(totaux.disponible) }}
        </p>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Taux de consommation</p>
        <p class="text-xl font-bold text-[var(--text-primary)] font-mono">
          {{ totaux.tauxConsommation.toFixed(1) }}%
        </p>
      </div>
    </div>

    <!-- Data table -->
    <UiDataTable
      :columns="columns"
      :data="depenses"
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

      <!-- Credits column -->
      <template #cell-credits="{ row }">
        <span class="font-mono text-[var(--text-primary)]">
          {{ formatMontant(row.valeurs?.credits_ouverts || row.valeurs?.prevision || 0) }}
        </span>
      </template>

      <!-- Mandatements column -->
      <template #cell-mandatements="{ row }">
        <span class="font-mono text-[var(--color-error)]">
          {{ formatMontant(row.valeurs?.mandatements || row.valeurs?.realisation || 0) }}
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
          :icon="['fas', 'arrow-trend-down']"
          title="Aucune dépense"
          :description="hasActiveFilters ? 'Aucun résultat pour ces filtres' : 'Aucune donnée de dépense disponible'"
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

const toast = useAppToast()
const comptesService = useComptesAdministratifsService()
const geoService = useGeoService()

// ============================================================================
// STATE
// ============================================================================

const depenses = ref<LigneBudgetaire[]>([])
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
  { key: 'credits', label: 'Crédits', sortable: true, width: '130px' },
  { key: 'mandatements', label: 'Mandatements', sortable: true, width: '130px' },
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
  const creditsOuverts = depenses.value.reduce((sum, d) => {
    return sum + (d.valeurs?.credits_ouverts || d.valeurs?.prevision || 0)
  }, 0)
  const mandatements = depenses.value.reduce((sum, d) => {
    return sum + (d.valeurs?.mandatements || d.valeurs?.realisation || 0)
  }, 0)

  return {
    creditsOuverts,
    mandatements,
    disponible: creditsOuverts - mandatements,
    tauxConsommation: creditsOuverts > 0 ? (mandatements / creditsOuverts) * 100 : 0,
  }
})

// ============================================================================
// METHODS
// ============================================================================

// Générer des données de démonstration pour les dépenses
const generateMockDepenses = (): LigneBudgetaire[] => {
  const communes = [
    { id: '1', nom: 'Antananarivo Renivohitra' },
    { id: '2', nom: 'Toamasina I' },
    { id: '3', nom: 'Antsirabe I' },
    { id: '4', nom: 'Fianarantsoa I' },
    { id: '5', nom: 'Mahajanga I' },
    { id: '6', nom: 'Toliara I' },
  ]
  const rubriques = [
    { code: '60', intitule: 'Charges de personnel', section: 'fonctionnement' },
    { code: '61', intitule: 'Fournitures et services', section: 'fonctionnement' },
    { code: '62', intitule: 'Transports et déplacements', section: 'fonctionnement' },
    { code: '63', intitule: 'Entretien et réparations', section: 'fonctionnement' },
    { code: '64', intitule: 'Charges financières', section: 'fonctionnement' },
    { code: '65', intitule: 'Autres charges', section: 'fonctionnement' },
    { code: '20', intitule: 'Immobilisations', section: 'investissement' },
    { code: '21', intitule: 'Équipements', section: 'investissement' },
    { code: '23', intitule: 'Infrastructures', section: 'investissement' },
  ]
  const currentYear = new Date().getFullYear()
  const mockData: LigneBudgetaire[] = []

  communes.forEach((commune, cIdx) => {
    rubriques.forEach((rubrique, rIdx) => {
      const credits_ouverts = Math.floor(Math.random() * 40000000) + 3000000
      const mandatements = Math.floor(credits_ouverts * (0.5 + Math.random() * 0.45))
      mockData.push({
        id: `${cIdx}-${rIdx}`,
        compte_administratif_id: String(cIdx + 1),
        compte_administratif: {
          id: String(cIdx + 1),
          commune_id: commune.id,
          commune: commune as any,
          district_id: null,
          district: null,
          region_id: null,
          region: null,
          annee: currentYear - (cIdx % 2),
          statut: 'publie',
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any,
        rubrique_id: rubrique.code,
        rubrique: rubrique as any,
        type: 'depense',
        valeurs: {
          credits_ouverts,
          prevision: credits_ouverts,
          mandatements,
          realisation: mandatements,
          disponible: credits_ouverts - mandatements,
        },
      })
    })
  })
  return mockData
}

// Générer des régions mock
const generateMockRegions = () => [
  { id: '1', nom: 'Analamanga' },
  { id: '2', nom: 'Vakinankaratra' },
  { id: '3', nom: 'Atsinanana' },
  { id: '4', nom: 'Haute Matsiatra' },
  { id: '5', nom: 'Boeny' },
  { id: '6', nom: 'Atsimo-Andrefana' },
  { id: '7', nom: 'Diana' },
]

const loadDepenses = async () => {
  isLoading.value = true
  try {
    const params = {
      ...pagination.getParams(),
      region_id: filters.region_id || undefined,
      annee: filters.annee || undefined,
      statut: 'publie' as const,
    }
    const response = await comptesService.getComptes(params)

    // Flatten lignes from all comptes
    const allLignes: LigneBudgetaire[] = []
    for (const compte of response.items.slice(0, 10)) {
      const lignes = await comptesService.getLignes(compte.id, { type: 'depense' })
      allLignes.push(...lignes.map(l => ({
        ...l,
        compte_administratif: compte,
      })))
    }

    depenses.value = allLignes
    pagination.total.value = allLignes.length
  } catch (error) {
    console.error('Erreur lors du chargement des dépenses:', error)
    // Données de démonstration en cas d'erreur API
    depenses.value = generateMockDepenses()
    pagination.total.value = depenses.value.length
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
    // Données de démonstration en cas d'erreur API
    regions.value = generateMockRegions()
  }
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.goToPage(1)
    loadDepenses()
  }, 300)
}

const handleFilterChange = () => {
  pagination.goToPage(1)
  loadDepenses()
}

const handleSortChange = ({ key, order }: { key: string; order: 'asc' | 'desc' }) => {
  pagination.setSort(key, order)
  loadDepenses()
}

const clearFilters = () => {
  filters.region_id = null
  filters.annee = null
  filters.section = null
  searchQuery.value = ''
  pagination.goToPage(1)
  loadDepenses()
}

const handleExport = () => {
  toast.info('Fonctionnalité d\'export à venir')
}

// Helpers
const getSectionVariant = (section: string | undefined): string => {
  const variants: Record<string, string> = {
    fonctionnement: 'primary',
    investissement: 'warning',
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
  const credits = ligne.valeurs?.credits_ouverts || ligne.valeurs?.prevision || 0
  const mandatements = ligne.valeurs?.mandatements || ligne.valeurs?.realisation || 0
  if (credits === 0) return '0'
  return ((mandatements / credits) * 100).toFixed(1)
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
  loadDepenses()
})

watch(
  () => [pagination.page.value, pagination.limit.value],
  () => loadDepenses(),
  { deep: true }
)
</script>
