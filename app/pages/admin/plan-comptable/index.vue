<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Plan Comptable
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Gérez les rubriques budgétaires (lignes des tableaux)
        </p>
      </div>
      <div class="flex items-center gap-3">
        <UiButton
          variant="outline"
          :icon="['fas', 'file-import']"
          @click="showImportModal = true"
        >
          Importer
        </UiButton>
        <UiButton
          variant="primary"
          :icon="['fas', 'plus']"
          @click="openCreateModal"
        >
          Nouvelle rubrique
        </UiButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Type filter -->
        <div class="w-40">
          <UiFormSelect
            v-model="filters.type_mouvement"
            label="Type"
            :options="typeOptions"
            placeholder="Tous"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Section filter -->
        <div class="w-44">
          <UiFormSelect
            v-model="filters.section"
            label="Section"
            :options="sectionOptions"
            placeholder="Toutes"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Niveau filter -->
        <div class="w-32">
          <UiFormSelect
            v-model="filters.niveau"
            label="Niveau"
            :options="niveauOptions"
            placeholder="Tous"
            @update:model-value="handleFilterChange"
          />
        </div>

        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <UiFormInput
            v-model="searchQuery"
            placeholder="Rechercher par code ou intitulé..."
            :icon="['fas', 'search']"
            @update:model-value="debouncedSearch"
          />
        </div>

        <!-- Clear filters -->
        <UiButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          :icon="['fas', 'times']"
          @click="clearFilters"
        >
          Effacer
        </UiButton>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Total rubriques</p>
        <p class="text-2xl font-bold text-[var(--text-primary)]">{{ stats.total }}</p>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Recettes</p>
        <p class="text-2xl font-bold text-[var(--color-success)]">{{ stats.recettes }}</p>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Dépenses</p>
        <p class="text-2xl font-bold text-[var(--color-error)]">{{ stats.depenses }}</p>
      </div>
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <p class="text-sm text-[var(--text-muted)] mb-1">Actives</p>
        <p class="text-2xl font-bold text-[var(--color-primary)]">{{ stats.actives }}</p>
      </div>
    </div>

    <!-- Tree view or table -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
      <!-- View toggle -->
      <div class="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
        <div class="flex items-center gap-2">
          <button
            @click="viewMode = 'tree'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              viewMode === 'tree'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]'
            ]"
          >
            <FontAwesomeIcon :icon="['fas', 'sitemap']" class="mr-2" />
            Arborescence
          </button>
          <button
            @click="viewMode = 'table'"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              viewMode === 'table'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--bg-page)] text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]'
            ]"
          >
            <FontAwesomeIcon :icon="['fas', 'table']" class="mr-2" />
            Liste
          </button>
        </div>
        <span class="text-sm text-[var(--text-muted)]">
          {{ filteredRubriques.length }} rubrique(s)
        </span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="p-8 flex items-center justify-center">
        <UiLoadingSpinner size="lg" />
      </div>

      <!-- Tree view -->
      <div v-else-if="viewMode === 'tree'" class="p-4">
        <div v-if="!treeData.length" class="text-center py-8">
          <UiEmptyState
            :icon="['fas', 'sitemap']"
            title="Aucune rubrique"
            description="Commencez par créer une rubrique de niveau 1"
          />
        </div>
        <div v-else class="space-y-2">
          <TreeNode
            v-for="node in treeData"
            :key="node.code"
            :node="node"
            @edit="openEditModal"
            @delete="openDeleteModal"
            @add-child="openCreateChildModal"
          />
        </div>
      </div>

      <!-- Table view -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-[var(--bg-page)]">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Code</th>
              <th class="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Intitulé</th>
              <th class="px-4 py-3 text-center font-medium text-[var(--text-secondary)]">Niveau</th>
              <th class="px-4 py-3 text-center font-medium text-[var(--text-secondary)]">Type</th>
              <th class="px-4 py-3 text-center font-medium text-[var(--text-secondary)]">Section</th>
              <th class="px-4 py-3 text-center font-medium text-[var(--text-secondary)]">Statut</th>
              <th class="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border-light)]">
            <tr
              v-for="rubrique in filteredRubriques"
              :key="rubrique.code"
              class="hover:bg-[var(--interactive-hover)]"
              :class="{ 'bg-[var(--bg-page)]/50': rubrique.niveau === 1 }"
            >
              <td class="px-4 py-3 font-mono font-medium">
                <span :style="{ paddingLeft: `${(rubrique.niveau - 1) * 16}px` }">
                  {{ rubrique.code }}
                </span>
              </td>
              <td class="px-4 py-3" :class="{ 'font-semibold': rubrique.niveau === 1 }">
                {{ rubrique.intitule }}
              </td>
              <td class="px-4 py-3 text-center">
                <UiBadge :variant="getNiveauVariant(rubrique.niveau)">
                  Niveau {{ rubrique.niveau }}
                </UiBadge>
              </td>
              <td class="px-4 py-3 text-center">
                <UiBadge :variant="rubrique.type_mouvement === 'recette' ? 'success' : 'error'">
                  {{ rubrique.type_mouvement === 'recette' ? 'Recette' : 'Dépense' }}
                </UiBadge>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="text-[var(--text-secondary)]">
                  {{ rubrique.section === 'fonctionnement' ? 'Fonct.' : 'Invest.' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  :class="[
                    'inline-flex items-center gap-1 text-xs',
                    rubrique.actif ? 'text-[var(--color-success)]' : 'text-[var(--text-muted)]'
                  ]"
                >
                  <span
                    :class="[
                      'w-2 h-2 rounded-full',
                      rubrique.actif ? 'bg-[var(--color-success)]' : 'bg-[var(--text-muted)]'
                    ]"
                  />
                  {{ rubrique.actif ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <UiButton
                    v-if="rubrique.niveau < 3"
                    variant="ghost"
                    size="sm"
                    :icon="['fas', 'plus']"
                    title="Ajouter sous-rubrique"
                    @click="openCreateChildModal(rubrique)"
                  />
                  <UiButton
                    variant="ghost"
                    size="sm"
                    :icon="['fas', 'edit']"
                    title="Modifier"
                    @click="openEditModal(rubrique)"
                  />
                  <UiButton
                    variant="ghost"
                    size="sm"
                    :icon="['fas', 'trash']"
                    class="text-[var(--color-error)]"
                    title="Supprimer"
                    @click="openDeleteModal(rubrique)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <UiModal
      v-model="showFormModal"
      :title="editingRubrique ? 'Modifier la rubrique' : 'Nouvelle rubrique'"
      size="md"
    >
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Code -->
          <UiFormInput
            v-model="formData.code"
            label="Code"
            placeholder="Ex: 70, 708, 7080"
            :error="formErrors.code"
            :disabled="!!editingRubrique"
            required
          >
            <template #hint>
              <span class="text-xs text-[var(--text-muted)]">
                2 chiffres = niveau 1, 3 chiffres = niveau 2, 4 chiffres = niveau 3
              </span>
            </template>
          </UiFormInput>

          <!-- Intitulé -->
          <UiFormInput
            v-model="formData.intitule"
            label="Intitulé"
            placeholder="Libellé de la rubrique"
            :error="formErrors.intitule"
            required
          />

          <!-- Type mouvement -->
          <UiFormSelect
            v-model="formData.type_mouvement"
            label="Type de mouvement"
            :options="typeOptionsForm"
            :error="formErrors.type_mouvement"
            :disabled="!!parentRubrique"
            required
          />

          <!-- Section -->
          <UiFormSelect
            v-model="formData.section"
            label="Section budgétaire"
            :options="sectionOptionsForm"
            :error="formErrors.section"
            :disabled="!!parentRubrique"
            required
          />

          <!-- Parent -->
          <UiFormSelect
            v-if="formData.code.length > 2"
            v-model="formData.parent_code"
            label="Rubrique parente"
            :options="parentOptions"
            :error="formErrors.parent_code"
            :disabled="!!parentRubrique"
          />

          <!-- Ordre affichage -->
          <UiFormInput
            v-model.number="formData.ordre_affichage"
            type="number"
            label="Ordre d'affichage"
            placeholder="1, 2, 3..."
          />

          <!-- Est sommable -->
          <div class="flex items-center gap-2">
            <input
              v-model="formData.est_sommable"
              type="checkbox"
              id="est_sommable"
              class="rounded border-[var(--border-default)]"
            />
            <label for="est_sommable" class="text-sm text-[var(--text-secondary)]">
              Inclure dans les totaux (sommable)
            </label>
          </div>

          <!-- Actif -->
          <div class="flex items-center gap-2">
            <input
              v-model="formData.actif"
              type="checkbox"
              id="actif"
              class="rounded border-[var(--border-default)]"
            />
            <label for="actif" class="text-sm text-[var(--text-secondary)]">
              Rubrique active
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <UiButton
            type="button"
            variant="outline"
            @click="showFormModal = false"
          >
            Annuler
          </UiButton>
          <UiButton
            type="submit"
            variant="primary"
            :loading="isSubmitting"
          >
            {{ editingRubrique ? 'Enregistrer' : 'Créer' }}
          </UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Delete Modal -->
    <UiModal
      v-model="showDeleteModal"
      title="Supprimer la rubrique"
      size="sm"
    >
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer la rubrique
        <strong class="text-[var(--text-primary)]">{{ deletingRubrique?.code }} - {{ deletingRubrique?.intitule }}</strong> ?
      </p>
      <p v-if="deletingRubrique?.niveau === 1" class="mt-2 text-sm text-[var(--color-warning)]">
        Attention : cette rubrique est de niveau 1 et peut avoir des sous-rubriques.
      </p>

      <div class="flex justify-end gap-3 mt-6">
        <UiButton variant="outline" @click="showDeleteModal = false">
          Annuler
        </UiButton>
        <UiButton variant="danger" :loading="isDeleting" @click="handleDelete">
          Supprimer
        </UiButton>
      </div>
    </UiModal>

    <!-- Import Modal -->
    <UiModal
      v-model="showImportModal"
      title="Importer le plan comptable"
      size="md"
    >
      <div class="space-y-4">
        <p class="text-[var(--text-secondary)]">
          Importez un fichier Excel ou CSV contenant le plan comptable.
        </p>
        <div
          class="border-2 border-dashed border-[var(--border-default)] rounded-xl p-8 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer"
          @click="$refs.fileInput?.click()"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
        >
          <FontAwesomeIcon :icon="['fas', 'cloud-upload-alt']" class="text-4xl text-[var(--text-muted)] mb-4" />
          <p class="text-[var(--text-secondary)]">
            Glissez-déposez un fichier ou cliquez pour parcourir
          </p>
          <p class="text-xs text-[var(--text-muted)] mt-2">
            Formats acceptés: .xlsx, .xls, .csv
          </p>
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            class="hidden"
            @change="handleFileSelect"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <UiButton variant="outline" @click="showImportModal = false">
          Fermer
        </UiButton>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { PlanComptable } from '~/types/comptabilite'

definePageMeta({
  layout: 'admin',
})

const toast = useAppToast()

// ============================================================================
// STATE
// ============================================================================

const rubriques = ref<PlanComptable[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const viewMode = ref<'tree' | 'table'>('tree')

const filters = reactive({
  type_mouvement: null as string | null,
  section: null as string | null,
  niveau: null as number | null,
})

const showFormModal = ref(false)
const editingRubrique = ref<PlanComptable | null>(null)
const parentRubrique = ref<PlanComptable | null>(null)
const isSubmitting = ref(false)
const formData = reactive({
  code: '',
  intitule: '',
  type_mouvement: 'recette' as 'recette' | 'depense',
  section: 'fonctionnement' as 'fonctionnement' | 'investissement',
  parent_code: null as string | null,
  ordre_affichage: null as number | null,
  est_sommable: true,
  actif: true,
})
const formErrors = reactive<Record<string, string>>({})

const showDeleteModal = ref(false)
const deletingRubrique = ref<PlanComptable | null>(null)
const isDeleting = ref(false)

const showImportModal = ref(false)

// ============================================================================
// OPTIONS
// ============================================================================

const typeOptions = [
  { value: '', label: 'Tous les types' },
  { value: 'recette', label: 'Recettes' },
  { value: 'depense', label: 'Dépenses' },
]

const typeOptionsForm = [
  { value: 'recette', label: 'Recette' },
  { value: 'depense', label: 'Dépense' },
]

const sectionOptions = [
  { value: '', label: 'Toutes les sections' },
  { value: 'fonctionnement', label: 'Fonctionnement' },
  { value: 'investissement', label: 'Investissement' },
]

const sectionOptionsForm = [
  { value: 'fonctionnement', label: 'Fonctionnement' },
  { value: 'investissement', label: 'Investissement' },
]

const niveauOptions = [
  { value: '', label: 'Tous' },
  { value: 1, label: 'Niveau 1' },
  { value: 2, label: 'Niveau 2' },
  { value: 3, label: 'Niveau 3' },
]

// ============================================================================
// COMPUTED
// ============================================================================

const hasActiveFilters = computed(() => {
  return !!(filters.type_mouvement || filters.section || filters.niveau || searchQuery.value)
})

const filteredRubriques = computed(() => {
  let result = [...rubriques.value]

  if (filters.type_mouvement) {
    result = result.filter(r => r.type_mouvement === filters.type_mouvement)
  }
  if (filters.section) {
    result = result.filter(r => r.section === filters.section)
  }
  if (filters.niveau) {
    result = result.filter(r => r.niveau === filters.niveau)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.code.toLowerCase().includes(q) ||
      r.intitule.toLowerCase().includes(q)
    )
  }

  return result.sort((a, b) => {
    // Trier par type, section, puis code
    if (a.type_mouvement !== b.type_mouvement) {
      return a.type_mouvement === 'recette' ? -1 : 1
    }
    if (a.section !== b.section) {
      return a.section === 'fonctionnement' ? -1 : 1
    }
    return a.code.localeCompare(b.code)
  })
})

const stats = computed(() => ({
  total: rubriques.value.length,
  recettes: rubriques.value.filter(r => r.type_mouvement === 'recette').length,
  depenses: rubriques.value.filter(r => r.type_mouvement === 'depense').length,
  actives: rubriques.value.filter(r => r.actif).length,
}))

const treeData = computed(() => {
  // Construire l'arborescence
  const filtered = filteredRubriques.value
  const niveau1 = filtered.filter(r => r.niveau === 1)

  return niveau1.map(n1 => ({
    ...n1,
    children: filtered
      .filter(r => r.niveau === 2 && r.parent_code === n1.code)
      .map(n2 => ({
        ...n2,
        children: filtered.filter(r => r.niveau === 3 && r.parent_code === n2.code),
      })),
  }))
})

const parentOptions = computed(() => {
  const codeLen = formData.code.length
  let parentNiveau = 1

  if (codeLen === 3) parentNiveau = 1
  else if (codeLen === 4) parentNiveau = 2
  else return []

  return rubriques.value
    .filter(r =>
      r.niveau === parentNiveau &&
      r.type_mouvement === formData.type_mouvement &&
      r.section === formData.section
    )
    .map(r => ({ value: r.code, label: `${r.code} - ${r.intitule}` }))
})

// ============================================================================
// METHODS
// ============================================================================

const loadRubriques = async () => {
  isLoading.value = true
  try {
    // Simuler un appel API - remplacer par le vrai service
    await new Promise(resolve => setTimeout(resolve, 500))
    rubriques.value = generateMockPlanComptable()
  } catch (error) {
    console.error('Erreur chargement:', error)
    toast.error('Erreur lors du chargement')
  } finally {
    isLoading.value = false
  }
}

const generateMockPlanComptable = (): PlanComptable[] => {
  return [
    // Recettes Fonctionnement
    { id: 1, code: '70', intitule: 'IMPOTS SUR LES REVENUS, BENEFICES ET GAINS', niveau: 1, type_mouvement: 'recette', section: 'fonctionnement', parent_code: null, est_sommable: true, ordre_affichage: 1, actif: true },
    { id: 2, code: '708', intitule: 'Autres impôts sur les revenus', niveau: 2, type_mouvement: 'recette', section: 'fonctionnement', parent_code: '70', est_sommable: true, ordre_affichage: 1, actif: true },
    { id: 3, code: '7080', intitule: 'Autres impôts sur les revenus - Impôt synthétique', niveau: 3, type_mouvement: 'recette', section: 'fonctionnement', parent_code: '708', est_sommable: true, ordre_affichage: 1, actif: true },
    { id: 4, code: '71', intitule: 'IMPOTS SUR LE PATRIMOINE', niveau: 1, type_mouvement: 'recette', section: 'fonctionnement', parent_code: null, est_sommable: true, ordre_affichage: 2, actif: true },
    { id: 5, code: '714', intitule: 'Impôts fonciers sur les terrains - IFT', niveau: 2, type_mouvement: 'recette', section: 'fonctionnement', parent_code: '71', est_sommable: true, ordre_affichage: 1, actif: true },
    { id: 6, code: '7140', intitule: 'Impôts fonciers sur les terrains - IFT', niveau: 3, type_mouvement: 'recette', section: 'fonctionnement', parent_code: '714', est_sommable: true, ordre_affichage: 1, actif: true },
    { id: 7, code: '72', intitule: 'IMPOTS SUR LES BIENS ET SERVICES', niveau: 1, type_mouvement: 'recette', section: 'fonctionnement', parent_code: null, est_sommable: true, ordre_affichage: 3, actif: true },
    { id: 8, code: '74', intitule: 'RISTOURNES ET REDEVANCES MINIERES', niveau: 1, type_mouvement: 'recette', section: 'fonctionnement', parent_code: null, est_sommable: true, ordre_affichage: 4, actif: true },
    { id: 9, code: '741', intitule: 'Ristournes minières', niveau: 2, type_mouvement: 'recette', section: 'fonctionnement', parent_code: '74', est_sommable: true, ordre_affichage: 1, actif: true },
    { id: 10, code: '7411', intitule: 'Quote-part ristournes minières', niveau: 3, type_mouvement: 'recette', section: 'fonctionnement', parent_code: '741', est_sommable: true, ordre_affichage: 1, actif: true },
    // Dépenses Fonctionnement
    { id: 20, code: '60', intitule: 'CHARGES DE PERSONNEL', niveau: 1, type_mouvement: 'depense', section: 'fonctionnement', parent_code: null, est_sommable: true, ordre_affichage: 1, actif: true },
    { id: 21, code: '601', intitule: 'Salaires et accessoires', niveau: 2, type_mouvement: 'depense', section: 'fonctionnement', parent_code: '60', est_sommable: true, ordre_affichage: 1, actif: true },
    { id: 22, code: '6011', intitule: 'Personnel permanent', niveau: 3, type_mouvement: 'depense', section: 'fonctionnement', parent_code: '601', est_sommable: true, ordre_affichage: 1, actif: true },
    { id: 23, code: '6012', intitule: 'Personnel non permanent', niveau: 3, type_mouvement: 'depense', section: 'fonctionnement', parent_code: '601', est_sommable: true, ordre_affichage: 2, actif: true },
    { id: 24, code: '61', intitule: 'ACHATS DE BIENS', niveau: 1, type_mouvement: 'depense', section: 'fonctionnement', parent_code: null, est_sommable: true, ordre_affichage: 2, actif: true },
    { id: 25, code: '611', intitule: 'Achats de biens de fonctionnement général', niveau: 2, type_mouvement: 'depense', section: 'fonctionnement', parent_code: '61', est_sommable: true, ordre_affichage: 1, actif: true },
    { id: 26, code: '6111', intitule: 'Fournitures et articles de bureau', niveau: 3, type_mouvement: 'depense', section: 'fonctionnement', parent_code: '611', est_sommable: true, ordre_affichage: 1, actif: true },
  ] as PlanComptable[]
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Filtrage réactif via computed
  }, 300)
}

