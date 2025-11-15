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
              {{ isEditing ? 'Modifier le compte administratif' : 'Nouveau compte administratif' }}
            </h3>
          </div>

          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Année d'exercice <span class="text-red-500">*</span>
              </label>
              <input v-model.number="form.annee_exercice" type="number" required min="2000" max="2100" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de collectivité <span class="text-red-500">*</span>
              </label>
              <select v-model="form.collectivite_type" @change="onCollectiviteTypeChange" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Sélectionner</option>
                <option value="region">Région</option>
                <option value="district">District</option>
                <option value="commune">Commune</option>
              </select>
            </div>

            <div v-if="form.collectivite_type === 'region'">
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

            <div v-if="form.collectivite_type === 'district'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                District <span class="text-red-500">*</span>
              </label>
              <select v-model="form.district_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Sélectionner un district</option>
                <option v-for="district in districts" :key="district.id" :value="district.id">
                  {{ district.nom }}
                </option>
              </select>
            </div>

            <div v-if="form.collectivite_type === 'commune'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commune <span class="text-red-500">*</span>
              </label>
              <select v-model="form.commune_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Sélectionner une commune</option>
                <option v-for="commune in communes" :key="commune.id" :value="commune.id">
                  {{ commune.nom }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut <span class="text-red-500">*</span>
              </label>
              <select v-model="form.statut" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="brouillon">Brouillon</option>
                <option value="valide">Validé</option>
                <option value="publie">Publié</option>
                <option value="archive">Archivé</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total recettes (MGA)
                </label>
                <input v-model.number="form.total_recettes" type="number" step="0.01" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total dépenses (MGA)
                </label>
                <input v-model.number="form.total_depenses" type="number" step="0.01" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observations
              </label>
              <textarea v-model="form.observations" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
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
import type { CompteAdministratif, CompteAdministratifFormData } from '~/types/comptes-administratifs'
import { useRegions } from '~/composables/useRegions'
import { useDistricts } from '~/composables/useDistricts'
import { useCommunes } from '~/composables/useCommunes'

const props = defineProps<{
  isOpen: boolean
  compte?: CompteAdministratif | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const supabase = useSupabaseClient()
const { regions, fetchRegions } = useRegions()
const { districts, fetchDistricts } = useDistricts()
const { communes, fetchCommunes } = useCommunes()
const saving = ref(false)

const isEditing = computed(() => !!props.compte)

const form = ref<CompteAdministratifFormData>({
  annee_exercice: new Date().getFullYear(),
  collectivite_type: '',
  region_id: null,
  district_id: null,
  commune_id: null,
  statut: 'brouillon',
  total_recettes: null,
  total_depenses: null,
  observations: null
})

onMounted(async () => {
  await Promise.all([fetchRegions(), fetchDistricts(), fetchCommunes()])
})

watch(() => props.compte, (newCompte) => {
  if (newCompte) {
    // Determine collectivite_type
    let type = ''
    if (newCompte.commune_id) type = 'commune'
    else if (newCompte.district_id) type = 'district'
    else if (newCompte.region_id) type = 'region'

    form.value = {
      annee_exercice: newCompte.annee_exercice,
      collectivite_type: type,
      region_id: newCompte.region_id,
      district_id: newCompte.district_id,
      commune_id: newCompte.commune_id,
      statut: newCompte.statut,
      total_recettes: newCompte.total_recettes,
      total_depenses: newCompte.total_depenses,
      observations: newCompte.observations
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function onCollectiviteTypeChange() {
  form.value.region_id = null
  form.value.district_id = null
  form.value.commune_id = null
}

function resetForm() {
  form.value = {
    annee_exercice: new Date().getFullYear(),
    collectivite_type: '',
    region_id: null,
    district_id: null,
    commune_id: null,
    statut: 'brouillon',
    total_recettes: null,
    total_depenses: null,
    observations: null
  }
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  saving.value = true
  try {
    // Remove collectivite_type before saving (not in DB schema)
    const { collectivite_type, ...dataToSave } = form.value

    if (isEditing.value && props.compte) {
      // Update
      const { error } = await supabase
        .from('comptes_administratifs')
        .update(dataToSave)
        .eq('id', props.compte.id)

      if (error) throw error
    } else {
      // Create
      const { error } = await supabase
        .from('comptes_administratifs')
        .insert([dataToSave])

      if (error) throw error
    }

    emit('saved')
    close()
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err)
    alert('Erreur lors de l\'enregistrement du compte administratif')
  } finally {
    saving.value = false
  }
}
</script>
