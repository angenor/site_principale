<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Comptes Administratifs
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Gérez les comptes administratifs des collectivités territoriales
        </p>
      </div>
      <div class="flex items-center gap-3">
        <UiButton
          variant="outline"
          :icon="['fas', 'file-import']"
          @click="navigateTo('/admin/import')"
        >
          Importer
        </UiButton>
        <UiButton
          variant="primary"
          :icon="['fas', 'plus']"
          @click="openCreateModal"
        >
          Nouveau compte
        </UiButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <UiFormInput
            v-model="searchQuery"
            placeholder="Rechercher par commune..."
            :icon="['fas', 'search']"
            @update:model-value="debouncedSearch"
          />
        </div>

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

        <!-- Status filter -->
        <div class="w-40">
          <UiFormSelect
            v-model="filters.statut"
            label="Statut"
            :options="statutOptions"
            placeholder="Tous"
            @update:model-value="handleFilterChange"
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
      :data="comptes"
      :loading="isLoading"
      :total="pagination.total.value"
      :page="pagination.page.value"
      :limit="pagination.limit.value"
      :sortable="true"
      :sort-by="pagination.sortBy.value"
      :sort-order="pagination.sortOrder.value"
      row-key="id"
      @page-change="pagination.goToPage"
      @limit-change="pagination.setLimit"
      @sort-change="handleSortChange"
    >
      <!-- Collectivité column -->
      <template #cell-collectivite="{ row }">
        <NuxtLink
          :to="`/admin/comptes-administratifs/${row.id}`"
          class="block group"
        >
          <p class="font-medium text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
            {{ row.commune?.nom || row.district?.nom || row.region?.nom || 'N/A' }}
          </p>
          <p class="text-xs text-[var(--text-muted)]">
            {{ getCollectiviteType(row) }}
          </p>
        </NuxtLink>
      </template>

      <!-- Year column -->
      <template #cell-annee="{ row }">
        <span class="font-mono font-medium">{{ row.annee }}</span>
      </template>

      <!-- Status column -->
      <template #cell-statut="{ row }">
        <UiBadge :variant="getStatutVariant(row.statut)">
          {{ getStatutLabel(row.statut) }}
        </UiBadge>
      </template>

      <!-- Completion column -->
      <template #cell-completion="{ row }">
        <div class="flex items-center gap-2">
          <div class="flex-1 h-2 bg-[var(--bg-page)] rounded-full overflow-hidden">
            <div
              class="h-full bg-[var(--color-primary)] rounded-full transition-all"
              :style="{ width: `${getCompletionPercent(row)}%` }"
            />
          </div>
          <span class="text-xs text-[var(--text-muted)] font-mono w-10 text-right">
            {{ getCompletionPercent(row) }}%
          </span>
        </div>
      </template>

      <!-- Updated date column -->
      <template #cell-updated_at="{ row }">
        <span class="text-sm text-[var(--text-secondary)]">
          {{ formatDate(row.updated_at) }}
        </span>
      </template>

      <!-- Actions column -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-1">
          <UiButton
            variant="ghost"
            size="sm"
            :icon="['fas', 'eye']"
            title="Voir le détail"
            @click="navigateTo(`/admin/comptes-administratifs/${row.id}`)"
          />
          <UiButton
            variant="ghost"
            size="sm"
            :icon="['fas', 'edit']"
            title="Modifier"
            @click="openEditModal(row)"
          />
          <UiButton
            v-if="row.statut === 'brouillon'"
            variant="ghost"
            size="sm"
            :icon="['fas', 'check']"
            class="text-[var(--color-success)]"
            title="Valider"
            @click="handleValider(row)"
          />
          <UiButton
            v-if="row.statut === 'valide'"
            variant="ghost"
            size="sm"
            :icon="['fas', 'globe']"
            class="text-[var(--color-primary)]"
            title="Publier"
            @click="handlePublier(row)"
          />
          <UiButton
            variant="ghost"
            size="sm"
            :icon="['fas', 'trash']"
            class="text-[var(--color-error)]"
            title="Supprimer"
            @click="openDeleteModal(row)"
          />
        </div>
      </template>

      <!-- Empty state -->
      <template #empty>
        <UiEmptyState
          :icon="['fas', 'file-invoice-dollar']"
          title="Aucun compte administratif"
          :description="hasActiveFilters ? 'Aucun résultat pour ces filtres' : 'Commencez par créer un compte administratif'"
        >
          <template #action>
            <UiButton
              v-if="!hasActiveFilters"
              variant="primary"
              :icon="['fas', 'plus']"
              @click="openCreateModal"
            >
              Créer un compte
            </UiButton>
            <UiButton
              v-else
              variant="outline"
              @click="clearFilters"
            >
              Effacer les filtres
            </UiButton>
          </template>
        </UiEmptyState>
      </template>
    </UiDataTable>

    <!-- Create/Edit Modal -->
    <UiModal
      v-model="showFormModal"
      :title="editingCompte ? 'Modifier le compte' : 'Nouveau compte administratif'"
      size="md"
    >
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Region -->
          <UiFormSelect
            v-model="formData.region_id"
            label="Région"
            :options="regionOptions"
            placeholder="Sélectionner une région"
            :error="formErrors.region_id"
            @update:model-value="handleRegionChange"
          />

          <!-- District -->
          <UiFormSelect
            v-model="formData.district_id"
            label="District"
            :options="districtOptions"
            placeholder="Sélectionner un district"
            :disabled="!formData.region_id"
            :error="formErrors.district_id"
            @update:model-value="handleDistrictChange"
          />

          <!-- Commune -->
          <UiFormSelect
            v-model="formData.commune_id"
            label="Commune"
            :options="communeOptions"
            placeholder="Sélectionner une commune"
            :disabled="!formData.district_id"
            :error="formErrors.commune_id"
            required
          />

          <!-- Year -->
          <UiFormSelect
            v-model="formData.annee"
            label="Année"
            :options="yearOptions"
            placeholder="Sélectionner une année"
            :error="formErrors.annee"
            required
          />

          <!-- Notes -->
          <UiFormTextarea
            v-model="formData.notes"
            label="Notes"
            placeholder="Notes ou commentaires..."
            :rows="3"
          />
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <UiButton
            type="button"
            variant="outline"
            @click="showFormModal = false"
          >
            Annuler
          </UiButton>
          <UiButton
            type="submit"
            variant="primary"
            :loading="isSubmitting"
          >
            {{ editingCompte ? 'Enregistrer' : 'Créer' }}
          </UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Delete confirmation modal -->
    <UiModal
      v-model="showDeleteModal"
      title="Supprimer le compte"
      size="sm"
    >
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer le compte administratif de
        <strong class="text-[var(--text-primary)]">{{ deletingCompte?.commune?.nom }}</strong>
        pour l'année <strong class="text-[var(--text-primary)]">{{ deletingCompte?.annee }}</strong> ?
      </p>
      <p class="mt-2 text-sm text-[var(--color-error)]">
        Cette action est irréversible.
      </p>

      <div class="flex justify-end gap-3 mt-6">
        <UiButton
          variant="outline"
          @click="showDeleteModal = false"
        >
          Annuler
        </UiButton>
        <UiButton
          variant="danger"
          :loading="isDeleting"
          @click="handleDelete"
        >
          Supprimer
        </UiButton>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { CompteAdministratif, CompteAdministratifWithStats, CompteAdministratifFormData } from '~/types/comptes-administratifs'