const handleFilterChange = () => {
  // Filtrage réactif via computed
}

const clearFilters = () => {
  filters.type_mouvement = null
  filters.section = null
  filters.niveau = null
  searchQuery.value = ''
}

const getNiveauVariant = (niveau: number): string => {
  const variants: Record<number, string> = {
    1: 'primary',
    2: 'info',
    3: 'default',
  }
  return variants[niveau] || 'default'
}

// Form handling
const openCreateModal = () => {
  editingRubrique.value = null
  parentRubrique.value = null
  Object.assign(formData, {
    code: '',
    intitule: '',
    type_mouvement: 'recette',
    section: 'fonctionnement',
    parent_code: null,
    ordre_affichage: null,
    est_sommable: true,
    actif: true,
  })
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  showFormModal.value = true
}

const openCreateChildModal = (parent: PlanComptable) => {
  editingRubrique.value = null
  parentRubrique.value = parent
  Object.assign(formData, {
    code: parent.code, // L'utilisateur doit ajouter les chiffres
    intitule: '',
    type_mouvement: parent.type_mouvement,
    section: parent.section,
    parent_code: parent.code,
    ordre_affichage: null,
    est_sommable: true,
    actif: true,
  })
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  showFormModal.value = true
}

const openEditModal = (rubrique: PlanComptable) => {
  editingRubrique.value = rubrique
  parentRubrique.value = null
  Object.assign(formData, {
    code: rubrique.code,
    intitule: rubrique.intitule,
    type_mouvement: rubrique.type_mouvement,
    section: rubrique.section,
    parent_code: rubrique.parent_code,
    ordre_affichage: rubrique.ordre_affichage,
    est_sommable: rubrique.est_sommable,
    actif: rubrique.actif,
  })
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  showFormModal.value = true
}

