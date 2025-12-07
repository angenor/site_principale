<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Projets Miniers
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Gestion des projets d'exploitation minière
        </p>
      </div>
      <NuxtLink to="/admin/projets/create">
        <UiButton variant="primary" :icon="['fas', 'plus']">
          Nouveau projet
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Société filter -->
        <div class="w-48">
          <UiFormSelect
            v-model="filters.societe_id"
            label="Société"
            :options="societeOptions"
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

        <!-- Mineral type filter -->
        <div class="w-40">
          <UiFormSelect
            v-model="filters.type_minerai"
            label="Minerai"
            :options="mineraiOptions"
            placeholder="Tous"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <UiFormInput
            v-model="searchQuery"
            placeholder="Rechercher un projet..."
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
      :data="projets"
      :loading="loading"
      :sortable="true"
      :pagination="{
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
      }"
      empty-message="Aucun projet trouvé"
      @sort="handleSort"
      @page-change="handlePageChange"
    >
      <!-- Nom column -->
      <template #cell-nom="{ row }">
        <div>
          <NuxtLink
            :to="`/admin/projets/${row.id}`"
            class="font-medium text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            {{ row.nom }}
          </NuxtLink>
          <p class="text-xs text-[var(--text-muted)] font-mono">{{ row.code }}</p>
        </div>
      </template>

      <!-- Type minerai column -->
      <template #cell-type_minerai="{ value }">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
          <font-awesome-icon :icon="['fas', 'gem']" class="text-[10px]" />
          {{ value }}
        </span>
      </template>

      <!-- Société column -->
      <template #cell-societe_exploitante="{ value }">
        <span class="text-[var(--text-secondary)]">{{ value || '-' }}</span>
      </template>

      <!-- Statut column -->
      <template #cell-statut="{ value }">
        <span
          :class="[
            'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
            getStatutClass(value)
          ]"
        >
          {{ getStatutLabel(value) }}
        </span>
      </template>

      <!-- Revenus column -->
      <template #cell-total_revenus="{ value }">
        <span v-if="value" class="font-mono text-sm text-[var(--color-primary)]">
          {{ formatMoney(value) }}
        </span>
        <span v-else class="text-[var(--text-muted)]">-</span>
      </template>

      <!-- Actions column -->
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-2">
          <NuxtLink :to="`/admin/projets/${row.id}`">
            <UiButton variant="ghost" size="sm" :icon="['fas', 'eye']" title="Voir" />
          </NuxtLink>
          <NuxtLink :to="`/admin/projets/${row.id}?edit=true`">
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
      title="Supprimer le projet"
      size="sm"
      :confirm-loading="deleting"
      confirm-text="Supprimer"
      confirm-variant="danger"
      @confirm="handleDelete"
    >
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer le projet
        <strong class="text-[var(--text-primary)]">{{ projetToDelete?.nom }}</strong> ?
      </p>
      <p class="mt-2 text-sm text-[var(--text-muted)]">
        Cette action est irréversible. Les revenus associés seront également supprimés.
      </p>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { ProjetMinierWithStats } from '~/types/projets-miniers'
import type { Societe } from '~/services/projets.service'
import { useProjetsService } from '~/services/projets.service'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const projetsService = useProjetsService()
const toast = useToast()

// State
const projets = ref<ProjetMinierWithStats[]>([])
const societes = ref<Societe[]>([])
const typesMinerai = ref<string[]>([])
const loading = ref(true)
const searchQuery = ref('')
const filters = ref<{
  societe_id: string | null
  statut: 'en_cours' | 'suspendu' | 'termine' | 'planifie' | null
  type_minerai: string | null
}>({
  societe_id: null,
  statut: null,
  type_minerai: null,
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
const projetToDelete = ref<ProjetMinierWithStats | null>(null)
const deleting = ref(false)

// Table columns
const columns = [
  { key: 'nom', label: 'Projet', sortable: true },
  { key: 'type_minerai', label: 'Minerai', sortable: true, width: '120px' },
  { key: 'societe_exploitante', label: 'Société', sortable: true },
  { key: 'statut', label: 'Statut', sortable: true, width: '120px' },
  { key: 'total_revenus', label: 'Revenus', sortable: true, width: '140px' },
  { key: 'actions', label: '', width: '140px' },
]

// Computed
const societeOptions = computed(() => [
  { value: '', label: 'Toutes les sociétés' },
  ...societes.value.map(s => ({ value: s.id, label: s.nom })),
])

const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'planifie', label: 'Planifié' },
  { value: 'suspendu', label: 'Suspendu' },
  { value: 'termine', label: 'Terminé' },
]

const mineraiOptions = computed(() => [
  { value: '', label: 'Tous les types' },
  ...typesMinerai.value.map(t => ({ value: t, label: t })),
])

const hasActiveFilters = computed(() =>
  filters.value.societe_id !== null ||
  filters.value.statut !== null ||
  filters.value.type_minerai !== null ||
  searchQuery.value !== ''
)

