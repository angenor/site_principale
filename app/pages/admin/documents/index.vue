<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Documents
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Gérer les documents et fichiers de la plateforme
        </p>
      </div>
      <NuxtLink to="/admin/documents/upload">
        <UiButton variant="primary" :icon="['fas', 'upload']">
          Importer des documents
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'file']" class="text-[var(--color-primary)]" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Total documents</p>
            <p class="text-xl font-bold text-[var(--text-primary)]">{{ stats.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'globe']" class="text-emerald-500" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Publics</p>
            <p class="text-xl font-bold text-emerald-600">{{ stats.publics }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'lock']" class="text-amber-500" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Privés</p>
            <p class="text-xl font-bold text-amber-600">{{ stats.prives }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'download']" class="text-blue-500" />
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Téléchargements</p>
            <p class="text-xl font-bold text-blue-600">{{ stats.downloads }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- Search -->
        <UiFormInput
          v-model="filters.search"
          label=""
          placeholder="Rechercher par titre..."
          :icon="['fas', 'search']"
        />

        <!-- Type filter -->
        <UiFormSelect
          v-model="filters.type_fichier"
          label=""
          :options="typeOptions"
          placeholder="Tous les types"
        />

        <!-- Visibility filter -->
        <UiFormSelect
          v-model="filters.est_public"
          label=""
          :options="visibilityOptions"
          placeholder="Toute visibilité"
        />

        <!-- Compte filter -->
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

    <!-- Documents grid -->
    <div v-if="loading" class="flex justify-center py-12">
      <UiLoadingSpinner size="lg" />
    </div>

    <div v-else-if="documents.length === 0" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-12 text-center">
      <font-awesome-icon :icon="['fas', 'folder-open']" class="text-4xl text-[var(--text-muted)] mb-4" />
      <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">Aucun document trouvé</h3>
      <p class="text-[var(--text-secondary)] mb-4">Importez des documents pour commencer.</p>
      <NuxtLink to="/admin/documents/upload">
        <UiButton variant="primary" :icon="['fas', 'upload']">
          Importer des documents
        </UiButton>
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden hover:border-[var(--color-primary)]/30 transition-colors"
      >
        <!-- Preview area -->
        <div class="h-32 bg-[var(--bg-secondary)] flex items-center justify-center relative">
          <font-awesome-icon
            :icon="getFileIcon(doc.type_fichier)"
            :class="getFileColorClass(doc.type_fichier)"
            class="text-4xl"
          />
          <!-- Visibility badge -->
          <div class="absolute top-2 right-2">
            <UiBadge :variant="doc.est_public ? 'success' : 'warning'" size="sm">
              <font-awesome-icon :icon="doc.est_public ? ['fas', 'globe'] : ['fas', 'lock']" class="mr-1" />
              {{ doc.est_public ? 'Public' : 'Privé' }}
            </UiBadge>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <NuxtLink
            :to="`/admin/documents/${doc.id}`"
            class="block font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors mb-1 truncate"
          >
            {{ doc.titre }}
          </NuxtLink>

          <p v-if="doc.description" class="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
            {{ doc.description }}
          </p>

          <div class="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] mb-3">
            <span class="flex items-center gap-1">
              <font-awesome-icon :icon="['fas', 'file']" />
              {{ doc.fichier_nom }}
            </span>
            <span v-if="doc.taille_fichier" class="flex items-center gap-1">
              <font-awesome-icon :icon="['fas', 'weight']" />
              {{ formatFileSize(doc.taille_fichier) }}
            </span>
            <span class="flex items-center gap-1">
              <font-awesome-icon :icon="['fas', 'download']" />
              {{ doc.nombre_telechargements }} téléch.
            </span>
          </div>

          <!-- Tags -->
          <div v-if="doc.tags && doc.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
            <span
              v-for="tag in doc.tags.slice(0, 3)"
              :key="tag"
              class="px-2 py-0.5 text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded"
            >
              {{ tag }}
            </span>
            <span v-if="doc.tags.length > 3" class="text-xs text-[var(--text-muted)]">
              +{{ doc.tags.length - 3 }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
            <span class="text-xs text-[var(--text-muted)]">
              {{ formatDate(doc.created_at) }}
            </span>
            <div class="flex items-center gap-1">
              <button
                @click="downloadDocument(doc)"
                class="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                title="Télécharger"
              >
                <font-awesome-icon :icon="['fas', 'download']" />
              </button>
              <NuxtLink
                :to="`/admin/documents/${doc.id}`"
                class="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                title="Voir / Éditer"
              >
                <font-awesome-icon :icon="['fas', 'eye']" />
              </NuxtLink>
              <button
                @click="confirmDelete(doc)"
                class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Supprimer"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </div>
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
    <UiModal v-model="showDeleteModal" title="Supprimer le document" size="sm">
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer le document <strong>{{ documentToDelete?.titre }}</strong> ?
        Cette action est irréversible.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UiButton variant="outline" @click="showDeleteModal = false">
            Annuler
          </UiButton>
          <UiButton variant="danger" @click="deleteDocument" :loading="deleting">
            Supprimer
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types/autres-modules'
import { useDocumentsService } from '~/services/documents.service'
import { useComptesAdministratifsService } from '~/services/comptes-administratifs.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const documentsService = useDocumentsService()
const comptesService = useComptesAdministratifsService()
const toast = useAppToast()

// State
const documents = ref<Document[]>([])
const comptes = ref<Array<{ id: string; annee: number; commune?: { nom: string } }>>([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 12

// Filters
const filters = ref({
  search: '',
  type_fichier: '',
  est_public: '',
  compte_administratif_id: '',
})

// Delete modal
const showDeleteModal = ref(false)
const documentToDelete = ref<Document | null>(null)
const deleting = ref(false)

// Stats
const stats = computed(() => ({
  total: documents.value.length,
  publics: documents.value.filter(d => d.est_public).length,
  prives: documents.value.filter(d => !d.est_public).length,
  downloads: documents.value.reduce((sum, d) => sum + d.nombre_telechargements, 0),
}))

// Options
const typeOptions = [
  { value: '', label: 'Tous les types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'word', label: 'Word' },
  { value: 'autre', label: 'Autre' },
]

const visibilityOptions = [
  { value: '', label: 'Toute visibilité' },
  { value: 'true', label: 'Public' },
  { value: 'false', label: 'Privé' },
]

const compteOptions = computed(() => [
  { value: '', label: 'Tous les comptes' },
  ...comptes.value.map(c => ({
    value: c.id,
    label: `${c.commune?.nom || 'N/A'} - ${c.annee}`,
  })),
])

// Methods
const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf': return ['fas', 'file-pdf']
    case 'excel': return ['fas', 'file-excel']
    case 'word': return ['fas', 'file-word']
    default: return ['fas', 'file']
  }
}

const getFileColorClass = (type: string) => {
  switch (type) {
    case 'pdf': return 'text-red-500'
    case 'excel': return 'text-emerald-500'
    case 'word': return 'text-blue-500'
    default: return 'text-gray-500'
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const [documentsData, comptesData] = await Promise.all([
      documentsService.getDocuments({
        page: currentPage.value,
        limit: pageSize,
        search: filters.value.search || undefined,
        type_fichier: filters.value.type_fichier as any || undefined,
        est_public: filters.value.est_public ? filters.value.est_public === 'true' : undefined,
        compte_administratif_id: filters.value.compte_administratif_id || undefined,
      }),
      comptesService.getComptes({ limit: 100 }),
    ])
    documents.value = documentsData.items
    totalPages.value = Math.ceil(documentsData.total / pageSize)
    comptes.value = comptesData.items
  } catch (e) {
    console.error('Erreur chargement documents:', e)
    // Mock data for development
    documents.value = [
      {
        id: '1',
        titre: 'Compte Administratif 2024 - Antananarivo',
        description: 'Rapport complet du compte administratif de la commune d\'Antananarivo pour l\'exercice 2024.',
        type_fichier: 'pdf',
        fichier_url: '/documents/ca-2024-antananarivo.pdf',
        fichier_nom: 'ca-2024-antananarivo.pdf',
        taille_fichier: 2458624,
        nombre_telechargements: 156,
        est_public: true,
        tags: ['compte administratif', '2024', 'antananarivo'],
        created_at: '2024-03-15T10:30:00Z',
        updated_at: '2024-03-15T10:30:00Z',
      },
      {
        id: '2',
        titre: 'Budget Primitif 2024',
        description: 'Document budgétaire initial pour l\'exercice 2024.',
        type_fichier: 'excel',
        fichier_url: '/documents/bp-2024.xlsx',
        fichier_nom: 'bp-2024.xlsx',
        taille_fichier: 856024,
        nombre_telechargements: 89,
        est_public: true,
        tags: ['budget', '2024'],
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-10T08:00:00Z',
      },
      {
        id: '3',
        titre: 'Délibération Conseil Municipal',
        description: 'Procès-verbal de la séance du conseil municipal.',
        type_fichier: 'word',
        fichier_url: '/documents/deliberation-cm.docx',
        fichier_nom: 'deliberation-cm.docx',
        taille_fichier: 245760,
        nombre_telechargements: 23,
        est_public: false,
        tags: ['délibération', 'conseil'],
        created_at: '2024-02-20T14:15:00Z',
        updated_at: '2024-02-20T14:15:00Z',
      },
      {
        id: '4',
        titre: 'Rapport d\'activité 2023',
        description: 'Rapport annuel des activités de la commune.',
        type_fichier: 'pdf',
        fichier_url: '/documents/rapport-2023.pdf',
        fichier_nom: 'rapport-activite-2023.pdf',
        taille_fichier: 5242880,
        nombre_telechargements: 67,
        est_public: true,
        created_at: '2024-01-05T09:00:00Z',
        updated_at: '2024-01-05T09:00:00Z',
      },
      {
        id: '5',
        titre: 'Données financières brutes',
        type_fichier: 'excel',
        fichier_url: '/documents/data-2024.xlsx',
        fichier_nom: 'donnees-financieres-2024.xlsx',
        taille_fichier: 1048576,
        nombre_telechargements: 12,
        est_public: false,
        tags: ['données', 'interne'],
        created_at: '2024-03-01T11:30:00Z',
        updated_at: '2024-03-01T11:30:00Z',
      },
      {
        id: '6',
        titre: 'Carte des projets miniers',
        type_fichier: 'autre',
        fichier_url: '/documents/carte-projets.png',
        fichier_nom: 'carte-projets-miniers.png',
        taille_fichier: 3145728,
        nombre_telechargements: 45,
        est_public: true,
        tags: ['carte', 'projets miniers'],
        created_at: '2024-02-15T16:00:00Z',
        updated_at: '2024-02-15T16:00:00Z',
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
    type_fichier: '',
    est_public: '',
    compte_administratif_id: '',
  }
  currentPage.value = 1
}

const confirmDelete = (doc: Document) => {
  documentToDelete.value = doc
  showDeleteModal.value = true
}

const deleteDocument = async () => {
  if (!documentToDelete.value) return

  deleting.value = true
  try {
    await documentsService.deleteDocument(documentToDelete.value.id)
    toast.success('Document supprimé avec succès')
    showDeleteModal.value = false
    loadData()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la suppression')
  } finally {
    deleting.value = false
  }
}

const downloadDocument = async (doc: Document) => {
  try {
    const blob = await documentsService.downloadDocument(doc.id)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.fichier_nom
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Téléchargement démarré')
  } catch (e: any) {
    // Fallback: open URL directly
    window.open(doc.fichier_url, '_blank')
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
