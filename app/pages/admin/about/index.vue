<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface AboutContent {
  id: string
  section: string
  title: string
  content: string
  image: string | null
  sortOrder: number
  isActive: boolean
}

const { data: contents, refresh } = await useFetch<AboutContent[]>('/api/admin/about')

const editingContent = ref<AboutContent | null>(null)
const isCreating = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  section: '',
  title: '',
  content: '',
  image: '',
  sortOrder: 0,
  isActive: true
})

// Sections prédéfinies
const predefinedSections = [
  { value: 'mission', label: 'Mission' },
  { value: 'vision', label: 'Vision' },
  { value: 'history', label: 'Historique' },
  { value: 'context', label: 'Contexte' },
  { value: 'timg', label: 'Présentation TIMG' },
  { value: 'pcqvp', label: 'Présentation PCQVP' },
  { value: 'team', label: 'Équipe' },
  { value: 'contact', label: 'Contact' }
]

function getSectionLabel(section: string): string {
  const found = predefinedSections.find(s => s.value === section)
  return found?.label || section
}

function startCreate() {
  editingContent.value = null
  isCreating.value = true
  form.value = {
    section: '',
    title: '',
    content: '',
    image: '',
    sortOrder: (contents.value?.length || 0) * 10,
    isActive: true
  }
  error.value = ''
  success.value = ''
}

function startEdit(content: AboutContent) {
  isCreating.value = false
  editingContent.value = content
  form.value = {
    section: content.section,
    title: content.title,
    content: content.content,
    image: content.image || '',
    sortOrder: content.sortOrder,
    isActive: content.isActive
  }
  error.value = ''
  success.value = ''
}

function cancelEdit() {
  editingContent.value = null
  isCreating.value = false
  error.value = ''
}

async function save() {
  error.value = ''
  success.value = ''

  if (!form.value.section.trim() || !form.value.title.trim() || !form.value.content.trim()) {
    error.value = 'Section, titre et contenu sont requis'
    return
  }

  isSaving.value = true
  try {
    if (isCreating.value) {
      await $fetch('/api/admin/about', {
        method: 'POST',
        body: form.value
      })
      success.value = 'Section créée avec succès'
    } else if (editingContent.value) {
      await $fetch(`/api/admin/about/${editingContent.value.id}`, {
        method: 'PUT',
        body: form.value
      })
      success.value = 'Section mise à jour avec succès'
    }

    await refresh()
    cancelEdit()
  } catch (err: any) {
    error.value = err.data?.message || 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

async function deleteContent(content: AboutContent) {
  if (!confirm(`Supprimer la section "${getSectionLabel(content.section)}" ?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/about/${content.id}`, {
      method: 'DELETE'
    })
    await refresh()
    success.value = 'Section supprimée'
  } catch (err: any) {
    error.value = err.data?.message || 'Erreur lors de la suppression'
  }
}

async function toggleActive(content: AboutContent) {
  try {
    await $fetch(`/api/admin/about/${content.id}`, {
      method: 'PUT',
      body: { isActive: !content.isActive }
    })
    await refresh()
  } catch (err: any) {
    error.value = err.data?.message || 'Erreur lors de la mise à jour'
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Page À propos
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Gérez le contenu de la page À propos
        </p>
      </div>
      <button
        v-if="!isCreating && !editingContent"
        @click="startCreate"
        class="btn-ti text-sm"
      >
        <font-awesome-icon icon="plus" class="mr-2" />
        Nouvelle section
      </button>
    </div>

    <!-- Messages -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    </div>
    <div v-if="success" class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <p class="text-green-600 dark:text-green-400">{{ success }}</p>
    </div>

    <!-- Formulaire de création/édition -->
    <div v-if="isCreating || editingContent" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {{ isCreating ? 'Nouvelle section' : 'Modifier la section' }}
      </h2>

      <form @submit.prevent="save" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Section -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Section *
            </label>
            <select
              v-model="form.section"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              :disabled="!isCreating"
            >
              <option value="">Sélectionner...</option>
              <option v-for="s in predefinedSections" :key="s.value" :value="s.value">
                {{ s.label }}
              </option>
            </select>
          </div>

          <!-- Titre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre *
            </label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Titre de la section"
            />
          </div>
        </div>

        <!-- Contenu -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contenu *
          </label>
          <textarea
            v-model="form.content"
            rows="8"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Contenu HTML de la section..."
          />
          <p class="text-xs text-gray-500 mt-1">Vous pouvez utiliser du HTML pour le formatage.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Image -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image (URL)
            </label>
            <input
              v-model="form.image"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="/images/..."
            />
          </div>

          <!-- Ordre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ordre d'affichage
            </label>
            <input
              v-model.number="form.sortOrder"
              type="number"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <!-- Actif -->
          <div class="flex items-center pt-6">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-ti-blue focus:ring-ti-blue"
              />
              <span class="ml-2 text-gray-700 dark:text-gray-300">Section active</span>
            </label>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            :disabled="isSaving"
            class="btn-ti"
          >
            <font-awesome-icon v-if="isSaving" icon="spinner" class="animate-spin mr-2" />
            {{ isCreating ? 'Créer' : 'Enregistrer' }}
          </button>
          <button
            type="button"
            @click="cancelEdit"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>

    <!-- Liste des sections -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Section
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Titre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ordre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="content in contents" :key="content.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium bg-ti-blue-100 text-ti-blue-700 dark:bg-ti-blue-900 dark:text-ti-blue-300 rounded">
                  {{ getSectionLabel(content.section) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-gray-900 dark:text-white font-medium">{{ content.title }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                {{ content.sortOrder }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="toggleActive(content)"
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded cursor-pointer',
                    content.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  ]"
                >
                  {{ content.isActive ? 'Actif' : 'Inactif' }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button
                  @click="startEdit(content)"
                  class="text-ti-blue hover:text-ti-blue-700 mr-3 cursor-pointer"
                  title="Modifier"
                >
                  <font-awesome-icon icon="edit" />
                </button>
                <button
                  @click="deleteContent(content)"
                  class="text-red-500 hover:text-red-700 cursor-pointer"
                  title="Supprimer"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </td>
            </tr>
            <tr v-if="!contents?.length">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                Aucune section définie. Cliquez sur "Nouvelle section" pour commencer.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