definePageMeta({
  layout: 'admin',
})

const toast = useAppToast()
const comptesService = useComptesAdministratifsService()
const geoService = useGeoService()

// ============================================================================
// STATE
// ============================================================================

const comptes = ref<CompteAdministratifWithStats[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

// Filters
const filters = reactive({
  region_id: null as string | null,
  district_id: null as string | null,
  annee: null as number | null,
  statut: null as string | null,
})

// Form modal
const showFormModal = ref(false)
const editingCompte = ref<CompteAdministratif | null>(null)
const isSubmitting = ref(false)
const formData = reactive<CompteAdministratifFormData>({
  commune_id: null,
  district_id: null,
  region_id: null,
  annee: new Date().getFullYear(),
  statut: 'brouillon',
  notes: null,
})
const formErrors = reactive<Record<string, string>>({})

// Delete modal
const showDeleteModal = ref(false)
const deletingCompte = ref<CompteAdministratif | null>(null)
const isDeleting = ref(false)

// Geography data
const regions = ref<Array<{ id: string; nom: string }>>([])
const districts = ref<Array<{ id: string; nom: string; region_id: string }>>([])
const communes = ref<Array<{ id: string; nom: string; district_id: string }>>([])

// ============================================================================
// PAGINATION
// ============================================================================

const pagination = usePagination({
  defaultLimit: 20,
  syncWithUrl: true,
})

// ============================================================================
// COMPUTED
// ============================================================================

const columns = [
  { key: 'collectivite', label: 'Collectivité', sortable: false },
  { key: 'annee', label: 'Année', sortable: true, width: '100px' },
  { key: 'statut', label: 'Statut', sortable: true, width: '120px' },
  { key: 'completion', label: 'Complétion', sortable: false, width: '150px' },
  { key: 'updated_at', label: 'Modifié le', sortable: true, width: '140px' },
  { key: 'actions', label: '', width: '160px' },
]

const regionOptions = computed(() => [
  { value: '', label: 'Toutes les régions' },
  ...regions.value.map(r => ({ value: r.id, label: r.nom })),
])

const districtOptions = computed(() => {
  const filtered = formData.region_id
    ? districts.value.filter(d => d.region_id === formData.region_id)
    : districts.value
  return [
    { value: '', label: 'Tous les districts' },
    ...filtered.map(d => ({ value: d.id, label: d.nom })),
  ]
})

const communeOptions = computed(() => {
  const filtered = formData.district_id
    ? communes.value.filter(c => c.district_id === formData.district_id)
    : communes.value
  return filtered.map(c => ({ value: c.id, label: c.nom }))
})

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push({ value: y, label: String(y) })
  }
  return years
})

