<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Types de Documents
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez les types de documents autorisés
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <Icon name="heroicons:plus" class="h-5 w-5" />
        Nouveau Type
      </button>
    </div>

    <!-- Filter -->
    <div class="mb-6 flex gap-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Rechercher un type..."
        class="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
      <select
        v-model="filterActif"
        class="w-48 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Tous</option>
        <option value="true">Actifs</option>
        <option value="false">Inactifs</option>
      </select>
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
              Nom
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Extensions
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Taille Max
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
          <tr v-else-if="filteredTypes.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              Aucun type de document trouvé
            </td>
          </tr>
          <tr
            v-else
            v-for="type in filteredTypes"
            :key="type.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
              {{ type.code }}
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ type.nom }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              <span v-if="type.extensions_autorisees && type.extensions_autorisees.length > 0">
                {{ type.extensions_autorisees.join(', ') }}
              </span>
              <span v-else class="text-gray-400">Toutes</span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ type.taille_max_mo }} Mo
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm">
              <span
                :class="[
                  'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                  type.actif ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                ]"
              >
                {{ type.actif ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
              <button
                @click="openEditModal(type)"
                class="cursor-pointer text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                title="Modifier"
              >
                <Icon name="heroicons:pencil" class="h-5 w-5" />
              </button>
              <button
                @click="toggleStatus(type)"
                class="cursor-pointer ml-3 text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                :title="type.actif ? 'Désactiver' : 'Activer'"
              >
                <Icon :name="type.actif ? 'heroicons:x-circle' : 'heroicons:check-circle'" class="h-5 w-5" />
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
            {{ isEditing ? 'Modifier le Type' : 'Nouveau Type de Document' }}
          </h2>
          <button
            @click="closeModal"
            class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="saveType" class="space-y-4">
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
              placeholder="Ex: BUDGET_ANNUEL"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:dark:bg-gray-900"
            />
          </div>

          <!-- Nom -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.nom"
              type="text"
              required
              placeholder="Ex: Budget Annuel"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Description du type de document"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Extensions autorisées -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Extensions autorisées
            </label>
            <input
              v-model="extensionsInput"
              type="text"
              placeholder="Ex: .pdf,.xlsx,.docx (séparées par des virgules)"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500">Laisser vide pour autoriser toutes les extensions</p>
          </div>

          <!-- Taille max -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Taille maximale (Mo) <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="formData.taille_max_mo"
              type="number"
              required
              min="1"
              max="100"
              placeholder="10"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
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
const types = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const searchTerm = ref('')
const filterActif = ref('')
const extensionsInput = ref('')

// Form data
const formData = ref({
  code: '',
  nom: '',
  description: '',
  extensions_autorisees: [] as string[],
  taille_max_mo: 10,
  actif: true
})

const currentType = ref<any>(null)

// Computed
const filteredTypes = computed(() => {
  let result = types.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    result = result.filter(t =>
      t.code.toLowerCase().includes(search) ||
      t.nom.toLowerCase().includes(search)
    )
  }

  if (filterActif.value !== '') {
    const actif = filterActif.value === 'true'
    result = result.filter(t => t.actif === actif)
  }

  return result
})

// Methods
const fetchTypes = async () => {
  try {
    loading.value = true
    types.value = await api.get('/api/v1/documents/types-documents?actif_only=false')
  } catch (error) {
    console.error('Erreur chargement types:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    code: '',
    nom: '',
    description: '',
    extensions_autorisees: [],
    taille_max_mo: 10,
    actif: true
  }
  extensionsInput.value = ''
  currentType.value = null
  showModal.value = true
}

const openEditModal = (type: any) => {
  isEditing.value = true
  currentType.value = type
  formData.value = {
    code: type.code,
    nom: type.nom,
    description: type.description || '',
    extensions_autorisees: type.extensions_autorisees || [],
    taille_max_mo: type.taille_max_mo,
    actif: type.actif
  }
  extensionsInput.value = type.extensions_autorisees ? type.extensions_autorisees.join(',') : ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    code: '',
    nom: '',
    description: '',
    extensions_autorisees: [],
    taille_max_mo: 10,
    actif: true
  }
  extensionsInput.value = ''
  currentType.value = null
}

const saveType = async () => {
  try {
    saving.value = true

    // Parse extensions
    const extensions = extensionsInput.value
      ? extensionsInput.value.split(',').map(ext => ext.trim()).filter(ext => ext.length > 0)
      : []

    const dataToSend = {
      ...formData.value,
      extensions_autorisees: extensions.length > 0 ? extensions : null
    }

    if (isEditing.value && currentType.value) {
      // Update
      const { code, ...updateData } = dataToSend
      await api.put(`/api/v1/documents/types-documents/${currentType.value.id}`, updateData)
    } else {
      // Create
      await api.post('/api/v1/documents/types-documents', dataToSend)
    }

    await fetchTypes()
    closeModal()
  } catch (error: any) {
    console.error('Erreur sauvegarde type:', error)
    alert(error.response?.data?.detail || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (type: any) => {
  try {
    await api.put(`/api/v1/documents/types-documents/${type.id}`, { actif: !type.actif })
    await fetchTypes()
  } catch (error) {
    console.error('Erreur changement statut:', error)
    alert('Erreur lors du changement de statut')
  }
}

// Lifecycle
onMounted(async () => {
  await fetchTypes()
})
</script>
