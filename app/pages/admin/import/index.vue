<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Import de Données
      </h1>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">
        Importez des données depuis des fichiers Excel ou CSV
      </p>
    </div>

    <!-- Main content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left column: Upload and configuration -->
      <div class="lg:col-span-2 space-y-6">
        <!-- File dropzone -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            1. Sélectionner un fichier
          </h2>

          <div
            ref="dropzoneRef"
            :class="[
              'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
              isDragging
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)]'
                : 'border-[var(--border-default)] hover:border-[var(--color-primary)] hover:bg-[var(--interactive-hover)]'
            ]"
            @click="openFileDialog"
            @dragenter.prevent="handleDragEnter"
            @dragleave.prevent="handleDragLeave"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx,.xls,.csv"
              class="hidden"
              @change="handleFileSelect"
            />

            <template v-if="!selectedFile">
              <font-awesome-icon
                :icon="['fas', 'cloud-upload-alt']"
                class="text-4xl text-[var(--text-muted)] mb-4"
              />
              <p class="text-[var(--text-primary)] font-medium mb-2">
                Glissez-déposez un fichier ici
              </p>
              <p class="text-sm text-[var(--text-muted)]">
                ou cliquez pour sélectionner
              </p>
              <p class="text-xs text-[var(--text-muted)] mt-2">
                Formats acceptés: Excel (.xlsx, .xls) ou CSV
              </p>
            </template>

            <template v-else>
              <div class="flex items-center justify-center gap-4">
                <font-awesome-icon
                  :icon="getFileIcon(selectedFile.name)"
                  class="text-3xl text-[var(--color-success)]"
                />
                <div class="text-left">
                  <p class="font-medium text-[var(--text-primary)]">
                    {{ selectedFile.name }}
                  </p>
                  <p class="text-sm text-[var(--text-muted)]">
                    {{ formatFileSize(selectedFile.size) }}
                  </p>
                </div>
                <UiButton
                  variant="ghost"
                  size="sm"
                  :icon="['fas', 'times']"
                  class="text-[var(--color-error)]"
                  @click.stop="clearFile"
                />
              </div>
            </template>
          </div>
        </div>

        <!-- Configuration -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            2. Configuration
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Type de données -->
            <UiFormSelect
              v-model="importConfig.type"
              label="Type de données"
              :options="typeOptions"
              required
            />

            <!-- Année -->
            <UiFormSelect
              v-model="importConfig.annee"
              label="Année"
              :options="yearOptions"
              required
            />

            <!-- Region -->
            <UiFormSelect
              v-model="importConfig.region_id"
              label="Région"
              :options="regionOptions"
              placeholder="Sélectionner une région"
              @update:model-value="handleRegionChange"
            />

            <!-- Commune -->
            <UiFormSelect
              v-model="importConfig.commune_id"
              label="Commune"
              :options="communeOptions"
              placeholder="Sélectionner une commune"
              :disabled="!importConfig.region_id"
            />
          </div>

          <!-- Options -->
          <div class="mt-4 pt-4 border-t border-[var(--border-light)]">
            <div class="flex items-center gap-4">
              <UiFormCheckbox
                v-model="importConfig.skipFirstRow"
                label="Ignorer la première ligne (en-têtes)"
              />
              <UiFormCheckbox
                v-model="importConfig.updateExisting"
                label="Mettre à jour les données existantes"
              />
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div
          v-if="previewData.length"
          class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6"
        >
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            3. Prévisualisation
          </h2>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-[var(--border-default)]">
                  <th
                    v-for="(header, index) in previewHeaders"
                    :key="index"
                    class="text-left py-2 px-3 font-medium text-[var(--text-secondary)]"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in previewData.slice(0, 5)"
                  :key="rowIndex"
                  class="border-b border-[var(--border-light)]"
                >
                  <td
                    v-for="(cell, cellIndex) in row"
                    :key="cellIndex"
                    class="py-2 px-3 text-[var(--text-primary)]"
                  >
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="text-sm text-[var(--text-muted)] mt-3">
            Affichage des 5 premières lignes sur {{ previewData.length }} au total
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
          <UiButton
            variant="outline"
            @click="resetForm"
          >
            Réinitialiser
          </UiButton>
          <UiButton
            variant="primary"
            :icon="['fas', 'upload']"
            :loading="isImporting"
            :disabled="!canImport"
            @click="handleImport"
          >
            Importer les données
          </UiButton>
        </div>
      </div>

      <!-- Right column: Templates and history -->
      <div class="space-y-6">
        <!-- Templates -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            Modèles
          </h2>

          <div class="space-y-3">
            <a
              v-for="template in templates"
              :key="template.type"
              :href="template.url"
              class="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-light)] hover:border-[var(--color-primary)] hover:bg-[var(--interactive-hover)] transition-all"
              download
            >
              <div class="w-10 h-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center text-[var(--color-primary)]">
                <font-awesome-icon :icon="['fas', 'file-excel']" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-[var(--text-primary)]">
                  {{ template.label }}
                </p>
                <p class="text-xs text-[var(--text-muted)]">
                  Fichier Excel (.xlsx)
                </p>
              </div>
              <font-awesome-icon
                :icon="['fas', 'download']"
                class="text-[var(--text-muted)]"
              />
            </a>
          </div>
        </div>

        <!-- Recent imports -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
            Imports récents
          </h2>

          <div v-if="recentImports.length" class="space-y-3">
            <div
              v-for="imp in recentImports"
              :key="imp.id"
              class="p-3 rounded-lg border border-[var(--border-light)]"
            >
              <div class="flex items-start justify-between mb-2">
                <p class="text-sm font-medium text-[var(--text-primary)]">
                  {{ imp.fichier_nom }}
                </p>
                <UiBadge :variant="getImportStatusVariant(imp.statut)" size="sm">
                  {{ getImportStatusLabel(imp.statut) }}
                </UiBadge>
              </div>
              <div class="text-xs text-[var(--text-muted)]">
                <span>{{ formatDate(imp.created_at) }}</span>
                <span v-if="imp.lignes_importees" class="ml-2">
                  • {{ imp.lignes_importees }}/{{ imp.lignes_total }} lignes
                </span>
              </div>
            </div>
          </div>

          <UiEmptyState
            v-else
            :icon="['fas', 'history']"
            title="Aucun import"
            description="Vos imports récents apparaîtront ici"
            size="sm"
          />
        </div>
      </div>
    </div>

    <!-- Import result modal -->
    <UiModal
      v-model="showResultModal"
      :title="importResult?.success ? 'Import réussi' : 'Résultat de l\'import'"
      size="md"
    >
      <div v-if="importResult">
        <div
          :class="[
            'p-4 rounded-lg mb-4',
            importResult.success ? 'bg-[var(--color-success-light)]' : 'bg-[var(--color-warning-light)]'
          ]"
        >
          <div class="flex items-center gap-3">
            <font-awesome-icon
              :icon="['fas', importResult.success ? 'check-circle' : 'exclamation-triangle']"
              :class="importResult.success ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'"
              class="text-xl"
            />
            <div>
              <p class="font-medium text-[var(--text-primary)]">
                {{ importResult.success ? 'Import terminé avec succès' : 'Import terminé avec des avertissements' }}
              </p>
              <p class="text-sm text-[var(--text-secondary)]">
                {{ importResult.lignes_importees }} lignes importées sur {{ importResult.lignes_total }}
              </p>
            </div>
          </div>
        </div>

        <!-- Errors list -->
        <div v-if="importResult.errors?.length" class="mb-4">
          <h4 class="font-medium text-[var(--text-primary)] mb-2">
            Erreurs ({{ importResult.errors.length }})
          </h4>
          <div class="max-h-48 overflow-y-auto space-y-2">
            <div
              v-for="(error, index) in importResult.errors"
              :key="index"
              class="p-2 rounded bg-[var(--color-error-light)] text-sm"
            >
              <span class="font-mono text-[var(--color-error)]">Ligne {{ error.ligne }}:</span>
              <span class="text-[var(--text-primary)] ml-2">{{ error.message }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <UiButton
            variant="primary"
            @click="showResultModal = false"
          >
            Fermer
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { ImportResult } from '~/services/import.service'

definePageMeta({
  layout: 'admin',
})

const toast = useAppToast()
const importService = useImportService()
const geoService = useGeoService()

// ============================================================================
// STATE
// ============================================================================

const dropzoneRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const isImporting = ref(false)

const importConfig = reactive({
  type: 'comptes_administratifs',
  annee: new Date().getFullYear(),
  region_id: null as string | null,
  commune_id: null as string | null,
  skipFirstRow: true,
  updateExisting: false,
})

const previewHeaders = ref<string[]>([])
const previewData = ref<string[][]>([])

const showResultModal = ref(false)
const importResult = ref<ImportResult | null>(null)

// Geography data
const regions = ref<Array<{ id: string; nom: string }>>([])
const communes = ref<Array<{ id: string; nom: string; region_id?: string }>>([])

// Recent imports
const recentImports = ref<Array<{
  id: string
  fichier_nom: string
  statut: string
  lignes_total?: number
  lignes_importees?: number
  created_at: string
}>>([])

// ============================================================================
// COMPUTED
// ============================================================================

const typeOptions = [
  { value: 'comptes_administratifs', label: 'Comptes administratifs' },
  { value: 'recettes', label: 'Recettes' },
  { value: 'depenses', label: 'Dépenses' },
  { value: 'communes', label: 'Communes' },
  { value: 'revenus_miniers', label: 'Revenus miniers' },
]

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push({ value: y, label: String(y) })
  }
  return years
})