const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'valide', label: 'Validé' },
  { value: 'publie', label: 'Publié' },
  { value: 'archive', label: 'Archivé' },
]

const hasActiveFilters = computed(() => {
  return !!(filters.region_id || filters.annee || filters.statut || searchQuery.value)
})

// ============================================================================
// METHODS
// ============================================================================

const loadComptes = async () => {
  isLoading.value = true
  try {
    const params = {
      ...pagination.getParams(),
      search: searchQuery.value || undefined,
      region_id: filters.region_id || undefined,
      annee: filters.annee || undefined,
      statut: filters.statut || undefined,
    }
    const response = await comptesService.getComptes(params)
    comptes.value = response.items
    pagination.updateFromResponse(response)
  } catch (error) {
    console.error('Erreur lors du chargement des comptes:', error)
    // Données de démonstration en cas d'erreur API
    comptes.value = generateMockComptes()
    pagination.total.value = comptes.value.length
  } finally {
    isLoading.value = false
  }
}

// Générer des données de démonstration
const generateMockComptes = (): CompteAdministratifWithStats[] => {
  const communes = [
    { id: '1', nom: 'Antananarivo Renivohitra' },
    { id: '2', nom: 'Toamasina I' },
    { id: '3', nom: 'Antsirabe I' },
    { id: '4', nom: 'Fianarantsoa I' },
    { id: '5', nom: 'Mahajanga I' },
    { id: '6', nom: 'Toliara I' },
    { id: '7', nom: 'Antsiranana I' },
    { id: '8', nom: 'Ambatondrazaka' },
  ]
  const statuts = ['brouillon', 'valide', 'publie', 'publie', 'publie']
  const currentYear = new Date().getFullYear()

  return communes.map((commune, index) => ({
    id: String(index + 1),
    commune_id: commune.id,
    commune: commune as any,
    district_id: null,
    district: null,
    region_id: null,
    region: null,
    annee: currentYear - (index % 3),
    statut: statuts[index % statuts.length],
    notes: null,
    nombre_lignes: Math.floor(Math.random() * 50) + 20,
    total_recettes: Math.floor(Math.random() * 500000000) + 100000000,
    total_depenses: Math.floor(Math.random() * 400000000) + 80000000,
    created_at: new Date(Date.now() - index * 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - index * 86400000 * 7).toISOString(),
  }))
}

// Générer des données géographiques mock
const generateMockGeo = () => {
  const mockRegions = [
    { id: '1', nom: 'Analamanga' },
    { id: '2', nom: 'Vakinankaratra' },
    { id: '3', nom: 'Atsinanana' },
    { id: '4', nom: 'Haute Matsiatra' },
    { id: '5', nom: 'Boeny' },
    { id: '6', nom: 'Atsimo-Andrefana' },
    { id: '7', nom: 'Diana' },
  ]
  const mockDistricts = [
    { id: '1', nom: 'Antananarivo Renivohitra', region_id: '1' },
    { id: '2', nom: 'Antananarivo Atsimondrano', region_id: '1' },
    { id: '3', nom: 'Antsirabe I', region_id: '2' },
    { id: '4', nom: 'Toamasina I', region_id: '3' },
    { id: '5', nom: 'Fianarantsoa I', region_id: '4' },
    { id: '6', nom: 'Mahajanga I', region_id: '5' },
    { id: '7', nom: 'Toliara I', region_id: '6' },
    { id: '8', nom: 'Antsiranana I', region_id: '7' },
  ]
  const mockCommunes = [
    { id: '1', nom: 'Antananarivo Renivohitra', district_id: '1' },
    { id: '2', nom: 'Ambohidratrimo', district_id: '2' },
    { id: '3', nom: 'Antsirabe I', district_id: '3' },
    { id: '4', nom: 'Toamasina I', district_id: '4' },
    { id: '5', nom: 'Fianarantsoa I', district_id: '5' },
    { id: '6', nom: 'Mahajanga I', district_id: '6' },
    { id: '7', nom: 'Toliara I', district_id: '7' },
    { id: '8', nom: 'Antsiranana I', district_id: '8' },
  ]
  return { mockRegions, mockDistricts, mockCommunes }
}

