<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div @click="close" class="fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-gray-900/75 z-0"></div>

      <!-- Modal -->
      <div class="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ isEditing ? 'Modifier la commune' : 'Nouvelle commune' }}
            </h3>
          </div>

          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Région <span class="text-red-500">*</span>
                </label>
                <select v-model="selectedRegionId" @change="onRegionChange" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Sélectionner une région</option>
                  <option v-for="region in regions" :key="region.id" :value="region.id">
                    {{ region.nom }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  District <span class="text-red-500">*</span>
                </label>
                <select v-model="form.district_id" required :disabled="!selectedRegionId" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">
                  <option value="">Sélectionner un district</option>
                  <option v-for="district in filteredDistricts" :key="district.id" :value="district.id">
                    {{ district.nom }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code commune <span class="text-red-500">*</span>
                </label>
                <input v-model="form.code" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span class="text-red-500">*</span>
                </label>
                <select v-model="form.type" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="urbaine">Urbaine</option>
                  <option value="rurale">Rurale</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de la commune <span class="text-red-500">*</span>
              </label>
              <input v-model="form.nom" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div class="grid grid-cols-3 gap-4">
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

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de fokontany
                </label>
                <input v-model.number="form.nb_fokontany" type="number" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du maire
              </label>
              <input v-model="form.maire_nom" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email du maire
                </label>
                <input v-model="form.maire_email" type="email" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone du maire
                </label>
                <input v-model="form.maire_telephone" type="tel" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse
              </label>
              <textarea v-model="form.adresse" rows="2" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
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
import type { Commune, CommuneFormData } from '~/types/collectivites'
import { useRegions } from '~/composables/useRegions'
import { useDistricts } from '~/composables/useDistricts'

const props = defineProps<{
  isOpen: boolean
  commune?: Commune | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const supabase = useSupabaseClient()
const { regions, fetchRegions } = useRegions()
const { districts, fetchDistricts } = useDistricts()
const saving = ref(false)
const selectedRegionId = ref('')

const isEditing = computed(() => !!props.commune)

const form = ref<CommuneFormData>({
  district_id: '',
  code: '',
  nom: '',
  type: 'rurale',
  population: null,
  superficie: null,
  nb_fokontany: null,
  maire_nom: null,
  maire_email: null,
  maire_telephone: null,
  adresse: null
})

const filteredDistricts = computed(() => {
  if (!selectedRegionId.value) return []
  return districts.value.filter(d => d.region_id === selectedRegionId.value)
})

onMounted(async () => {
  await Promise.all([fetchRegions(), fetchDistricts()])
})

watch(() => props.commune, async (newCommune) => {
  if (newCommune) {
    form.value = {
      district_id: newCommune.district_id,
      code: newCommune.code,
      nom: newCommune.nom,
      type: newCommune.type,
      population: newCommune.population,
      superficie: newCommune.superficie,
      nb_fokontany: newCommune.nb_fokontany,
      maire_nom: newCommune.maire_nom,
      maire_email: newCommune.maire_email,
      maire_telephone: newCommune.maire_telephone,
      adresse: newCommune.adresse
    }

    // Find the region for this district
    const district = districts.value.find(d => d.id === newCommune.district_id)
    if (district) {
      selectedRegionId.value = district.region_id
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function onRegionChange() {
  form.value.district_id = ''
}

function resetForm() {
  form.value = {
    district_id: '',
    code: '',
    nom: '',
    type: 'rurale',
    population: null,
    superficie: null,
    nb_fokontany: null,
    maire_nom: null,
    maire_email: null,
    maire_telephone: null,
    adresse: null
  }
  selectedRegionId.value = ''
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  saving.value = true
  try {
    if (isEditing.value && props.commune) {
      // Update
      const { error } = await supabase
        .from('communes')
        .update(form.value)
        .eq('id', props.commune.id)

      if (error) throw error
    } else {
      // Create
      const { error } = await supabase
        .from('communes')
        .insert([form.value])

      if (error) throw error
    }

    emit('saved')
    close()
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err)
    alert('Erreur lors de l\'enregistrement de la commune')
  } finally {
    saving.value = false
  }
}
</script>