const handleSubmit = async () => {
  Object.keys(formErrors).forEach(key => delete formErrors[key])

  // Validation
  if (!formData.code) {
    formErrors.code = 'Le code est requis'
    return
  }
  if (formData.code.length < 2 || formData.code.length > 4) {
    formErrors.code = 'Le code doit avoir 2, 3 ou 4 chiffres'
    return
  }
  if (!formData.intitule) {
    formErrors.intitule = 'L\'intitulé est requis'
    return
  }

  isSubmitting.value = true
  try {
    // Simuler l'appel API
    await new Promise(resolve => setTimeout(resolve, 500))

    if (editingRubrique.value) {
      // Mise à jour
      const index = rubriques.value.findIndex(r => r.code === editingRubrique.value!.code)
      if (index !== -1) {
        rubriques.value[index] = {
          ...rubriques.value[index],
          intitule: formData.intitule,
          ordre_affichage: formData.ordre_affichage,
          est_sommable: formData.est_sommable,
          actif: formData.actif,
        }
      }
      toast.success('Rubrique mise à jour')
    } else {
      // Création
      const niveau = formData.code.length === 2 ? 1 : formData.code.length === 3 ? 2 : 3
      rubriques.value.push({
        id: Date.now(),
        code: formData.code,
        intitule: formData.intitule,
        niveau,
        type_mouvement: formData.type_mouvement,
        section: formData.section,
        parent_code: formData.parent_code,
        ordre_affichage: formData.ordre_affichage,
        est_sommable: formData.est_sommable,
        actif: formData.actif,
      } as PlanComptable)
      toast.success('Rubrique créée')
    }

    showFormModal.value = false
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de l\'enregistrement')
  } finally {
    isSubmitting.value = false
  }
}