const loadGeography = async () => {
  try {
    const [regionsData, communesData] = await Promise.all([
      geoService.getRegions({ limit: 100 }),
      geoService.getCommunes({ limit: 2000 }),
    ])
    regions.value = regionsData.items
    communes.value = communesData.items
    // Pas de districts dans la structure malgache (Province → Région → Commune)
    districts.value = []
  } catch (error) {
    console.error('Erreur lors du chargement des données géographiques:', error)
    // Données de démonstration en cas d'erreur API
    const { mockRegions, mockDistricts, mockCommunes } = generateMockGeo()
    regions.value = mockRegions
    districts.value = mockDistricts
    communes.value = mockCommunes
  }
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.goToPage(1)
    loadComptes()
  }, 300)
}

const handleFilterChange = () => {
  pagination.goToPage(1)
  loadComptes()
}

const handleSortChange = ({ key, order }: { key: string; order: 'asc' | 'desc' }) => {
  pagination.setSort(key, order)
  loadComptes()
}

const clearFilters = () => {
  filters.region_id = null
  filters.annee = null
  filters.statut = null
  searchQuery.value = ''
  pagination.goToPage(1)
  loadComptes()
}

// Form handling
const openCreateModal = () => {
  editingCompte.value = null
  Object.assign(formData, {
    commune_id: null,
    district_id: null,
    region_id: null,
    annee: new Date().getFullYear(),
    statut: 'brouillon',
    notes: null,
  })
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  showFormModal.value = true
}

const openEditModal = (compte: CompteAdministratif) => {
  editingCompte.value = compte
  Object.assign(formData, {
    commune_id: compte.commune_id,
    district_id: compte.district_id,
    region_id: compte.region_id,
    annee: compte.annee,
    statut: compte.statut,
    notes: compte.notes,
  })
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  showFormModal.value = true
}

const handleRegionChange = () => {
  formData.district_id = null
  formData.commune_id = null
}

const handleDistrictChange = () => {
  formData.commune_id = null
}

const handleSubmit = async () => {
  // Validation
  Object.keys(formErrors).forEach(key => delete formErrors[key])

  if (!formData.commune_id && !formData.district_id && !formData.region_id) {
    formErrors.commune_id = 'Sélectionnez au moins une collectivité'
    return
  }

  if (!formData.annee) {
    formErrors.annee = 'L\'année est requise'
    return
  }

  isSubmitting.value = true
  try {
    if (editingCompte.value) {
      await comptesService.updateCompte(editingCompte.value.id, formData)
      toast.success('Compte administratif mis à jour')
    } else {
      await comptesService.createCompte(formData)
      toast.success('Compte administratif créé')
    }
    showFormModal.value = false
    loadComptes()
  } catch (error: any) {
    toast.error(error.message || 'Une erreur est survenue')
  } finally {
    isSubmitting.value = false
  }
}

// Actions
const handleValider = async (compte: CompteAdministratif) => {
  try {
    await comptesService.validerCompte(compte.id)
    toast.success('Compte validé avec succès')
    loadComptes()
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de la validation')
  }
}

const handlePublier = async (compte: CompteAdministratif) => {
  try {
    await comptesService.publierCompte(compte.id)
    toast.success('Compte publié avec succès')
    loadComptes()
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de la publication')
  }
}

const openDeleteModal = (compte: CompteAdministratif) => {
  deletingCompte.value = compte
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!deletingCompte.value) return

  isDeleting.value = true
  try {
    await comptesService.deleteCompte(deletingCompte.value.id)
    toast.success('Compte supprimé avec succès')
    showDeleteModal.value = false
    loadComptes()
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de la suppression')
  } finally {
    isDeleting.value = false
  }
}

// Helpers
const getCollectiviteType = (compte: CompteAdministratif): string => {
  if (compte.commune) return 'Commune'
  if (compte.district) return 'District'
  if (compte.region) return 'Région'
  return ''
}

const getStatutVariant = (statut: string): string => {
  const variants: Record<string, string> = {
    brouillon: 'warning',
    valide: 'info',
    publie: 'success',
    archive: 'default',
  }
  return variants[statut] || 'default'
}

const getStatutLabel = (statut: string): string => {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    valide: 'Validé',
    publie: 'Publié',
    archive: 'Archivé',
  }
  return labels[statut] || statut
}

const getCompletionPercent = (compte: CompteAdministratifWithStats): number => {
  if (!compte.nombre_lignes) return 0
  // Estimation basée sur le nombre de lignes attendues (~50)
  return Math.min(100, Math.round((compte.nombre_lignes / 50) * 100))
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadGeography()
  loadComptes()
})

// Watch pagination changes
watch(
  () => [pagination.page.value, pagination.limit.value],
  () => loadComptes(),
  { deep: true }
)
</script>
