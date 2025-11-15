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
              {{ isEditing ? 'Modifier la rubrique budgétaire' : 'Nouvelle rubrique budgétaire' }}
            </h3>
          </div>

          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code rubrique <span class="text-red-500">*</span>
              </label>
              <input v-model="form.code_rubrique" type="text" required placeholder="Ex: 70, 701, 7011..." class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Libellé <span class="text-red-500">*</span>
              </label>
              <input v-model="form.libelle" type="text" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section <span class="text-red-500">*</span>
                </label>
                <select v-model="form.section" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="fonctionnement">Fonctionnement</option>
                  <option value="investissement">Investissement</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span class="text-red-500">*</span>
                </label>
                <select v-model="form.type_rubrique" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="recette">Recette</option>
                  <option value="depense">Dépense</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chapitre
                </label>
                <input v-model="form.chapitre" type="text" placeholder="Ex: 70, 011..." class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveau <span class="text-red-500">*</span>
                </label>
                <input v-model.number="form.niveau" type="number" required min="1" max="5" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">1=Chapitre, 2=Article, 3=Compte...</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rubrique parente
              </label>
              <select v-model="form.parent_id" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option :value="null">Aucune (Rubrique de niveau 1)</option>
                <option v-for="rubrique in parentRubriques" :key="rubrique.id" :value="rubrique.id">
                  {{ rubrique.code_rubrique }} - {{ rubrique.libelle }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea v-model="form.description" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
            </div>

            <div class="flex items-center">
              <input v-model="form.est_actif" type="checkbox" id="est_actif" class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500">
              <label for="est_actif" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Rubrique active
              </label>
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
import type { RubriqueBudgetaire, RubriqueBudgetaireFormData } from '~/types/comptes-administratifs'

const props = defineProps<{
  isOpen: boolean
  rubrique?: RubriqueBudgetaire | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const supabase = useSupabaseClient()
const saving = ref(false)
const parentRubriques = ref<RubriqueBudgetaire[]>([])

const isEditing = computed(() => !!props.rubrique)

const form = ref<RubriqueBudgetaireFormData>({
  code_rubrique: '',
  libelle: '',
  section: 'fonctionnement',
  type_rubrique: 'recette',
  chapitre: null,
  niveau: 1,
  parent_id: null,
  description: null,
  est_actif: true
})

onMounted(async () => {
  await loadParentRubriques()
})

watch(() => props.rubrique, (newRubrique) => {
  if (newRubrique) {
    form.value = {
      code_rubrique: newRubrique.code_rubrique,
      libelle: newRubrique.libelle,
      section: newRubrique.section,
      type_rubrique: newRubrique.type_rubrique,
      chapitre: newRubrique.chapitre,
      niveau: newRubrique.niveau,
      parent_id: newRubrique.parent_id,
      description: newRubrique.description,
      est_actif: newRubrique.est_actif
    }
  } else {
    resetForm()
  }
}, { immediate: true })

async function loadParentRubriques() {
  try {
    const { data, error } = await supabase
      .from('rubriques_budgetaires')
      .select('*')
      .order('code_rubrique', { ascending: true })

    if (error) throw error
    parentRubriques.value = data || []
  } catch (err) {
    console.error('Erreur lors du chargement des rubriques parentes:', err)
  }
}

function resetForm() {
  form.value = {
    code_rubrique: '',
    libelle: '',
    section: 'fonctionnement',
    type_rubrique: 'recette',
    chapitre: null,
    niveau: 1,
    parent_id: null,
    description: null,
    est_actif: true
  }
}

function close() {
  resetForm()
  emit('close')
}

async function handleSubmit() {
  saving.value = true
  try {
    if (isEditing.value && props.rubrique) {
      // Update
      const { error } = await supabase
        .from('rubriques_budgetaires')
        .update(form.value)
        .eq('id', props.rubrique.id)

      if (error) throw error
    } else {
      // Create
      const { error } = await supabase
        .from('rubriques_budgetaires')
        .insert([form.value])

      if (error) throw error
    }

    emit('saved')
    close()
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err)
    alert('Erreur lors de l\'enregistrement de la rubrique budgétaire')
  } finally {
    saving.value = false
  }
}
</script>
