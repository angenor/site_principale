<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface OrphanImage {
  filename: string
  url: string
  size: number
  createdAt: string
}

interface OrphanData {
  total: number
  used: number
  orphans: OrphanImage[]
  totalSize: number
  orphanSize: number
}

const isLoading = ref(true)
const isDeleting = ref(false)
const error = ref('')
const success = ref('')
const orphanData = ref<OrphanData | null>(null)
const selectedImages = ref<Set<string>>(new Set())

// Charger les données
async function loadOrphans() {
  isLoading.value = true
  error.value = ''

  try {
    const response = await $fetch<{ success: boolean; data: OrphanData }>('/api/admin/media/orphans')
    if (response.success) {
      orphanData.value = response.data
    }
  } catch (e) {
    error.value = 'Erreur lors du chargement des images'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

// Sélectionner/désélectionner une image
function toggleSelection(filename: string) {
  if (selectedImages.value.has(filename)) {
    selectedImages.value.delete(filename)
  } else {
    selectedImages.value.add(filename)
  }
  // Force reactivity
  selectedImages.value = new Set(selectedImages.value)
}

// Sélectionner tout
function selectAll() {
  if (!orphanData.value) return
  selectedImages.value = new Set(orphanData.value.orphans.map(o => o.filename))
}

// Désélectionner tout
function deselectAll() {
  selectedImages.value = new Set()
}

// Supprimer les images sélectionnées
async function deleteSelected() {
  if (selectedImages.value.size === 0) return

  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedImages.value.size} image(s) ? Cette action est irréversible.`)) {
    return
  }

  isDeleting.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $fetch<{
      success: boolean
      data: { deleted: string[]; failed: { filename: string; error: string }[] }
    }>('/api/admin/media/orphans', {
      method: 'DELETE',
      body: {
        filenames: Array.from(selectedImages.value)
      }
    })

    if (response.success) {
      const { deleted, failed } = response.data

      if (deleted.length > 0) {
        success.value = `${deleted.length} image(s) supprimée(s) avec succès`
      }

      if (failed.length > 0) {
        error.value = `${failed.length} image(s) n'ont pas pu être supprimées`
      }

      // Recharger les données
      selectedImages.value = new Set()
      await loadOrphans()
    }
  } catch (e) {
    error.value = 'Erreur lors de la suppression'
    console.error(e)
  } finally {
    isDeleting.value = false
  }
}

// Formater la taille
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// Formater la date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Charger au montage
onMounted(() => {
  loadOrphans()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Gestion des médias
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Nettoyage des images orphelines non utilisées
        </p>
      </div>
      <button
        type="button"
        @click="loadOrphans"
        :disabled="isLoading"
        class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
      >
        <font-awesome-icon :icon="isLoading ? 'spinner' : 'sync'" :class="{ 'animate-spin': isLoading }" />
        Actualiser
      </button>
    </div>

    <!-- Messages -->
    <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="circle-exclamation" />
      {{ error }}
    </div>
    <div v-if="success" class="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="check-circle" />
      {{ success }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon icon="spinner" class="animate-spin text-green-600 text-3xl" />
    </div>

    <!-- Content -->
    <div v-else-if="orphanData">
      <!-- Statistiques -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <font-awesome-icon icon="image" class="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ orphanData.total }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Images totales</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <font-awesome-icon icon="check" class="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ orphanData.used }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Images utilisées</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <font-awesome-icon icon="triangle-exclamation" class="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ orphanData.orphans.length }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Images orphelines</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <font-awesome-icon icon="database" class="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatSize(orphanData.orphanSize) }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Espace récupérable</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des images orphelines -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Images orphelines
          </h3>

          <div v-if="orphanData.orphans.length > 0" class="flex items-center gap-2">
            <button
              type="button"
              @click="selectAll"
              class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Tout sélectionner
            </button>
            <button
              type="button"
              @click="deselectAll"
              class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Tout désélectionner
            </button>
            <button
              type="button"
              @click="deleteSelected"
              :disabled="selectedImages.size === 0 || isDeleting"
              class="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <font-awesome-icon :icon="isDeleting ? 'spinner' : 'trash'" :class="{ 'animate-spin': isDeleting }" />
              Supprimer ({{ selectedImages.size }})
            </button>
          </div>
        </div>

        <div v-if="orphanData.orphans.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
          <font-awesome-icon icon="check-circle" class="text-4xl text-green-500 mb-3" />
          <p class="text-lg font-medium">Aucune image orpheline</p>
          <p class="text-sm">Toutes les images sont utilisées dans vos actualités.</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
          <div
            v-for="image in orphanData.orphans"
            :key="image.filename"
            class="relative group cursor-pointer"
            @click="toggleSelection(image.filename)"
          >
            <!-- Checkbox -->
            <div
              :class="[
                'absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                selectedImages.has(image.filename)
                  ? 'bg-red-600 border-red-600'
                  : 'bg-white/80 border-gray-300 group-hover:border-red-400'
              ]"
            >
              <font-awesome-icon
                v-if="selectedImages.has(image.filename)"
                icon="check"
                class="text-white text-xs"
              />
            </div>

            <!-- Image -->
            <div
              :class="[
                'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                selectedImages.has(image.filename)
                  ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800'
                  : 'border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600'
              ]"
            >
              <img
                :src="image.url"
                :alt="image.filename"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <!-- Info -->
            <div class="mt-2">
              <p class="text-xs text-gray-600 dark:text-gray-400 truncate" :title="image.filename">
                {{ image.filename }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500">
                {{ formatSize(image.size) }} • {{ formatDate(image.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Information -->
      <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex gap-3">
          <font-awesome-icon icon="info-circle" class="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div class="text-sm text-blue-800 dark:text-blue-200">
            <p class="font-medium mb-1">À propos des images orphelines</p>
            <p class="text-blue-700 dark:text-blue-300">
              Les images orphelines sont des fichiers uploadés mais qui ne sont plus référencés dans aucune actualité.
              Cela peut arriver quand vous supprimez une image du contenu ou quand vous n'enregistrez pas les modifications.
              Supprimer ces images libère de l'espace disque mais cette action est irréversible.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