// Delete handling
const openDeleteModal = (rubrique: PlanComptable) => {
  deletingRubrique.value = rubrique
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!deletingRubrique.value) return

  isDeleting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    rubriques.value = rubriques.value.filter(r => r.code !== deletingRubrique.value!.code)
    toast.success('Rubrique supprimée')
    showDeleteModal.value = false
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de la suppression')
  } finally {
    isDeleting.value = false
  }
}

// Import handling
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    processImportFile(target.files[0])
  }
}

const handleFileDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file) {
    processImportFile(file)
  }
}

const processImportFile = async (file: File) => {
  toast.info(`Import du fichier ${file.name} en cours...`)
  // TODO: Implémenter l'import réel
  await new Promise(resolve => setTimeout(resolve, 1000))
  toast.success('Import terminé')
  showImportModal.value = false
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadRubriques()
})
</script>

<script lang="ts">
// Composant TreeNode pour l'affichage en arborescence
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: { type: Object, required: true },
    depth: { type: Number, default: 0 },
  },
  emits: ['edit', 'delete', 'add-child'],
  setup(props, { emit }) {
    const isExpanded = ref(true)

    const toggle = () => {
      isExpanded.value = !isExpanded.value
    }

    const hasChildren = computed(() => props.node.children?.length > 0)

    return { isExpanded, toggle, hasChildren, emit }
  },
  template: `
    <div class="tree-node">
      <div
        :class="[
          'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-[var(--interactive-hover)]',
          node.niveau === 1 ? 'bg-[var(--bg-page)]' : ''
        ]"
        :style="{ marginLeft: depth * 24 + 'px' }"
      >
        <button
          v-if="hasChildren"
          @click="toggle"
          class="w-5 h-5 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <FontAwesomeIcon :icon="['fas', isExpanded ? 'chevron-down' : 'chevron-right']" class="text-xs" />
        </button>
        <span v-else class="w-5" />

        <span class="font-mono text-sm font-medium text-[var(--color-primary)]">{{ node.code }}</span>
        <span :class="['flex-1', node.niveau === 1 ? 'font-semibold' : '']">{{ node.intitule }}</span>

        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            v-if="node.niveau < 3"
            @click.stop="emit('add-child', node)"
            class="p-1 text-[var(--text-muted)] hover:text-[var(--color-primary)]"
            title="Ajouter sous-rubrique"
          >
            <FontAwesomeIcon :icon="['fas', 'plus']" class="text-xs" />
          </button>
          <button
            @click.stop="emit('edit', node)"
            class="p-1 text-[var(--text-muted)] hover:text-[var(--color-primary)]"
            title="Modifier"
          >
            <FontAwesomeIcon :icon="['fas', 'edit']" class="text-xs" />
          </button>
          <button
            @click.stop="emit('delete', node)"
            class="p-1 text-[var(--text-muted)] hover:text-[var(--color-error)]"
            title="Supprimer"
          >
            <FontAwesomeIcon :icon="['fas', 'trash']" class="text-xs" />
          </button>
        </div>
      </div>

      <div v-if="hasChildren && isExpanded">
        <TreeNode
          v-for="child in node.children"
          :key="child.code"
          :node="child"
          :depth="depth + 1"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
          @add-child="emit('add-child', $event)"
        />
      </div>
    </div>
  `,
})

export default {
  components: { TreeNode },
}
</script>