const regionOptions = computed(() => [
  { value: '', label: 'Toutes les régions' },
  ...regions.value.map(r => ({ value: r.id, label: r.nom })),
])

const communeOptions = computed(() => {
  const filtered = importConfig.region_id
    ? communes.value.filter(c => c.region_id === importConfig.region_id)
    : communes.value
  return filtered.map(c => ({ value: c.id, label: c.nom }))
})

const templates = [
  { type: 'comptes', label: 'Compte administratif', url: '/templates/template_compte_administratif.xlsx' },
  { type: 'recettes', label: 'Recettes', url: '/templates/template_recettes.xlsx' },
  { type: 'depenses', label: 'Dépenses', url: '/templates/template_depenses.xlsx' },
]

const canImport = computed(() => {
  return selectedFile.value && importConfig.type && importConfig.annee
})

// ============================================================================
// METHODS
// ============================================================================

const openFileDialog = () => {
  fileInputRef.value?.click()
}

const handleDragEnter = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files?.length) {
    processFile(files[0])
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    processFile(input.files[0])
  }
}

const processFile = async (file: File) => {
  // Validate file type
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ]
  const validExtensions = ['.xlsx', '.xls', '.csv']
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

  if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
    toast.error('Format de fichier non supporté. Utilisez Excel (.xlsx, .xls) ou CSV.')
    return
  }

  selectedFile.value = file

  // Generate preview
  try {
    const preview = await importService.previewImport(file, {
      type: importConfig.type,
      skip_first_row: importConfig.skipFirstRow,
    })
    previewHeaders.value = preview.headers || []
    previewData.value = preview.rows || []
  } catch (error) {
    console.error('Erreur lors de la prévisualisation:', error)
    // Generate basic preview for display
    previewHeaders.value = ['Colonne 1', 'Colonne 2', 'Colonne 3']
    previewData.value = [['Données...', '...', '...']]
  }
}

