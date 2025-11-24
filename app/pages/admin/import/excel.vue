<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Import Excel
      </h1>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Importez des données de revenus depuis un fichier Excel
      </p>
    </div>

    <!-- Step Indicator -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-center"
          :class="{ 'flex-1': index < steps.length - 1 }"
        >
          <div class="flex flex-col items-center">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-full',
                currentStep >= index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              ]"
            >
              <span v-if="currentStep > index + 1">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span
              class="mt-2 text-xs font-medium"
              :class="currentStep >= index + 1 ? 'text-blue-600' : 'text-gray-500'"
            >
              {{ step }}
            </span>
          </div>
          <div
            v-if="index < steps.length - 1"
            :class="[
              'h-0.5 flex-1 mx-4',
              currentStep > index + 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            ]"
          />
        </div>
      </div>
    </div>

    <!-- Step 1: Upload File -->
    <div v-if="currentStep === 1" class="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
      <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Étape 1: Sélectionner le fichier Excel
      </h2>

      <div class="mb-6">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Fichier Excel (.xlsx ou .xls)
        </label>
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls"
          @change="handleFileSelect"
          class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <p v-if="selectedFile" class="mt-2 text-sm text-gray-600">
          Fichier sélectionné: {{ selectedFile.name }} ({{ formatSize(selectedFile.size) }})
        </p>
      </div>

      <div v-if="analyzing" class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div class="flex items-center gap-3">
          <Icon name="heroicons:arrow-path" class="h-5 w-5 animate-spin text-blue-600" />
          <span class="text-blue-900 dark:text-blue-300">Analyse du fichier en cours...</span>
        </div>
      </div>

      <div v-if="fileStructure" class="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
        <h3 class="mb-2 font-medium text-gray-900 dark:text-white">Structure du fichier</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Nombre de feuilles:</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ fileStructure.total_sheets }}</span>
          </div>
          <div v-for="sheet in fileStructure.sheets" :key="sheet.name" class="border-t border-gray-200 pt-2 dark:border-gray-700">
            <div class="font-medium text-gray-900 dark:text-white">{{ sheet.name }}</div>
            <div class="ml-4 text-gray-600 dark:text-gray-400">
              <div>Ligne d'en-tête: {{ sheet.header_row }}</div>
              <div>Colonnes: {{ sheet.total_columns }}</div>
              <div>Lignes de données: {{ sheet.data_rows }}</div>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="analyzeFile"
        :disabled="!selectedFile || analyzing"
        class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Icon name="heroicons:arrow-right" class="h-4 w-4" />
        Analyser et Continuer
      </button>
    </div>

    <!-- Step 2: Configure Import -->
    <div v-if="currentStep === 2" class="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
      <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Étape 2: Configuration de l'import
      </h2>

      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Feuille Excel -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Feuille à importer <span class="text-red-500">*</span>
          </label>
          <select
            v-model="selectedSheet"
            @change="loadPreview"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="sheet in fileStructure?.sheets" :key="sheet.name" :value="sheet.name">
              {{ sheet.name }} ({{ sheet.data_rows }} lignes)
            </option>
          </select>
        </div>

        <!-- Ligne d'en-tête -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ligne d'en-tête <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="headerRow"
            type="number"
            min="1"
            required
            @change="loadPreview"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Commune (optionnel si colonne dans Excel) -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Commune (défaut si non spécifié dans Excel)
          </label>
          <select
            v-model="defaultCommuneId"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Aucune (doit être dans Excel)</option>
            <option v-for="commune in communes" :key="commune.id" :value="commune.id">
              {{ commune.nom }}
            </option>
          </select>
        </div>

        <!-- Période (optionnel si colonne dans Excel) -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Période (défaut si non spécifié dans Excel)
          </label>
          <select
            v-model="defaultPeriodeId"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Aucune (doit être dans Excel)</option>
            <option v-for="periode in periodes" :key="periode.id" :value="periode.id">
              {{ periode.nom }} ({{ periode.exercice?.annee }})
            </option>
          </select>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="preview" class="mb-6">
        <h3 class="mb-3 font-medium text-gray-900 dark:text-white">Aperçu des données (10 premières lignes)</h3>
        <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th
                  v-for="(header, index) in preview.headers"
                  :key="index"
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              <tr v-for="(row, rowIndex) in preview.preview_rows" :key="rowIndex">
                <td
                  v-for="(header, colIndex) in preview.headers"
                  :key="colIndex"
                  class="whitespace-nowrap px-4 py-2 text-sm text-gray-600 dark:text-gray-300"
                >
                  {{ row[header] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-2 text-sm text-gray-600">
          Total de lignes à importer: {{ preview.total_rows }}
        </p>
      </div>

      <div class="flex gap-3">
        <button
          @click="currentStep = 1"
          class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Icon name="heroicons:arrow-left" class="inline h-4 w-4" />
          Retour
        </button>
        <button
          @click="currentStep = 3"
          :disabled="!preview"
          class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Icon name="heroicons:arrow-right" class="h-4 w-4" />
          Continuer
        </button>
      </div>
    </div>

    <!-- Step 3: Import -->
    <div v-if="currentStep === 3" class="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
      <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Étape 3: Lancer l'import
      </h2>

      <div class="mb-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <div class="flex gap-3">
          <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-yellow-600" />
          <div class="text-sm text-yellow-900 dark:text-yellow-300">
            <p class="font-medium">Attention</p>
            <p class="mt-1">
              L'import va créer ou mettre à jour {{ preview?.total_rows || 0 }} lignes de données.
              Cette opération peut prendre quelques instants.
            </p>
          </div>
        </div>
      </div>

      <div v-if="importing" class="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div class="flex items-center gap-3">
          <Icon name="heroicons:arrow-path" class="h-5 w-5 animate-spin text-blue-600" />
          <span class="text-blue-900 dark:text-blue-300">Import en cours...</span>
        </div>
      </div>

      <div v-if="importResult" class="mb-6 rounded-lg p-4"
        :class="importResult.error_count > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'"
      >
        <h3 class="font-medium"
          :class="importResult.error_count > 0 ? 'text-yellow-900 dark:text-yellow-300' : 'text-green-900 dark:text-green-300'"
        >
          Résultat de l'import
        </h3>
        <div class="mt-2 space-y-1 text-sm"
          :class="importResult.error_count > 0 ? 'text-yellow-800 dark:text-yellow-400' : 'text-green-800 dark:text-green-400'"
        >
          <p>✓ {{ importResult.imported_count }} lignes importées avec succès</p>
          <p v-if="importResult.error_count > 0">✗ {{ importResult.error_count }} erreurs</p>
        </div>

        <!-- Erreurs -->
        <div v-if="importResult.errors && importResult.errors.length > 0" class="mt-4">
          <details class="cursor-pointer">
            <summary class="font-medium text-yellow-900 dark:text-yellow-300">
              Voir les erreurs ({{ importResult.errors.length }})
            </summary>
            <div class="mt-2 max-h-60 overflow-y-auto rounded bg-white p-2 dark:bg-gray-800">
              <div
                v-for="(error, index) in importResult.errors"
                :key="index"
                class="border-b border-gray-200 py-2 text-xs dark:border-gray-700"
              >
                <span class="font-medium">Ligne {{ error.row }}:</span>
                <span class="text-red-600 dark:text-red-400">{{ error.error }}</span>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="currentStep = 2"
          :disabled="importing"
          class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Icon name="heroicons:arrow-left" class="inline h-4 w-4" />
          Retour
        </button>
        <button
          v-if="!importResult"
          @click="performImport"
          :disabled="importing"
          class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Icon name="heroicons:arrow-up-tray" class="h-4 w-4" />
          Lancer l'Import
        </button>
        <button
          v-else
          @click="resetImport"
          class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Icon name="heroicons:arrow-path" class="h-4 w-4" />
          Nouveau Import
        </button>
      </div>
    </div>

    <!-- Help Section -->
    <div class="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <h3 class="mb-2 font-medium text-blue-900 dark:text-blue-300">
        Format du fichier Excel
      </h3>
      <div class="text-sm text-blue-800 dark:text-blue-400">
        <p class="mb-2">Votre fichier Excel doit contenir au minimum les colonnes suivantes:</p>
        <ul class="ml-6 list-disc space-y-1">
          <li><strong>Code rubrique</strong> (ou "Code", "Rubrique") - Obligatoire</li>
          <li><strong>Montant</strong> (ou "Montant réel") - Au moins un montant requis</li>
          <li><strong>Montant prévu</strong> (ou "Budget") - Optionnel</li>
          <li><strong>Commune</strong> - Optionnel si défini globalement</li>
          <li><strong>Période</strong> - Optionnel si défini globalement</li>
          <li><strong>Observations</strong> - Optionnel</li>
        </ul>
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
const steps = ['Upload', 'Configuration', 'Import']
const currentStep = ref(1)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const analyzing = ref(false)
const importing = ref(false)
const fileStructure = ref<any>(null)
const selectedSheet = ref('Sheet1')
const headerRow = ref(1)
const defaultCommuneId = ref('')
const defaultPeriodeId = ref('')
const preview = ref<any>(null)
const importResult = ref<any>(null)
const communes = ref<any[]>([])
const periodes = ref<any[]>([])

// Methods
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    fileStructure.value = null
  }
}