// Methods
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 0,
  }).format(amount)
}

const getStatutLabel = (statut: string) => {
  const labels: Record<string, string> = {
    en_cours: 'En cours',
    suspendu: 'Suspendu',
    termine: 'Terminé',
    planifie: 'Planifié',
  }
  return labels[statut] || statut
}

const getStatutClass = (statut: string) => {
  const classes: Record<string, string> = {
    en_cours: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    suspendu: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    termine: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]',
    planifie: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
  }
  return classes[statut] || 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
}

const loadSocietes = async () => {
  try {
    societes.value = await projetsService.getAllSocietes()
  } catch (e) {
    console.error('Erreur chargement sociétés:', e)
    societes.value = [
      { id: '1', nom: 'QIT Madagascar Minerals', code: 'QMM', created_at: '', updated_at: '' },
      { id: '2', nom: 'Ambatovy Minerals', code: 'AMB', created_at: '', updated_at: '' },
      { id: '3', nom: 'Kraoma SA', code: 'KRA', created_at: '', updated_at: '' },
    ]
  }
}

const loadTypesMinerai = async () => {
  try {
    typesMinerai.value = await projetsService.getTypesMinerai()
  } catch (e) {
    console.error('Erreur chargement types minerai:', e)
    typesMinerai.value = ['Ilménite', 'Nickel', 'Cobalt', 'Chromite', 'Or', 'Graphite', 'Saphir']
  }
}

const loadProjets = async () => {
  loading.value = true

  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }

    if (filters.value.societe_id) params.societe_id = filters.value.societe_id
    if (filters.value.statut) params.statut = filters.value.statut
    if (filters.value.type_minerai) params.type_minerai = filters.value.type_minerai
    if (searchQuery.value) params.search = searchQuery.value
    if (sortBy.value) {
      params.sort_by = sortBy.value
      params.sort_order = sortOrder.value
    }

    const response = await projetsService.getProjets(params)
    projets.value = response.items
    pagination.value.total = response.total
    pagination.value.pages = response.pages
  } catch (e: any) {
    console.error('Erreur chargement projets:', e)

    // Mock data
    const mockProjets: ProjetMinierWithStats[] = [
      {
        id: '1',
        nom: 'Site de Mandena',
        code: 'QMM-MAN',
        type_minerai: 'Ilménite',
        societe_exploitante: 'QIT Madagascar Minerals',
        statut: 'en_cours',
        total_revenus: 2500000000,
        nombre_revenus: 12,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '2',
        nom: 'Ambatovy Mine',
        code: 'AMB-001',
        type_minerai: 'Nickel',
        societe_exploitante: 'Ambatovy Minerals',
        statut: 'en_cours',
        total_revenus: 5800000000,
        nombre_revenus: 24,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '3',
        nom: 'Bemanevika',
        code: 'KRA-BEM',
        type_minerai: 'Chromite',
        societe_exploitante: 'Kraoma SA',
        statut: 'en_cours',
        total_revenus: 850000000,
        nombre_revenus: 8,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '4',
        nom: 'Site de Petriky',
        code: 'QMM-PET',
        type_minerai: 'Ilménite',
        societe_exploitante: 'QIT Madagascar Minerals',
        statut: 'planifie',
        total_revenus: 0,
        nombre_revenus: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '5',
        nom: 'Ranobe',
        code: 'TLS-RAN',
        type_minerai: 'Ilménite',
        societe_exploitante: 'Toliara Sands',
        statut: 'suspendu',
        total_revenus: 0,
        nombre_revenus: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ]

    projets.value = mockProjets
    pagination.value.total = mockProjets.length
    pagination.value.pages = 1
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.value.page = 1
  loadProjets()
}

const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  loadProjets()
}, 300)

const clearFilters = () => {
  filters.value = {
    societe_id: null,
    statut: null,
    type_minerai: null,
  }
  searchQuery.value = ''
  pagination.value.page = 1
  loadProjets()
}

const handleSort = ({ key, order }: { key: string; order: 'asc' | 'desc' }) => {
  sortBy.value = key
  sortOrder.value = order
  loadProjets()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadProjets()
}

const confirmDelete = (projet: ProjetMinierWithStats) => {
  projetToDelete.value = projet
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!projetToDelete.value) return

  deleting.value = true
  try {
    await projetsService.deleteProjet(projetToDelete.value.id)
    toast.success(`Projet "${projetToDelete.value.nom}" supprimé`)
    showDeleteModal.value = false
    projetToDelete.value = null
    await loadProjets()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la suppression')
  } finally {
    deleting.value = false
  }
}

// Check for societe_id query param
onMounted(async () => {
  // Load filter data first
  await Promise.all([loadSocietes(), loadTypesMinerai()])

  // Apply societe_id from query if present
  if (route.query.societe_id) {
    filters.value.societe_id = route.query.societe_id as string
  }

  await loadProjets()
})
</script>
