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
            <font-awesome-icon :icon="['fas', 'sitemap']" class="mr-2" />
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
            <font-awesome-icon :icon="['fas', 'table']" class="mr-2" />
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
          <AdminPlanComptableTreeNode
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
          <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" class="text-4xl text-[var(--text-muted)] mb-4" />
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
import type { PlanComptable, PlanComptableCreate, PlanComptableUpdate } from '~/types/comptabilite'
import { usePlanComptableService } from '~/services/plan-comptable.service'

definePageMeta({
  layout: 'admin',
})

const toast = useAppToast()
const planComptableService = usePlanComptableService()

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
    const niveauFilter = Number(filters.niveau)
    result = result.filter(r => r.niveau === niveauFilter)
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
  const filtered = filteredRubriques.value

  // Si un filtre niveau est appliqué, afficher les éléments filtrés comme racines
  if (filters.niveau) {
    const niveauFilter = Number(filters.niveau)
    // Pour niveau 2 ou 3, afficher les items directement sans arborescence
    if (niveauFilter === 2 || niveauFilter === 3) {
      return filtered.map(r => ({ ...r, children: [] }))
    }
  }

  // Construction normale de l'arborescence à partir du niveau 1
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
    rubriques.value = await planComptableService.getAllRubriques()
  } catch (error: any) {
    console.error('Erreur chargement:', error)
    toast.error(error.message || 'Erreur lors du chargement')
  } finally {
    isLoading.value = false
  }
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

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'gray' | 'warning' | 'info'

const getNiveauVariant = (niveau: number): BadgeVariant => {
  const variants: Record<number, BadgeVariant> = {
    1: 'primary',
    2: 'info',
    3: 'gray',
  }
  return variants[niveau] || 'gray'
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
    if (editingRubrique.value) {
      // Mise à jour via API
      const updateData: PlanComptableUpdate = {
        intitule: formData.intitule,
        ordre_affichage: formData.ordre_affichage,
        est_sommable: formData.est_sommable,
        actif: formData.actif,
      }
      await planComptableService.updateRubrique(editingRubrique.value.code, updateData)
      toast.success('Rubrique mise à jour')
    } else {
      // Création via API
      const niveau = formData.code.length === 2 ? 1 : formData.code.length === 3 ? 2 : 3
      const createData: PlanComptableCreate = {
        code: formData.code,
        intitule: formData.intitule,
        niveau: niveau as 1 | 2 | 3,
        type_mouvement: formData.type_mouvement,
        section: formData.section,
        parent_code: formData.parent_code,
        ordre_affichage: formData.ordre_affichage,
        est_sommable: formData.est_sommable,
        actif: formData.actif,
      }
      await planComptableService.createRubrique(createData)
      toast.success('Rubrique créée')
    }

    showFormModal.value = false
    // Recharger les données
    await loadRubriques()
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
    await planComptableService.deleteRubrique(deletingRubrique.value.code)
    toast.success('Rubrique supprimée')
    showDeleteModal.value = false
    // Recharger les données
    await loadRubriques()
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
