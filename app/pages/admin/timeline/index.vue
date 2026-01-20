<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface TimelineEvent {
  id: string
  year: string
  title: string
  description: string
  image: string | null
  sortOrder: number
  isActive: boolean
}

const { data: events, refresh } = await useFetch<TimelineEvent[]>('/api/admin/timeline')

const editingEvent = ref<TimelineEvent | null>(null)
const isCreating = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  year: '',
  title: '',
  description: '',
  image: '',
  sortOrder: 0,
  isActive: true
})

function startCreate() {
  editingEvent.value = null
  isCreating.value = true
  form.value = {
    year: '',
    title: '',
    description: '',
    image: '',
    sortOrder: (events.value?.length || 0) * 10,
    isActive: true
  }
  error.value = ''
  success.value = ''
}

function startEdit(event: TimelineEvent) {
  isCreating.value = false
  editingEvent.value = event
  form.value = {
    year: event.year,
    title: event.title,
    description: event.description,
    image: event.image || '',
    sortOrder: event.sortOrder,
    isActive: event.isActive
  }
  error.value = ''
  success.value = ''
}

function cancelEdit() {
  editingEvent.value = null
  isCreating.value = false
  error.value = ''
}

async function save() {
  error.value = ''
  success.value = ''

  if (!form.value.year.trim() || !form.value.title.trim() || !form.value.description.trim()) {
    error.value = 'Année, titre et description sont requis'
    return
  }

  isSaving.value = true
  try {
    if (isCreating.value) {
      await $fetch('/api/admin/timeline', {
        method: 'POST',
        body: form.value
      })
      success.value = 'Événement créé avec succès'
    } else if (editingEvent.value) {
      await $fetch(`/api/admin/timeline/${editingEvent.value.id}`, {
        method: 'PUT',
        body: form.value
      })
      success.value = 'Événement mis à jour avec succès'
    }

    await refresh()
    cancelEdit()
  } catch (err: any) {
    error.value = err.data?.message || 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

async function deleteEvent(event: TimelineEvent) {
  if (!confirm(`Supprimer l'événement "${event.year} - ${event.title}" ?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/timeline/${event.id}`, {
      method: 'DELETE'
    })
    await refresh()
    success.value = 'Événement supprimé'
  } catch (err: any) {
    error.value = err.data?.message || 'Erreur lors de la suppression'
  }
}

async function toggleActive(event: TimelineEvent) {
  try {
    await $fetch(`/api/admin/timeline/${event.id}`, {
      method: 'PUT',
      body: { isActive: !event.isActive }
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
          Historique / Timeline
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Gérez les événements de la timeline sur la page À propos
        </p>
      </div>
      <button
        v-if="!isCreating && !editingEvent"
        @click="startCreate"
        class="btn-ti text-sm cursor-pointer"
      >
        <font-awesome-icon icon="plus" class="mr-2" />
        Nouvel événement
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
    <div v-if="isCreating || editingEvent" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {{ isCreating ? 'Nouvel événement' : 'Modifier l\'événement' }}
      </h2>

      <form @submit.prevent="save" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Année -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Année *
            </label>
            <input
              v-model="form.year"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: 2000, 2015..."
            />
          </div>

          <!-- Titre -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre *
            </label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Titre de l'événement"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Description de l'événement..."
          />
        </div>

        <!-- Image -->
        <div>
          <ImageUpload
            v-model="form.image"
            label="Image de l'événement (optionnel)"
            placeholder="Sélectionnez ou déposez une image"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <p class="text-xs text-gray-500 mt-1">Les événements sont triés par ordre croissant</p>
          </div>

          <!-- Actif -->
          <div class="flex items-center pt-6">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-ti-blue focus:ring-ti-blue"
              />
              <span class="ml-2 text-gray-700 dark:text-gray-300">Événement actif</span>
            </label>
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

    <!-- Liste des événements -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Année
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
            <tr v-for="event in events" :key="event.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 text-sm font-bold bg-ti-blue text-white rounded-full">
                  {{ event.year }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-gray-900 dark:text-white font-medium">{{ event.title }}</span>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                  {{ event.description }}
                </p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                {{ event.sortOrder }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="toggleActive(event)"
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded cursor-pointer',
                    event.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  ]"
                >
                  {{ event.isActive ? 'Actif' : 'Inactif' }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button
                  @click="startEdit(event)"
                  class="text-ti-blue hover:text-ti-blue-700 mr-3 cursor-pointer"
                  title="Modifier"
                >
                  <font-awesome-icon icon="edit" />
                </button>
                <button
                  @click="deleteEvent(event)"
                  class="text-red-500 hover:text-red-700 cursor-pointer"
                  title="Supprimer"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </td>
            </tr>
            <tr v-if="!events?.length">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                Aucun événement défini. Cliquez sur "Nouvel événement" pour commencer.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