const analyzeFile = async () => {
  if (!selectedFile.value) return

  try {
    analyzing.value = true
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await fetch('http://localhost:8000/api/v1/import/upload/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Erreur lors de l\'analyse')
    }

    const result = await response.json()
    fileStructure.value = result.structure

    // Auto-select first sheet and header row
    if (result.structure.sheets.length > 0) {
      selectedSheet.value = result.structure.sheets[0].name
      headerRow.value = result.structure.sheets[0].header_row
    }

    currentStep.value = 2
    await loadPreview()
  } catch (error: any) {
    console.error('Erreur analyse:', error)
    alert(error.message || 'Erreur lors de l\'analyse du fichier')
  } finally {
    analyzing.value = false
  }
}

const loadPreview = async () => {
  if (!selectedFile.value) return

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await fetch(
      `http://localhost:8000/api/v1/import/upload/preview?sheet_name=${encodeURIComponent(selectedSheet.value)}&header_row=${headerRow.value}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Erreur lors du chargement')
    }

    preview.value = await response.json()
  } catch (error: any) {
    console.error('Erreur prévisualisation:', error)
    alert(error.message || 'Erreur lors de la prévisualisation')
  }
}

const performImport = async () => {
  if (!selectedFile.value) return

  try {
    importing.value = true
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    let url = `http://localhost:8000/api/v1/import/upload/import-revenus?sheet_name=${encodeURIComponent(selectedSheet.value)}&header_row=${headerRow.value}`

    if (defaultCommuneId.value) url += `&commune_id=${defaultCommuneId.value}`
    if (defaultPeriodeId.value) url += `&periode_id=${defaultPeriodeId.value}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Erreur lors de l\'import')
    }

    importResult.value = await response.json()
  } catch (error: any) {
    console.error('Erreur import:', error)
    alert(error.message || 'Erreur lors de l\'import')
  } finally {
    importing.value = false
  }
}

const resetImport = () => {
  currentStep.value = 1
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  fileStructure.value = null
  preview.value = null
  importResult.value = null
}

const fetchCommunes = async () => {
  try {
    communes.value = await api.get('/api/v1/geo/communes')
  } catch (error) {
    console.error('Erreur chargement communes:', error)
  }
}

const fetchPeriodes = async () => {
  try {
    periodes.value = await api.get('/api/v1/exercices/periodes')
  } catch (error) {
    console.error('Erreur chargement périodes:', error)
  }
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} octets`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchCommunes(),
    fetchPeriodes()
  ])
})
</script>
