<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Pages CMS
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Gérer les pages des comptes administratifs
        </p>
      </div>
      <NuxtLink to="/admin/cms/pages/create">
        <UiButton variant="primary" :icon="['fas', 'plus']">
          Nouvelle page
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <UiFormInput
          v-model="filters.search"
          label=""
          placeholder="Rechercher par titre..."
          :icon="['fas', 'search']"
        />

        <!-- Status filter -->
        <UiFormSelect
          v-model="filters.statut"
          label=""
          :options="statutOptions"
          placeholder="Tous les statuts"
        />

        <!-- Compte Administratif filter -->
        <UiFormSelect
          v-model="filters.compte_administratif_id"
          label=""
          :options="compteOptions"
          placeholder="Tous les comptes"
        />

        <!-- Reset -->
        <div class="flex items-end">
          <UiButton variant="ghost" @click="resetFilters" :icon="['fas', 'rotate-left']">
            Réinitialiser
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'file-alt']" class="text-[var(--color-primary)]" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Total pages</p>
            <p class="text-xl font-bold text-[var(--text-primary)]">{{ stats.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="text-emerald-500" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Publiées</p>
            <p class="text-xl font-bold text-emerald-600">{{ stats.publiees }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'edit']" class="text-amber-500" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Brouillons</p>
            <p class="text-xl font-bold text-amber-600">{{ stats.brouillons }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'archive']" class="text-gray-500" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Archivées</p>
            <p class="text-xl font-bold text-gray-600">{{ stats.archivees }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pages list -->
    <div v-if="loading" class="flex justify-center py-12">
      <UiLoadingSpinner size="lg" />
    </div>

    <div v-else-if="pages.length === 0" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-12 text-center">
      <font-awesome-icon :icon="['fas', 'file-alt']" class="text-4xl text-[var(--text-muted)] mb-4" />
      <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">Aucune page trouvée</h3>
      <p class="text-[var(--text-secondary)] mb-4">Créez votre première page CMS pour un compte administratif.</p>
      <NuxtLink to="/admin/cms/pages/create">
        <UiButton variant="primary" :icon="['fas', 'plus']">
          Créer une page
        </UiButton>
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="page in pages"
        :key="page.id"
        class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 hover:border-[var(--color-primary)]/30 transition-colors"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <NuxtLink
                :to="`/admin/cms/pages/${page.id}`"
                class="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors truncate"
              >
                {{ page.titre }}
              </NuxtLink>
              <UiBadge :variant="getStatutVariant(page.statut)">
                {{ getStatutLabel(page.statut) }}
              </UiBadge>
            </div>

            <p v-if="page.description" class="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
              {{ page.description }}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
              <span v-if="page.compte_administratif" class="flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'building']" class="w-3 h-3" />
                {{ page.compte_administratif.commune?.nom || 'N/A' }} - {{ page.compte_administratif.annee }}
              </span>
              <span class="flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'puzzle-piece']" class="w-3 h-3" />
                {{ page.sections?.length || 0 }} section(s)
              </span>
              <span class="flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'link']" class="w-3 h-3" />
                /{{ page.slug }}
              </span>
              <span v-if="page.date_publication" class="flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'calendar']" class="w-3 h-3" />
                Publié le {{ formatDate(page.date_publication) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="page.statut === 'brouillon'"
              @click="publierPage(page)"
              class="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              title="Publier"
            >
              <font-awesome-icon :icon="['fas', 'globe']" />
            </button>
            <button
              v-if="page.statut === 'publie'"
              @click="archiverPage(page)"
              class="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Archiver"
            >
              <font-awesome-icon :icon="['fas', 'archive']" />
            </button>
            <NuxtLink
              :to="`/admin/cms/pages/${page.id}`"
              class="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
              title="Éditer"
            >
              <font-awesome-icon :icon="['fas', 'edit']" />
            </NuxtLink>
            <button
              @click="dupliquerPage(page)"
              class="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
              title="Dupliquer"
            >
              <font-awesome-icon :icon="['fas', 'copy']" />
            </button>
            <button
              @click="confirmDelete(page)"
              class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Supprimer"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center">
      <div class="flex items-center gap-2">
        <UiButton
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </UiButton>
        <span class="px-4 text-sm text-[var(--text-secondary)]">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>
        <UiButton
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </UiButton>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <UiModal v-model="showDeleteModal" title="Supprimer la page" size="sm">
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer la page <strong>{{ pageToDelete?.titre }}</strong> ?
        Cette action est irréversible.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UiButton variant="outline" @click="showDeleteModal = false">
            Annuler
          </UiButton>
          <UiButton variant="danger" @click="deletePage" :loading="deleting">
            Supprimer
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { PageCMS } from '~/services/cms.service'
import { useCMSService } from '~/services/cms.service'
import { useComptesAdministratifsService } from '~/services/comptes-administratifs.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const cmsService = useCMSService()
const comptesService = useComptesAdministratifsService()
const toast = useToast()

// State
const pages = ref<PageCMS[]>([])
const comptes = ref<Array<{ id: string; annee: number; commune?: { nom: string } }>>([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 10

// Filters
const filters = ref({
  search: '',
  statut: '',
  compte_administratif_id: '',
})

// Delete modal
const showDeleteModal = ref(false)
const pageToDelete = ref<PageCMS | null>(null)
const deleting = ref(false)

// Stats
const stats = computed(() => ({
  total: pages.value.length,
  publiees: pages.value.filter(p => p.statut === 'publie').length,
  brouillons: pages.value.filter(p => p.statut === 'brouillon').length,
  archivees: pages.value.filter(p => p.statut === 'archive').length,
}))

// Options
const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'publie', label: 'Publiée' },
  { value: 'archive', label: 'Archivée' },
]

const compteOptions = computed(() => [
  { value: '', label: 'Tous les comptes' },
  ...comptes.value.map(c => ({
    value: c.id,
    label: `${c.commune?.nom || 'N/A'} - ${c.annee}`,
  })),
])

// Methods
const getStatutVariant = (statut: string) => {
  switch (statut) {
    case 'publie': return 'success'
    case 'brouillon': return 'warning'
    case 'archive': return 'neutral'
    default: return 'neutral'
  }
}

const getStatutLabel = (statut: string) => {
  switch (statut) {
    case 'publie': return 'Publiée'
    case 'brouillon': return 'Brouillon'
    case 'archive': return 'Archivée'
    default: return statut
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const [pagesData, comptesData] = await Promise.all([
      cmsService.getPages({
        page: currentPage.value,
        limit: pageSize,
        search: filters.value.search || undefined,
        statut: filters.value.statut as any || undefined,
        compte_administratif_id: filters.value.compte_administratif_id || undefined,
      }),
      comptesService.getComptes({ limit: 100 }),
    ])
    pages.value = pagesData.items
    totalPages.value = Math.ceil(pagesData.total / pageSize)
    comptes.value = comptesData.items
  } catch (e) {
    console.error('Erreur chargement pages CMS:', e)
    // Mock data for development
    pages.value = [
      {
        id: '1',
        compte_administratif_id: '1',
        titre: 'Compte Administratif 2024 - Antananarivo',
        slug: 'ca-2024-antananarivo',
        description: 'Présentation complète du compte administratif de la commune d\'Antananarivo pour l\'exercice 2024.',
        statut: 'publie',
        date_publication: '2024-03-15',
        ordre: 1,
        created_at: '2024-01-10',
        updated_at: '2024-03-15',
        compte_administratif: { id: '1', annee: 2024, commune: { id: '1', nom: 'Antananarivo' } },
        sections: [{} as any, {} as any, {} as any],
      },
      {
        id: '2',
        compte_administratif_id: '2',
        titre: 'Compte Administratif 2024 - Toamasina',
        slug: 'ca-2024-toamasina',
        description: 'Bilan financier de la commune de Toamasina.',
        statut: 'brouillon',
        ordre: 2,
        created_at: '2024-02-20',
        updated_at: '2024-02-25',
        compte_administratif: { id: '2', annee: 2024, commune: { id: '2', nom: 'Toamasina' } },
        sections: [{} as any],
      },
      {
        id: '3',
        compte_administratif_id: '3',
        titre: 'Compte Administratif 2023 - Fianarantsoa',
        slug: 'ca-2023-fianarantsoa',
        statut: 'archive',
        ordre: 3,
        created_at: '2023-03-01',
        updated_at: '2024-01-05',
        compte_administratif: { id: '3', annee: 2023, commune: { id: '3', nom: 'Fianarantsoa' } },
        sections: [{} as any, {} as any],
      },
    ]
    comptes.value = [
      { id: '1', annee: 2024, commune: { nom: 'Antananarivo' } },
      { id: '2', annee: 2024, commune: { nom: 'Toamasina' } },
      { id: '3', annee: 2023, commune: { nom: 'Fianarantsoa' } },
    ]
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    search: '',
    statut: '',
    compte_administratif_id: '',
  }
  currentPage.value = 1
}

const confirmDelete = (page: PageCMS) => {
  pageToDelete.value = page
  showDeleteModal.value = true
}

const deletePage = async () => {
  if (!pageToDelete.value) return

  deleting.value = true
  try {
    await cmsService.deletePage(pageToDelete.value.id)
    toast.success('Page supprimée avec succès')
    showDeleteModal.value = false
    loadData()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la suppression')
  } finally {
    deleting.value = false
  }
}

const publierPage = async (page: PageCMS) => {
  try {
    await cmsService.publierPage(page.id)
    toast.success('Page publiée avec succès')
    loadData()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la publication')
  }
}

const archiverPage = async (page: PageCMS) => {
  try {
    await cmsService.archiverPage(page.id)
    toast.success('Page archivée avec succès')
    loadData()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de l\'archivage')
  }
}

const dupliquerPage = async (page: PageCMS) => {
  try {
    const newPage = await cmsService.dupliquerPage(page.id)
    toast.success('Page dupliquée avec succès')
    navigateTo(`/admin/cms/pages/${newPage.id}`)
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la duplication')
  }
}

// Watchers
watch([filters, currentPage], () => {
  loadData()
}, { deep: true })

// Load on mount
onMounted(() => {
  loadData()
})
</script>
