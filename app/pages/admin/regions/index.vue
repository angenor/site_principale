<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

interface Region {
  id: string
  name: string
  code: string | null
  description: string | null
  createdAt: string
  caseStudiesCount: number
}

const { data: regions, refresh } = await useFetch<Region[]>('/api/admin/regions')

const editingRegion = ref<Region | null>(null)
const isCreating = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  name: '',
  code: '',
  description: ''
})

function startCreate() {
  editingRegion.value = null
  isCreating.value = true
  form.value = {
    name: '',
    code: '',
    description: ''
  }
  error.value = ''
  success.value = ''
}

function startEdit(region: Region) {
  isCreating.value = false
  editingRegion.value = region
  form.value = {
    name: region.name,
    code: region.code || '',
    description: region.description || ''
  }
  error.value = ''
  success.value = ''
}

function cancelEdit() {
  editingRegion.value = null
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
      code: form.value.code.trim() || null,
      description: form.value.description.trim() || null
    }

    if (isCreating.value) {
      await $fetch('/api/admin/regions', {
        method: 'POST',
        body: payload
      })
      success.value = 'Région créée avec succès'
    } else if (editingRegion.value) {
      await $fetch(`/api/admin/regions/${editingRegion.value.id}`, {
        method: 'PUT',
        body: payload
      })
      success.value = 'Région mise à jour avec succès'
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

async function deleteRegion(region: Region) {
  if (region.caseStudiesCount > 0) {
    error.value = `Impossible de supprimer : cette région est utilisée par ${region.caseStudiesCount} étude(s) de cas`
    return
  }

  if (!confirm(`Supprimer la région "${region.name}" ?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/regions/${region.id}`, {
      method: 'DELETE'
    })
    await refresh()
    success.value = 'Région supprimée'
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
          Régions
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Gérez les régions de Madagascar pour les études de cas
        </p>
      </div>
      <button
        v-if="!isCreating && !editingRegion"
        @click="startCreate"
        class="btn-ti text-sm cursor-pointer"
      >
        <font-awesome-icon icon="plus" class="mr-2" />
        Nouvelle région
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
    <div v-if="isCreating || editingRegion" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {{ isCreating ? 'Nouvelle région' : 'Modifier la région' }}
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
              placeholder="Ex: Analamanga"
            />
          </div>

          <!-- Code -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code
            </label>
            <input
              v-model="form.code"
              type="text"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: ANA"
            />
            <p class="text-xs text-gray-500 mt-1">Code court pour identifier la région (optionnel)</p>
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
            placeholder="Description de la région..."
          />
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

    <!-- Liste des régions -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nom
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Code
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Études de cas
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="region in regions" :key="region.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <font-awesome-icon icon="map-marker-alt" class="text-ti-blue" />
                  <span class="text-gray-900 dark:text-white font-medium">{{ region.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <code v-if="region.code" class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {{ region.code }}
                </code>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4">
                <p v-if="region.description" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {{ region.description }}
                </p>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded',
                    region.caseStudiesCount > 0
                      ? 'bg-ti-blue/10 text-ti-blue'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  ]"
                >
                  {{ region.caseStudiesCount }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button
                  @click="startEdit(region)"
                  class="text-ti-blue hover:text-ti-blue-700 mr-3 cursor-pointer"
                  title="Modifier"
                >
                  <font-awesome-icon icon="edit" />
                </button>
                <button
                  @click="deleteRegion(region)"
                  :class="[
                    'cursor-pointer',
                    region.caseStudiesCount > 0
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-red-500 hover:text-red-700'
                  ]"
                  :disabled="region.caseStudiesCount > 0"
                  :title="region.caseStudiesCount > 0 ? 'Impossible de supprimer : région utilisée' : 'Supprimer'"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </td>
            </tr>
            <tr v-if="!regions?.length">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                Aucune région définie. Cliquez sur "Nouvelle région" pour commencer.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Info sur les régions de Madagascar -->
    <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h3 class="font-medium text-blue-800 dark:text-blue-300 mb-2">
        <font-awesome-icon icon="info-circle" class="mr-2" />
        Régions de Madagascar
      </h3>
      <p class="text-sm text-blue-700 dark:text-blue-400">
        Madagascar compte 23 régions. Vous pouvez ajouter uniquement les régions pertinentes pour vos études de cas.
      </p>
    </div>
  </div>
</template>