const clearFile = () => {
  selectedFile.value = null
  previewHeaders.value = []
  previewData.value = []
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleRegionChange = () => {
  importConfig.commune_id = null
}

const handleImport = async () => {
  if (!selectedFile.value || !canImport.value) return

  isImporting.value = true
  try {
    const result = await importService.importExcel(selectedFile.value, {
      type: importConfig.type,
      annee: importConfig.annee,
      commune_id: importConfig.commune_id || undefined,
      skip_first_row: importConfig.skipFirstRow,
      update_existing: importConfig.updateExisting,
    })

    importResult.value = result
    showResultModal.value = true

    if (result.success) {
      toast.success(`${result.lignes_importees} lignes importées avec succès`)
      clearFile()
      loadRecentImports()
    }
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de l\'import')
  } finally {
    isImporting.value = false
  }
}

const resetForm = () => {
  clearFile()
  importConfig.type = 'comptes_administratifs'
  importConfig.annee = new Date().getFullYear()
  importConfig.region_id = null
  importConfig.commune_id = null
  importConfig.skipFirstRow = true
  importConfig.updateExisting = false
}

const loadGeography = async () => {
  try {
    const [regionsData, communesData] = await Promise.all([
      geoService.getRegions({ limit: 100 }),
      geoService.getCommunes({ limit: 2000 }),
    ])
    regions.value = regionsData.items
    communes.value = communesData.items
  } catch (error) {
    console.error('Erreur lors du chargement des données géographiques:', error)
  }
}

const loadRecentImports = async () => {
  try {
    const response = await importService.getImportHistory({ limit: 5 })
    recentImports.value = response.items
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
  }
}

// Helpers
const getFileIcon = (filename: string): string[] => {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  if (ext === '.csv') return ['fas', 'file-csv']
  return ['fas', 'file-excel']
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getImportStatusVariant = (status: string): string => {
  const variants: Record<string, string> = {
    termine: 'success',
    en_cours: 'info',
    erreur: 'error',
    annule: 'default',
  }
  return variants[status] || 'default'
}

const getImportStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    termine: 'Terminé',
    en_cours: 'En cours',
    erreur: 'Erreur',
    annule: 'Annulé',
  }
  return labels[status] || status
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadGeography()
  loadRecentImports()
})
</script>
