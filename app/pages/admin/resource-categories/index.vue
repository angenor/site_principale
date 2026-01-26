<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface ResourceCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  resourcesCount: number
}

const { data: categories, refresh } = await useFetch<ResourceCategory[]>('/api/admin/resource-categories')

const editingCategory = ref<ResourceCategory | null>(null)
const isCreating = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

const form = ref<{
  name: string
  slug: string
  description: string
  icon: string | null
  color: string
  sortOrder: number
}>({
  name: '',
  slug: '',
  description: '',
  icon: null,
  color: '#3B82F6',
  sortOrder: 0
})

// Auto-generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const slugPreview = computed(() => {
  if (form.value.slug) return form.value.slug
  return generateSlug(form.value.name)
})

function startCreate() {
  editingCategory.value = null
  isCreating.value = true
  form.value = {
    name: '',
    slug: '',
    description: '',
    icon: null,
    color: '#3B82F6',
    sortOrder: (categories.value?.length || 0) * 10
  }
  error.value = ''
  success.value = ''
}

function startEdit(category: ResourceCategory) {
  isCreating.value = false
  editingCategory.value = category
  form.value = {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    icon: category.icon,
    color: category.color || '#3B82F6',
    sortOrder: category.sortOrder
  }
  error.value = ''
  success.value = ''
}

function cancelEdit() {
  editingCategory.value = null
  isCreating.value = false
  error.value = ''
}

async function save() {
  error.value = ''
  success.value = ''

  if (!form.value.name.trim()) {
    error.value = 'Le nom est requis'
    return
  }

  isSaving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      slug: form.value.slug.trim() || slugPreview.value,
      description: form.value.description.trim() || null,
      icon: form.value.icon || null,
      color: form.value.color || null,
      sortOrder: form.value.sortOrder
    }

    if (isCreating.value) {
      await $fetch('/api/admin/resource-categories', {
        method: 'POST',
        body: payload
      })
      success.value = 'Catégorie créée avec succès'
    } else if (editingCategory.value) {
      await $fetch(`/api/admin/resource-categories/${editingCategory.value.id}`, {
        method: 'PUT',
        body: payload
      })
      success.value = 'Catégorie mise à jour avec succès'
    }

    await refresh()
    cancelEdit()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e.data?.statusMessage || 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

async function deleteCategory(category: ResourceCategory) {
  if (category.resourcesCount > 0) {
    error.value = `Impossible de supprimer : cette catégorie est utilisée par ${category.resourcesCount} ressource(s)`
    return
  }

  if (!confirm(`Supprimer la catégorie "${category.name}" ?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/resource-categories/${category.id}`, {
      method: 'DELETE'
    })
    await refresh()
    success.value = 'Catégorie supprimée'
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e.data?.statusMessage || 'Erreur lors de la suppression'
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Catégories de ressources
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Gérez les catégories pour organiser vos ressources téléchargeables
        </p>
      </div>
      <button
        v-if="!isCreating && !editingCategory"
        @click="startCreate"
        class="btn-ti text-sm cursor-pointer"
      >
        <font-awesome-icon icon="plus" class="mr-2" />
        Nouvelle catégorie
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
    <div v-if="isCreating || editingCategory" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {{ isCreating ? 'Nouvelle catégorie' : 'Modifier la catégorie' }}
      </h2>

      <form @submit.prevent="save" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Nom -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom *
            </label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: Guide pratique"
            />
          </div>

          <!-- Slug -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug
            </label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              :placeholder="slugPreview || 'Auto-généré'"
            />
            <p v-if="!form.slug && form.name" class="text-xs text-gray-500 mt-1">
              Sera généré : {{ slugPreview }}
            </p>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Description de la catégorie..."
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Icône -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icône
            </label>
            <IconPicker v-model="form.icon" placeholder="Rechercher une icône..." />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choisissez une icône FontAwesome ou téléversez une image personnalisée
            </p>
          </div>

          <!-- Couleur -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.color"
                type="color"
                class="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                v-model="form.color"
                type="text"
                class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="#3B82F6"
              />
            </div>
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
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            :disabled="isSaving"
            class="btn-ti cursor-pointer"
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

    <!-- Liste des catégories -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Icône
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nom
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Slug
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ressources
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ordre
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-6 py-4 whitespace-nowrap">
                <!-- Image personnalisée -->
                <div
                  v-if="category.icon && (category.icon.startsWith('/') || category.icon.startsWith('http'))"
                  class="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden"
                  :style="{ backgroundColor: category.color || '#3B82F6' }"
                >
                  <img :src="category.icon" alt="" class="w-6 h-6 object-contain" />
                </div>
                <!-- Icône FontAwesome -->
                <div
                  v-else-if="category.icon"
                  class="w-8 h-8 flex items-center justify-center rounded-lg"
                  :style="{ backgroundColor: category.color || '#3B82F6' }"
                >
                  <font-awesome-icon :icon="category.icon" class="text-white text-sm" />
                </div>
                <!-- Pas d'icône -->
                <div v-else class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600">
                  <font-awesome-icon icon="folder" class="text-gray-400 text-sm" />
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-gray-900 dark:text-white font-medium">{{ category.name }}</span>
                <p v-if="category.description" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {{ category.description }}
                </p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <code class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {{ category.slug }}
                </code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded',
                    category.resourcesCount > 0
                      ? 'bg-ti-blue/10 text-ti-blue'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  ]"
                >
                  {{ category.resourcesCount }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                {{ category.sortOrder }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button
                  @click="startEdit(category)"
                  class="text-ti-blue hover:text-ti-blue-700 mr-3 cursor-pointer"
                  title="Modifier"
                >
                  <font-awesome-icon icon="edit" />
                </button>
                <button
                  @click="deleteCategory(category)"
                  :class="[
                    'cursor-pointer',
                    category.resourcesCount > 0
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-red-500 hover:text-red-700'
                  ]"
                  :disabled="category.resourcesCount > 0"
                  :title="category.resourcesCount > 0 ? 'Impossible de supprimer : catégorie utilisée' : 'Supprimer'"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </td>
            </tr>
            <tr v-if="!categories?.length">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                Aucune catégorie définie. Cliquez sur "Nouvelle catégorie" pour commencer.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
