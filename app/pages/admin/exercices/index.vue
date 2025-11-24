<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Exercices Fiscaux
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez les exercices fiscaux et leurs périodes
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <Icon name="heroicons:plus" class="h-5 w-5" />
        Nouvel Exercice
      </button>
    </div>

    <!-- Filter -->
    <div class="mb-6">
      <select
        v-model="filterStatut"
        class="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Tous les exercices</option>
        <option value="ouvert">Ouverts</option>
        <option value="cloture">Clôturés</option>
      </select>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Année
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Période
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Statut
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Périodes
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
              <Icon name="heroicons:arrow-path" class="mx-auto h-8 w-8 animate-spin" />
              <p class="mt-2">Chargement...</p>
            </td>
          </tr>
          <tr v-else-if="filteredExercices.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
              Aucun exercice trouvé
            </td>
          </tr>
          <tr
            v-else
            v-for="exercice in filteredExercices"
            :key="exercice.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
              {{ exercice.annee }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(exercice.date_debut) }} - {{ formatDate(exercice.date_fin) }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
              <span
                :class="[
                  'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                  exercice.statut === 'ouvert' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                ]"
              >
                {{ exercice.statut === 'ouvert' ? 'Ouvert' : 'Clôturé' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ exercice.periodes?.length || 0 }} période(s)
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
              <button
                @click="viewPeriodes(exercice)"
                class="cursor-pointer text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                title="Gérer les périodes"
              >
                <Icon name="heroicons:calendar" class="h-5 w-5" />
              </button>
              <button
                @click="openEditModal(exercice)"
                class="cursor-pointer ml-3 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                title="Modifier"
              >
                <Icon name="heroicons:pencil" class="h-5 w-5" />
              </button>
              <button
                v-if="exercice.statut === 'ouvert'"
                @click="cloturerExercice(exercice)"
                class="cursor-pointer ml-3 text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                title="Clôturer l'exercice"
              >
                <Icon name="heroicons:lock-closed" class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Create/Edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
      @click.self="closeModal"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Modifier l\'Exercice' : 'Nouvel Exercice Fiscal' }}
          </h2>
          <button
            @click="closeModal"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="saveExercice" class="space-y-4">
          <!-- Année -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Année fiscale <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="formData.annee"
              type="number"
              required
              :disabled="isEditing"
              placeholder="2024"
              min="2000"
              max="2100"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-900"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Date début -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date de début <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.date_debut"
                type="date"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Date fin -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date de fin <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.date_fin"
                type="date"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Statut -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.statut"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="ouvert">Ouvert</option>
              <option value="cloture">Clôturé</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Icon v-if="saving" name="heroicons:arrow-path" class="h-4 w-4 animate-spin" />
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const api = useApi()
const router = useRouter()

// State
const exercices = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const filterStatut = ref('')

// Form data
const formData = ref({
  annee: new Date().getFullYear(),
  date_debut: '',
  date_fin: '',
  statut: 'ouvert'
})

const currentExercice = ref<any>(null)

// Computed
const filteredExercices = computed(() => {
  if (!filterStatut.value) return exercices.value
  return exercices.value.filter(e => e.statut === filterStatut.value)
})

// Methods
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR')
}

const fetchExercices = async () => {
  try {
    loading.value = true
    exercices.value = await api.get('/api/v1/exercices/exercices?actif_only=false')
  } catch (error) {
    console.error('Erreur chargement exercices:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  const currentYear = new Date().getFullYear()
  formData.value = {
    annee: currentYear,
    date_debut: `${currentYear}-01-01`,
    date_fin: `${currentYear}-12-31`,
    statut: 'ouvert'
  }
  currentExercice.value = null
  showModal.value = true
}

const openEditModal = (exercice: any) => {
  isEditing.value = true
  currentExercice.value = exercice
  formData.value = {
    annee: exercice.annee,
    date_debut: exercice.date_debut,
    date_fin: exercice.date_fin,
    statut: exercice.statut
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  const currentYear = new Date().getFullYear()
  formData.value = {
    annee: currentYear,
    date_debut: '',
    date_fin: '',
    statut: 'ouvert'
  }
  currentExercice.value = null
}

const saveExercice = async () => {
  try {
    saving.value = true

    const dataToSend = {
      annee: formData.value.annee,
      date_debut: formData.value.date_debut,
      date_fin: formData.value.date_fin,
      statut: formData.value.statut,
      actif: true
    }

    if (isEditing.value && currentExercice.value) {
      // Update
      const { annee, ...updateData } = dataToSend
      await api.put(`/api/v1/exercices/exercices/${currentExercice.value.id}`, updateData)
    } else {
      // Create
      await api.post('/api/v1/exercices/exercices', dataToSend)
    }

    await fetchExercices()
    closeModal()
  } catch (error: any) {
    console.error('Erreur sauvegarde exercice:', error)
    alert(error.response?.data?.detail || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const cloturerExercice = async (exercice: any) => {
  if (!confirm(`Voulez-vous vraiment clôturer l'exercice ${exercice.annee} ? Cette action empêchera les modifications futures.`)) {
    return
  }

  try {
    await api.put(`/api/v1/exercices/exercices/${exercice.id}`, { statut: 'cloture' })
    await fetchExercices()
  } catch (error) {
    console.error('Erreur clôture exercice:', error)
    alert('Erreur lors de la clôture de l\'exercice')
  }
}

const viewPeriodes = (exercice: any) => {
  router.push(`/admin/exercices/${exercice.id}/periodes`)
}

// Lifecycle
onMounted(async () => {
  await fetchExercices()
})
</script>
