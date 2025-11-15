<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div @click="close" class="fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-gray-900/75 z-0"></div>

      <!-- Modal -->
      <div class="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ isEditing ? 'Modifier le district' : 'Nouveau district' }}
            </h3>
          </div>

          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Région <span class="text-red-500">*</span>
              </label>
              <select v-model="form.region_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Sélectionner une région</option>
                <option v-for="region in regions" :key="region.id" :value="region.id">
                  {{ region.nom }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code district <span class="text-red-500">*</span>
              </label>
              <input v-model="form.code" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du district <span class="text-red-500">*</span>
              </label>
              <input v-model="form.nom" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chef-lieu
              </label>
              <input v-model="form.chef_lieu" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Population
              </label>
              <input v-model.number="form.population" type="number" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Superficie (km²)
              </label>
              <input v-model.number="form.superficie" type="number" step="0.01" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
            <button type="button" @click="close" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              Annuler
            </button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {{ saving ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { District, DistrictFormData } from '~/types/collectivites'
import { useRegions } from '~/composables/useRegions'

const props = defineProps<{
  isOpen: boolean
  district?: District | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const supabase = useSupabaseClient()
const { regions, fetchRegions } = useRegions()
const saving = ref(false)

const isEditing = computed(() => !!props.district)

const form = ref<DistrictFormData>({
  region_id: '',
  code: '',
  nom: '',
  chef_lieu: null,
  population: null,
  superficie: null
})

onMounted(async () => {
  await fetchRegions()
})

watch(() => props.district, (newDistrict) => {
  if (newDistrict) {
    form.value = {
      region_id: newDistrict.region_id,
      code: newDistrict.code,
      nom: newDistrict.nom,
      chef_lieu: newDistrict.chef_lieu,
      population: newDistrict.population,
      superficie: newDistrict.superficie
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.value = {
    region_id: '',
    code: '',
    nom: '',
    chef_lieu: null,
    population: null,
    superficie: null
  }
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  saving.value = true
  try {
    if (isEditing.value && props.district) {
      // Update
      const { error } = await supabase
        .from('districts')
        .update(form.value)
        .eq('id', props.district.id)

      if (error) throw error
    } else {
      // Create
      const { error } = await supabase
        .from('districts')
        .insert([form.value])

      if (error) throw error
    }

    emit('saved')
    close()
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err)
    alert('Erreur lors de l\'enregistrement du district')
  } finally {
    saving.value = false
  }
}
</script>
