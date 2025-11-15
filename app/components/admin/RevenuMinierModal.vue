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
              {{ isEditing ? 'Modifier le revenu minier' : 'Nouveau revenu minier' }}
            </h3>
          </div>

          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Projet minier <span class="text-red-500">*</span>
              </label>
              <select v-model="form.projet_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Sélectionner un projet</option>
                <option v-for="projet in projets" :key="projet.id" :value="projet.id">
                  {{ projet.nom }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Année <span class="text-red-500">*</span>
                </label>
                <input v-model.number="form.annee" type="number" required min="2000" max="2100" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trimestre
                </label>
                <select v-model.number="form.trimestre" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option :value="null">Annuel</option>
                  <option :value="1">T1</option>
                  <option :value="2">T2</option>
                  <option :value="3">T3</option>
                  <option :value="4">T4</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de revenu <span class="text-red-500">*</span>
              </label>
              <select v-model="form.type_revenu" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="ristourne">Ristourne</option>
                <option value="redevance">Redevance</option>
                <option value="taxe">Taxe</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Montant (MGA) <span class="text-red-500">*</span>
              </label>
              <input v-model.number="form.montant" type="number" required step="0.01" min="0" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bénéficiaire <span class="text-red-500">*</span>
              </label>
              <select v-model="form.beneficiaire_type" @change="onBeneficiaireTypeChange" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2">
                <option value="">Type de bénéficiaire</option>
                <option value="region">Région</option>
                <option value="district">District</option>
                <option value="commune">Commune</option>
              </select>

              <select v-if="form.beneficiaire_type === 'region'" v-model="form.beneficiaire_region_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Sélectionner une région</option>
                <option v-for="region in regions" :key="region.id" :value="region.id">
                  {{ region.nom }}
                </option>
              </select>

              <select v-if="form.beneficiaire_type === 'district'" v-model="form.beneficiaire_district_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Sélectionner un district</option>
                <option v-for="district in districts" :key="district.id" :value="district.id">
                  {{ district.nom }}
                </option>
              </select>

              <select v-if="form.beneficiaire_type === 'commune'" v-model="form.beneficiaire_commune_id" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Sélectionner une commune</option>
                <option v-for="commune in communes" :key="commune.id" :value="commune.id">
                  {{ commune.nom }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de versement
              </label>
              <input v-model="form.date_versement" type="date" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remarques
              </label>
              <textarea v-model="form.remarques" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
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
import type { RevenuMinier, RevenuMinierFormData } from '~/types/projets-miniers'
import { useProjetsMiniers } from '~/composables/useProjetsMiniers'
import { useRegions } from '~/composables/useRegions'
import { useDistricts } from '~/composables/useDistricts'
import { useCommunes } from '~/composables/useCommunes'

const props = defineProps<{
  isOpen: boolean
  revenu?: RevenuMinier | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const supabase = useSupabaseClient()
const { projets, fetchProjets } = useProjetsMiniers()
const { regions, fetchRegions } = useRegions()
const { districts, fetchDistricts } = useDistricts()
const { communes, fetchCommunes } = useCommunes()
const saving = ref(false)

const isEditing = computed(() => !!props.revenu)

const form = ref<RevenuMinierFormData>({
  projet_id: '',
  annee: new Date().getFullYear(),
  trimestre: null,
  type_revenu: 'ristourne',
  montant: 0,
  beneficiaire_region_id: null,
  beneficiaire_district_id: null,
  beneficiaire_commune_id: null,
  date_versement: null,
  remarques: null,
  beneficiaire_type: ''
})

onMounted(async () => {
  await Promise.all([
    fetchProjets(),
    fetchRegions(),
    fetchDistricts(),
    fetchCommunes()
  ])
})

watch(() => props.revenu, (newRevenu) => {
  if (newRevenu) {
    // Determine beneficiary type
    let benefType = ''
    if (newRevenu.beneficiaire_commune_id) benefType = 'commune'
    else if (newRevenu.beneficiaire_district_id) benefType = 'district'
    else if (newRevenu.beneficiaire_region_id) benefType = 'region'

    form.value = {
      projet_id: newRevenu.projet_id,
      annee: newRevenu.annee,
      trimestre: newRevenu.trimestre,
      type_revenu: newRevenu.type_revenu,
      montant: newRevenu.montant,
      beneficiaire_region_id: newRevenu.beneficiaire_region_id,
      beneficiaire_district_id: newRevenu.beneficiaire_district_id,
      beneficiaire_commune_id: newRevenu.beneficiaire_commune_id,
      date_versement: newRevenu.date_versement,
      remarques: newRevenu.remarques,
      beneficiaire_type: benefType
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function onBeneficiaireTypeChange() {
  form.value.beneficiaire_region_id = null
  form.value.beneficiaire_district_id = null
  form.value.beneficiaire_commune_id = null
}

function resetForm() {
  form.value = {
    projet_id: '',
    annee: new Date().getFullYear(),
    trimestre: null,
    type_revenu: 'ristourne',
    montant: 0,
    beneficiaire_region_id: null,
    beneficiaire_district_id: null,
    beneficiaire_commune_id: null,
    date_versement: null,
    remarques: null,
    beneficiaire_type: ''
  }
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  saving.value = true
  try {
    // Remove beneficiaire_type before saving (not in DB schema)
    const { beneficiaire_type, ...dataToSave } = form.value

    if (isEditing.value && props.revenu) {
      // Update
      const { error } = await supabase
        .from('revenus_miniers')
        .update(dataToSave)
        .eq('id', props.revenu.id)

      if (error) throw error
    } else {
      // Create
      const { error } = await supabase
        .from('revenus_miniers')
        .insert([dataToSave])

      if (error) throw error
    }

    emit('saved')
    close()
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err)
    alert('Erreur lors de l\'enregistrement du revenu minier')
  } finally {
    saving.value = false
  }
}
</script>
