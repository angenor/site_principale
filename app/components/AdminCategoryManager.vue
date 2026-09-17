<script setup lang="ts">
// Gestion d'une liste de catégories (création, modification, suppression)
const props = withDefaults(defineProps<{
  /** API d'administration (ex. '/api/admin/news-categories') */
  endpoint: string
  /** Identifiant du brouillon local */
  draftKey: string
  title: string
  subtitle: string
  /** Champ de l'API contenant le nombre de contenus rattachés */
  countKey: string
  /** Libellés de la colonne et des messages (ex. « Actualités », « actualité(s) ») */
  countColumnLabel: string
  countUnitLabel: string
  namePlaceholder?: string
}>(), {
  namePlaceholder: undefined
})

interface ManagedCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

const { data: categories, refresh } = await useFetch<ManagedCategory[]>(props.endpoint)

function usageCount(category: ManagedCategory): number {
  return Number(category[props.countKey]) || 0
}

const editingCategory = ref<ManagedCategory | null>(null)
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

// Sauvegarde locale de la saisie en cours
const draft = useFormDraft({
  key: props.draftKey,
  source: () => ({ ...form.value }),
  apply: (data) => {
    form.value = { ...form.value, ...data }
  }
})
const draftRestoredAt = draft.restoredAt

// Rouvre le formulaire laissé en cours avant le rechargement de la page
draft.resume((ctx) => {
  if (ctx === 'new') {
    startCreate()
    return
  }
  const list = categories.value || []
  const item = list.find(i => i.id === ctx)
  if (item) {
    startEdit(item)
    return
  }
  // Élément supprimé entre-temps : le brouillon est abandonné
  if (list.length) return false
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
  draft.start('new')
}

function startEdit(category: ManagedCategory) {
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
  draft.start(category.id)
}

function cancelEdit() {
  draft.clear()
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
      await $fetch(props.endpoint, {
        method: 'POST',
        body: payload
      })
      success.value = 'Catégorie créée avec succès'
    } else if (editingCategory.value) {
      await $fetch(`${props.endpoint}/${editingCategory.value.id}`, {
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

async function deleteCategory(category: ManagedCategory) {
  const count = usageCount(category)
  if (count > 0) {
    error.value = `Impossible de supprimer : cette catégorie est utilisée par ${count} ${props.countUnitLabel}`
    return
  }

  if (!confirm(`Supprimer la catégorie "${category.name}" ?`)) {
    return
  }

  try {
    await $fetch(`${props.endpoint}/${category.id}`, {
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
          {{ title }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ subtitle }}
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
        <FormDraftNotice
          v-if="draftRestoredAt"
          :saved-at="draftRestoredAt"
          @discard="draft.discard()"
        />
        <CategoryFields
          v-model:name="form.name"
          v-model:description="form.description"
          v-model:color="form.color"
          v-model:icon="form.icon"
          :name-placeholder="namePlaceholder"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Nom
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Slug
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ countColumnLabel }}
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
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium text-white"
                  :style="{ backgroundColor: category.color || '#6B7280' }"
                >
                  <CategoryIcon :icon="category.icon" class="text-xs" />
                  {{ category.name }}
                </span>
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
                    usageCount(category) > 0
                      ? 'bg-ti-blue/10 text-ti-blue'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  ]"
                >
                  {{ usageCount(category) }}
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
                    usageCount(category) > 0
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-red-500 hover:text-red-700'
                  ]"
                  :disabled="usageCount(category) > 0"
                  :title="usageCount(category) > 0 ? 'Impossible de supprimer : catégorie utilisée' : 'Supprimer'"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </td>
            </tr>
            <tr v-if="!categories?.length">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                Aucune catégorie définie. Cliquez sur "Nouvelle catégorie" pour commencer.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
