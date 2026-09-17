<script setup lang="ts">
// Création rapide d'une catégorie d'actualité sans quitter le formulaire en cours

interface CreatedNewsCategory {
  id: string
  name: string
  color: string | null
}

const DEFAULT_COLOR = '#3B82F6'

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  (e: 'created', category: CreatedNewsCategory): void
}>()

const form = ref({ name: '', description: '', color: DEFAULT_COLOR, icon: null as string | null })
const isSaving = ref(false)
const error = ref('')

// Formulaire vierge à chaque ouverture, curseur dans le champ Nom
watch(open, async (isOpen) => {
  if (!isOpen) return
  form.value = { name: '', description: '', color: DEFAULT_COLOR, icon: null }
  error.value = ''
  await nextTick()
  document.getElementById('quick-category-name')?.focus()
})

async function create() {
  error.value = ''
  if (!form.value.name.trim()) {
    error.value = 'Le nom est requis'
    return
  }

  isSaving.value = true
  try {
    const result = await $fetch<{ data: CreatedNewsCategory }>('/api/admin/news-categories', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        description: form.value.description.trim() || null,
        color: form.value.color || null,
        icon: form.value.icon || null
      }
    })
    emit('created', result.data)
    open.value = false
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    error.value = e.data?.statusMessage || 'Erreur lors de la création de la catégorie'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <AppModal v-model="open" title="Nouvelle catégorie" size="md">
    <form id="quick-category-form" class="space-y-4" @submit.prevent="create">
      <div
        v-if="error"
        class="px-3 py-2 rounded-lg text-sm bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
      >
        {{ error }}
      </div>
      <NewsCategoryFields
        v-model:name="form.name"
        v-model:description="form.description"
        v-model:color="form.color"
        v-model:icon="form.icon"
        name-input-id="quick-category-name"
        compact-description
      />
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Le slug et l'ordre d'affichage sont définis automatiquement. Vous pourrez les modifier dans
        <NuxtLink to="/admin/news-categories" target="_blank" class="text-green-600 dark:text-green-400 hover:underline">la gestion des catégories</NuxtLink>.
      </p>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
          @click="open = false"
        >
          Annuler
        </button>
        <button
          type="submit"
          form="quick-category-form"
          :disabled="isSaving"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <font-awesome-icon :icon="isSaving ? 'spinner' : 'plus'" :class="{ 'animate-spin': isSaving }" />
          Créer la catégorie
        </button>
      </div>
    </template>
  </AppModal>
</template>
