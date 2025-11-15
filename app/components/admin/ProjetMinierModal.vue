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
              {{ isEditing ? 'Modifier le projet minier' : 'Nouveau projet minier' }}
            </h3>
          </div>

          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du projet <span class="text-red-500">*</span>
              </label>
              <input v-model="form.nom" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de minerai <span class="text-red-500">*</span>
                </label>
                <input v-model="form.type_minerai" type="text" required placeholder="Or, Nickel, Cobalt..." class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut <span class="text-red-500">*</span>
                </label>
                <select v-model="form.statut" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="planifie">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="suspendu">Suspendu</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Société exploitante
              </label>
              <input v-model="form.societe_exploitante" type="text" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <!-- Localisation -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Localisation</h4>

              <div class="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Région
                  </label>
                  <select v-model="selectedRegionId" @change="onRegionChange" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Sélectionner</option>
                    <option v-for="region in regions" :key="region.id" :value="region.id">
                      {{ region.nom }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    District
                  </label>
                  <select v-model="selectedDistrictId" @change="onDistrictChange" :disabled="!selectedRegionId" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">
                    <option value="">Sélectionner</option>
                    <option v-for="district in filteredDistricts" :key="district.id" :value="district.id">
                      {{ district.nom }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commune
                  </label>
                  <select v-model="form.commune_id" :disabled="!selectedDistrictId" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">
                    <option value="">Sélectionner</option>
                    <option v-for="commune in filteredCommunes" :key="commune.id" :value="commune.id">
                      {{ commune.nom }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de début
                </label>
                <input v-model="form.date_debut" type="date" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de fin prévue
                </label>
                <input v-model="form.date_fin_prevue" type="date" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investissement (MGA)
                </label>
                <input v-model.number="form.investissement_montant" type="number" step="0.01" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emplois créés
                </label>
                <input v-model.number="form.emplois_crees" type="number" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea v-model="form.description" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
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
import type { ProjetMinier, ProjetMinierFormData } from '~/types/projets-miniers'
import { useRegions } from '~/composables/useRegions'
import { useDistricts } from '~/composables/useDistricts'
import { useCommunes } from '~/composables/useCommunes'

const props = defineProps<{
  isOpen: boolean
  projet?: ProjetMinier | null
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

const selectedRegionId = ref('')
const selectedDistrictId = ref('')

const isEditing = computed(() => !!props.projet)

const form = ref<ProjetMinierFormData>({
  nom: '',
  type_minerai: '',
  statut: 'planifie',
  societe_exploitante: null,
  region_id: null,
  district_id: null,
  commune_id: null,
  date_debut: null,
  date_fin_prevue: null,
  investissement_montant: null,
  emplois_crees: null,
  description: null
})

const filteredDistricts = computed(() => {
  if (!selectedRegionId.value) return []
  return districts.value.filter(d => d.region_id === selectedRegionId.value)
})

const filteredCommunes = computed(() => {
  if (!selectedDistrictId.value) return []
  return communes.value.filter(c => c.district_id === selectedDistrictId.value)
})

onMounted(async () => {
  await Promise.all([fetchRegions(), fetchDistricts(), fetchCommunes()])
})

watch(() => props.projet, async (newProjet) => {
  if (newProjet) {
    form.value = {
      nom: newProjet.nom,
      type_minerai: newProjet.type_minerai,
      statut: newProjet.statut,
      societe_exploitante: newProjet.societe_exploitante,
      region_id: newProjet.region_id,
      district_id: newProjet.district_id,
      commune_id: newProjet.commune_id,
      date_debut: newProjet.date_debut,
      date_fin_prevue: newProjet.date_fin_prevue,
      investissement_montant: newProjet.investissement_montant,
      emplois_crees: newProjet.emplois_crees,
      description: newProjet.description
    }

    // Set location selects
    if (newProjet.commune_id) {
      const commune = communes.value.find(c => c.id === newProjet.commune_id)
      if (commune) {
        selectedDistrictId.value = commune.district_id
        const district = districts.value.find(d => d.id === commune.district_id)
        if (district) {
          selectedRegionId.value = district.region_id
        }
      }
    } else if (newProjet.district_id) {
      selectedDistrictId.value = newProjet.district_id
      const district = districts.value.find(d => d.id === newProjet.district_id)
      if (district) {
        selectedRegionId.value = district.region_id
      }
    } else if (newProjet.region_id) {
      selectedRegionId.value = newProjet.region_id
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function onRegionChange() {
  selectedDistrictId.value = ''
  form.value.district_id = null
  form.value.commune_id = null
  form.value.region_id = selectedRegionId.value || null
}

function onDistrictChange() {
  form.value.commune_id = null
  form.value.district_id = selectedDistrictId.value || null
}

watch(() => form.value.commune_id, (communeId) => {
  if (communeId) {
    form.value.region_id = null
    form.value.district_id = null
  }
})

function resetForm() {
  form.value = {
    nom: '',
    type_minerai: '',
    statut: 'planifie',
    societe_exploitante: null,
    region_id: null,
    district_id: null,
    commune_id: null,
    date_debut: null,
    date_fin_prevue: null,
    investissement_montant: null,
    emplois_crees: null,
    description: null
  }
  selectedRegionId.value = ''
  selectedDistrictId.value = ''
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  saving.value = true
  try {
    if (isEditing.value && props.projet) {
      // Update
      const { error } = await supabase
        .from('projets_miniers')
        .update(form.value)
        .eq('id', props.projet.id)

      if (error) throw error
    } else {
      // Create
      const { error } = await supabase
        .from('projets_miniers')
        .insert([form.value])

      if (error) throw error
    }

    emit('saved')
    close()
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err)
    alert('Erreur lors de l\'enregistrement du projet minier')
  } finally {
    saving.value = false
  }
}
</script>
