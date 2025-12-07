<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/admin/documents"
          class="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="text-[var(--text-muted)]" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">
            {{ isEditing ? 'Modifier le document' : 'Détails du document' }}
          </h1>
          <p class="text-[var(--text-muted)]">
            {{ isEditing ? 'Modifiez les informations du document' : 'Consultez les détails du document' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <template v-if="!isEditing">
          <button
            @click="downloadDocument"
            class="px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2"
          >
            <font-awesome-icon :icon="['fas', 'download']" />
            Télécharger
          </button>
          <button
            @click="isEditing = true"
            class="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2"
          >
            <font-awesome-icon :icon="['fas', 'pen']" />
            Modifier
          </button>
        </template>
        <template v-else>
          <button
            @click="cancelEdit"
            class="px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Annuler
          </button>
          <button
            @click="saveDocument"
            :disabled="isSaving"
            class="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <font-awesome-icon :icon="['fas', isSaving ? 'spinner' : 'check']" :class="{ 'animate-spin': isSaving }" />
            {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </template>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiLoadingSpinner size="lg" />
    </div>

    <!-- Content -->
    <div v-else-if="document" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Document info card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
          <!-- File preview header -->
          <div class="p-8 bg-[var(--bg-secondary)] flex items-center justify-center">
            <div class="text-center">
              <div
                class="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4"
                :class="getFileTypeClass(document.type_fichier)"
              >
                <font-awesome-icon :icon="getFileIcon(document.type_fichier)" class="text-4xl" />
              </div>
              <p class="text-sm text-[var(--text-muted)]">{{ document.fichier_nom }}</p>
              <p v-if="document.taille_fichier" class="text-xs text-[var(--text-muted)] mt-1">
                {{ formatFileSize(document.taille_fichier) }}
              </p>
            </div>
          </div>

          <!-- Form content -->
          <div class="p-6 space-y-6">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Titre du document *
              </label>
              <input
                v-if="isEditing"
                v-model="editForm.titre"
                type="text"
                class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                placeholder="Titre du document"
              />
              <p v-else class="text-lg font-semibold text-[var(--text-primary)]">
                {{ document.titre }}
              </p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Description
              </label>
              <textarea
                v-if="isEditing"
                v-model="editForm.description"
                rows="4"
                class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors resize-none"
                placeholder="Description du document..."
              />
              <p v-else class="text-[var(--text-secondary)]">
                {{ document.description || 'Aucune description' }}
              </p>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Tags
              </label>
              <div v-if="isEditing" class="space-y-3">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(tag, index) in editForm.tags"
                    :key="index"
                    class="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm flex items-center gap-2"
                  >
                    {{ tag }}
                    <button @click="removeTag(index)" class="hover:text-red-500 transition-colors">
                      <font-awesome-icon :icon="['fas', 'times']" class="text-xs" />
                    </button>
                  </span>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="newTag"
                    type="text"
                    class="flex-1 px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                    placeholder="Ajouter un tag..."
                    @keyup.enter="addTag"
                  />
                  <button
                    @click="addTag"
                    class="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </button>
                </div>
              </div>
              <div v-else class="flex flex-wrap gap-2">
                <span
                  v-for="tag in document.tags"
                  :key="tag"
                  class="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm"
                >
                  {{ tag }}
                </span>
                <span v-if="!document.tags?.length" class="text-[var(--text-muted)]">
                  Aucun tag
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Status card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h3 class="font-semibold text-[var(--text-primary)] mb-4">Paramètres</h3>

          <div class="space-y-4">
            <!-- Visibility -->
            <div>
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Visibilité
              </label>
              <div v-if="isEditing" class="flex gap-2">
                <button
                  @click="editForm.est_public = true"
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2',
                    editForm.est_public
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-emerald-500/50'
                  ]"
                >
                  <font-awesome-icon :icon="['fas', 'globe']" />
                  Public
                </button>
                <button
                  @click="editForm.est_public = false"
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2',
                    !editForm.est_public
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-amber-500/50'
                  ]"
                >
                  <font-awesome-icon :icon="['fas', 'lock']" />
                  Privé
                </button>
              </div>
              <div
                v-else
                :class="[
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                  document.est_public
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                ]"
              >
                <font-awesome-icon :icon="['fas', document.est_public ? 'globe' : 'lock']" />
                {{ document.est_public ? 'Public' : 'Privé' }}
              </div>
            </div>

            <!-- File type -->
            <div>
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Type de fichier
              </label>
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="getFileTypeClass(document.type_fichier)"
                >
                  <font-awesome-icon :icon="getFileIcon(document.type_fichier)" class="text-sm" />
                </div>
                <span class="text-[var(--text-primary)] capitalize">{{ document.type_fichier }}</span>
              </div>
            </div>

            <!-- Compte administratif -->
            <div v-if="isEditing">
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Compte administratif
              </label>
              <select
                v-model="editForm.compte_administratif_id"
                class="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
              >
                <option value="">Aucun</option>
                <option v-for="compte in comptes" :key="compte.id" :value="compte.id">
                  {{ compte.label }}
                </option>
              </select>
            </div>
            <div v-else-if="document.compte_administratif_id">
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Compte administratif
              </label>
              <p class="text-[var(--text-secondary)]">
                {{ getCompteLabel(document.compte_administratif_id) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Stats card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h3 class="font-semibold text-[var(--text-primary)] mb-4">Statistiques</h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Téléchargements</span>
              <span class="font-semibold text-[var(--text-primary)]">
                {{ document.nombre_telechargements }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Créé le</span>
              <span class="text-[var(--text-primary)]">
                {{ formatDate(document.created_at) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Modifié le</span>
              <span class="text-[var(--text-primary)]">
                {{ formatDate(document.updated_at) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Danger zone -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-red-500/30 p-6">
          <h3 class="font-semibold text-red-500 mb-4">Zone de danger</h3>
          <p class="text-sm text-[var(--text-muted)] mb-4">
            La suppression d'un document est irréversible.
          </p>
          <button
            @click="showDeleteModal = true"
            class="w-full px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <font-awesome-icon :icon="['fas', 'trash']" />
            Supprimer le document
          </button>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="text-center py-20">
      <font-awesome-icon :icon="['fas', 'file-circle-xmark']" class="text-6xl text-[var(--text-muted)] mb-4" />
      <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-2">Document non trouvé</h2>
      <p class="text-[var(--text-muted)] mb-6">Le document demandé n'existe pas ou a été supprimé.</p>
      <NuxtLink
        to="/admin/documents"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        Retour à la liste
      </NuxtLink>
    </div>

    <!-- Delete confirmation modal -->
    <UiModal
      v-model="showDeleteModal"
      title="Supprimer le document"
      :confirm-text="'Supprimer'"
      :confirm-variant="'danger'"
      @confirm="deleteDocument"
    >
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer le document <strong>{{ document?.titre }}</strong> ?
        Cette action est irréversible.
      </p>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { Document, DocumentFormData } from '~/types/autres-modules'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const documentsService = useDocumentsService()

const documentId = computed(() => route.params.id as string)

const isLoading = ref(true)
const isEditing = ref(false)
const isSaving = ref(false)
const showDeleteModal = ref(false)
const document = ref<Document | null>(null)
const newTag = ref('')

const editForm = ref<Partial<DocumentFormData>>({
  titre: '',
  description: '',
  est_public: true,
  tags: [],
  compte_administratif_id: '',
})

// Mock comptes for development
const comptes = ref([
  { id: 'compte-1', label: 'Antsirabe - 2023' },
  { id: 'compte-2', label: 'Fianarantsoa - 2023' },
  { id: 'compte-3', label: 'Toamasina - 2022' },
])

const getCompteLabel = (id: string) => {
  const compte = comptes.value.find(c => c.id === id)
  return compte?.label || id
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return ['fas', 'file-pdf']
    case 'excel':
      return ['fas', 'file-excel']
    case 'word':
      return ['fas', 'file-word']
    default:
      return ['fas', 'file']
  }
}

const getFileTypeClass = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    case 'excel':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'word':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !editForm.value.tags?.includes(tag)) {
    editForm.value.tags = [...(editForm.value.tags || []), tag]
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  editForm.value.tags = editForm.value.tags?.filter((_, i) => i !== index)
}

const cancelEdit = () => {
  if (document.value) {
    editForm.value = {
      titre: document.value.titre,
      description: document.value.description || '',
      est_public: document.value.est_public,
      tags: [...(document.value.tags || [])],
      compte_administratif_id: document.value.compte_administratif_id || '',
    }
  }
  isEditing.value = false
}

const saveDocument = async () => {
  if (!document.value) return

  isSaving.value = true
  try {
    const updated = await documentsService.updateDocument(documentId.value, editForm.value)
    document.value = updated
    isEditing.value = false
  } catch (error) {
    console.error('Error saving document:', error)
  } finally {
    isSaving.value = false
  }
}

const downloadDocument = async () => {
  if (!document.value) return

  try {
    await documentsService.incrementDownloadCount(documentId.value)
    const blob = await documentsService.downloadDocument(documentId.value)
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = document.value.fichier_nom
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Update local count
    document.value.nombre_telechargements++
  } catch (error) {
    console.error('Error downloading document:', error)
  }
}

const deleteDocument = async () => {
  if (!document.value) return

  try {
    await documentsService.deleteDocument(documentId.value)
    router.push('/admin/documents')
  } catch (error) {
    console.error('Error deleting document:', error)
  }
}

const loadDocument = async () => {
  isLoading.value = true
  try {
    const data = await documentsService.getDocument(documentId.value)
    document.value = data
    editForm.value = {
      titre: data.titre,
      description: data.description || '',
      est_public: data.est_public,
      tags: [...(data.tags || [])],
      compte_administratif_id: data.compte_administratif_id || '',
    }
  } catch (error) {
    console.error('Error loading document:', error)
    // Mock data for development
    document.value = {
      id: documentId.value,
      titre: 'Compte Administratif Antsirabe 2023',
      description: 'Compte administratif complet de la commune d\'Antsirabe pour l\'exercice fiscal 2023. Ce document contient l\'ensemble des recettes et dépenses validées par le conseil municipal.',
      type_fichier: 'pdf',
      fichier_url: '/documents/ca-antsirabe-2023.pdf',
      fichier_nom: 'CA_Antsirabe_2023.pdf',
      taille_fichier: 2457600,
      nombre_telechargements: 42,
      est_public: true,
      tags: ['compte-administratif', '2023', 'antsirabe'],
      compte_administratif_id: 'compte-1',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-02-20T14:45:00Z',
    }
    editForm.value = {
      titre: document.value.titre,
      description: document.value.description || '',
      est_public: document.value.est_public,
      tags: [...(document.value.tags || [])],
      compte_administratif_id: document.value.compte_administratif_id || '',
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadDocument()
})
</script>
