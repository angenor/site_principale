<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Projets Miniers
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez les projets d'extraction minière
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <Icon name="heroicons:plus" class="h-5 w-5" />
        Nouveau Projet
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Rechercher
        </label>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Nom ou code..."
          class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Société
        </label>
        <select
          v-model="filterSociete"
          class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Toutes</option>
          <option v-for="societe in societes" :key="societe.id" :value="societe.id">
            {{ societe.nom }}
          </option>
        </select>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Type de minerai
        </label>
        <select
          v-model="filterTypeMinerai"
          class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Tous</option>
          <option v-for="type in typesMinerais" :key="type.id" :value="type.id">
            {{ type.nom }}
          </option>
        </select>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Statut
        </label>
        <select
          v-model="filterStatut"
          class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Tous</option>
          <option value="actif">Actif</option>
          <option value="suspendu">Suspendu</option>
          <option value="termine">Terminé</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Code
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Nom du projet
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Société
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Minerai
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Statut
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              <Icon name="heroicons:arrow-path" class="mx-auto h-8 w-8 animate-spin" />
              <p class="mt-2">Chargement...</p>
            </td>
          </tr>
          <tr v-else-if="filteredProjets.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              Aucun projet minier trouvé
            </td>
          </tr>
          <tr
            v-else
            v-for="projet in filteredProjets"
            :key="projet.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
              {{ projet.code }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
              {{ projet.nom }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ projet.societe_miniere?.nom || 'N/A' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ projet.type_minerai?.nom || 'N/A' }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
              <span
                :class="[
                  'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                  projet.statut === 'actif' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                  projet.statut === 'suspendu' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                ]"
              >
                {{ projet.statut }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
              <button
                @click="openEditModal(projet)"
                class="cursor-pointer text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                title="Modifier"
              >
                <Icon name="heroicons:pencil" class="h-5 w-5" />
              </button>
              <button
                @click="toggleStatus(projet)"
                class="cursor-pointer ml-3 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                :title="projet.actif ? 'Désactiver' : 'Activer'"
              >
                <Icon :name="projet.actif ? 'heroicons:x-circle' : 'heroicons:check-circle'" class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Create/Edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 overflow-y-auto"
      @click.self="closeModal"
    >
      <div class="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 my-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Modifier le Projet' : 'Nouveau Projet Minier' }}
          </h2>
          <button
            @click="closeModal"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="saveProjet" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Code -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.code"
                type="text"
                required
                :disabled="isEditing"
                placeholder="Ex: AMBATOVY-01"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-900"
              />
            </div>

            <!-- Nom -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom du projet <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.nom"
                type="text"
                required
                placeholder="Nom du projet"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- Société minière -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Société minière <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.societe_miniere_id"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sélectionnez une société</option>
                <option v-for="societe in societes" :key="societe.id" :value="societe.id">
                  {{ societe.nom }}
                </option>
              </select>
            </div>

            <!-- Type de minerai -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type de minerai <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.type_minerai_id"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sélectionnez un type</option>
                <option v-for="type in typesMinerais" :key="type.id" :value="type.id">
                  {{ type.nom }}
                </option>
              </select>
            </div>
          </div>

          <!-- Commune -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Commune d'implantation <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.commune_id"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionnez une commune</option>
              <option v-for="commune in communes" :key="commune.id" :value="commune.id">
                {{ commune.nom }} ({{ commune.region?.nom || '' }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <!-- Date début -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date de début
              </label>
              <input
                v-model="formData.date_debut"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Date fin -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date de fin
              </label>
              <input
                v-model="formData.date_fin"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
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
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Description du projet (optionnel)"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            ></textarea>
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

// State
const projets = ref<any[]>([])
const societes = ref<any[]>([])
const typesMinerais = ref<any[]>([])
const communes = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

// Filters
const searchTerm = ref('')
const filterSociete = ref('')
const filterTypeMinerai = ref('')
const filterStatut = ref('')

// Form data
const formData = ref({
  code: '',
  nom: '',
  societe_miniere_id: '',
  type_minerai_id: '',
  commune_id: '',
  date_debut: '',
  date_fin: '',
  statut: 'actif',
  description: ''
})

const currentProjet = ref<any>(null)

// Computed
const filteredProjets = computed(() => {
  let result = projets.value

  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(p =>
      p.nom.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term)
    )
  }

  // Filter by société
  if (filterSociete.value) {
    result = result.filter(p => p.societe_miniere_id === filterSociete.value)
  }

  // Filter by type minerai
  if (filterTypeMinerai.value) {
    result = result.filter(p => p.type_minerai_id === filterTypeMinerai.value)
  }

  // Filter by statut
  if (filterStatut.value) {
    result = result.filter(p => p.statut === filterStatut.value)
  }

  return result
})

// Methods
const fetchProjets = async () => {
  try {
    loading.value = true
    projets.value = await api.get('/api/v1/projets-miniers/projets?actif_only=false')
  } catch (error) {
    console.error('Erreur chargement projets miniers:', error)
  } finally {
    loading.value = false
  }
}

const fetchSocietes = async () => {
  try {
    societes.value = await api.get('/api/v1/projets-miniers/societes')
  } catch (error) {
    console.error('Erreur chargement sociétés:', error)
  }
}

const fetchTypesMinerais = async () => {
  try {
    typesMinerais.value = await api.get('/api/v1/projets-miniers/types-minerais')
  } catch (error) {
    console.error('Erreur chargement types de minerais:', error)
  }
}

const fetchCommunes = async () => {
  try {
    communes.value = await api.get('/api/v1/geo/communes')
  } catch (error) {
    console.error('Erreur chargement communes:', error)
  }
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    code: '',
    nom: '',
    societe_miniere_id: '',
    type_minerai_id: '',
    commune_id: '',
    date_debut: '',
    date_fin: '',
    statut: 'actif',
    description: ''
  }
  currentProjet.value = null
  showModal.value = true
}

const openEditModal = (projet: any) => {
  isEditing.value = true
  currentProjet.value = projet
  formData.value = {
    code: projet.code,
    nom: projet.nom,
    societe_miniere_id: projet.societe_miniere_id,
    type_minerai_id: projet.type_minerai_id,
    commune_id: projet.commune_id,
    date_debut: projet.date_debut || '',
    date_fin: projet.date_fin || '',
    statut: projet.statut,
    description: projet.description || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    code: '',
    nom: '',
    societe_miniere_id: '',
    type_minerai_id: '',
    commune_id: '',
    date_debut: '',
    date_fin: '',
    statut: 'actif',
    description: ''
  }
  currentProjet.value = null
}

const saveProjet = async () => {
  try {
    saving.value = true

    const dataToSend = {
      code: formData.value.code,
      nom: formData.value.nom,
      societe_miniere_id: formData.value.societe_miniere_id,
      type_minerai_id: formData.value.type_minerai_id,
      commune_id: formData.value.commune_id,
      date_debut: formData.value.date_debut || null,
      date_fin: formData.value.date_fin || null,
      statut: formData.value.statut,
      description: formData.value.description || null,
      actif: true
    }

    if (isEditing.value && currentProjet.value) {
      // Update
      const { code, ...updateData } = dataToSend
      await api.put(`/api/v1/projets-miniers/projets/${currentProjet.value.id}`, updateData)
    } else {
      // Create
      await api.post('/api/v1/projets-miniers/projets', dataToSend)
    }

    await fetchProjets()
    closeModal()
  } catch (error: any) {
    console.error('Erreur sauvegarde projet:', error)
    alert(error.response?.data?.detail || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (projet: any) => {
  if (!confirm(`Voulez-vous ${projet.actif ? 'désactiver' : 'activer'} ce projet ?`)) {
    return
  }

  try {
    if (projet.actif) {
      // Désactiver
      await api.delete(`/api/v1/projets-miniers/projets/${projet.id}`)
    } else {
      // Réactiver
      await api.put(`/api/v1/projets-miniers/projets/${projet.id}`, { actif: true })
    }

    await fetchProjets()
  } catch (error) {
    console.error('Erreur changement statut:', error)
    alert('Erreur lors du changement de statut')
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchProjets(),
    fetchSocietes(),
    fetchTypesMinerais(),
    fetchCommunes()
  ])
})
</script>
