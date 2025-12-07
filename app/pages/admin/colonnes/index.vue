<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Colonnes Dynamiques
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Gérez les colonnes des tableaux de recettes et dépenses
        </p>
      </div>
      <UiButton
        variant="primary"
        :icon="['fas', 'plus']"
        @click="openCreateModal"
      >
        Nouvelle colonne
      </UiButton>
    </div>

    <!-- Info cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Colonnes Recettes -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center">
            <FontAwesomeIcon :icon="['fas', 'arrow-trend-up']" class="text-[var(--color-success)]" />
          </div>
          <div>
            <h2 class="font-semibold text-[var(--text-primary)]">Colonnes Recettes</h2>
            <p class="text-sm text-[var(--text-muted)]">{{ colonnesRecettes.length }} colonnes</p>
          </div>
        </div>
        <div class="space-y-2">
          <div
            v-for="(col, idx) in colonnesRecettes"
            :key="col.id"
            class="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-page)] text-sm"
          >
            <span class="w-6 h-6 rounded bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center text-xs font-medium">
              {{ idx + 1 }}
            </span>
            <span class="flex-1">{{ col.label }}</span>
            <code class="text-xs text-[var(--text-muted)]">{{ col.cle }}</code>
          </div>
        </div>
      </div>

      <!-- Colonnes Dépenses -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-error)]/10 flex items-center justify-center">
            <FontAwesomeIcon :icon="['fas', 'arrow-trend-down']" class="text-[var(--color-error)]" />
          </div>
          <div>
            <h2 class="font-semibold text-[var(--text-primary)]">Colonnes Dépenses</h2>
            <p class="text-sm text-[var(--text-muted)]">{{ colonnesDepenses.length }} colonnes</p>
          </div>
        </div>
        <div class="space-y-2">
          <div
            v-for="(col, idx) in colonnesDepenses"
            :key="col.id"
            class="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-page)] text-sm"
          >
            <span class="w-6 h-6 rounded bg-[var(--color-error)]/10 text-[var(--color-error)] flex items-center justify-center text-xs font-medium">
              {{ idx + 1 }}
            </span>
            <span class="flex-1">{{ col.label }}</span>
            <code class="text-xs text-[var(--text-muted)]">{{ col.cle }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- Main table -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
      <div class="p-4 border-b border-[var(--border-default)]">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Filter by type -->
          <UiFormSelect
            v-model="filterType"
            :options="typeFilterOptions"
            class="w-48"
          />
          <!-- Search -->
          <UiFormInput
            v-model="searchQuery"
            placeholder="Rechercher..."
            :icon="['fas', 'search']"
            class="flex-1 min-w-[200px]"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="p-8 flex justify-center">
        <UiLoadingSpinner size="lg" />
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-[var(--bg-page)]">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-[var(--text-secondary)] w-16">Ordre</th>
              <th class="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Clé</th>
              <th class="px-4 py-3 text-left font-medium text-[var(--text-secondary)]">Libellé</th>
              <th class="px-4 py-3 text-center font-medium text-[var(--text-secondary)]">Applicable à</th>
              <th class="px-4 py-3 text-center font-medium text-[var(--text-secondary)]">Type</th>
              <th class="px-4 py-3 text-center font-medium text-[var(--text-secondary)]">Formule</th>
              <th class="px-4 py-3 text-center font-medium text-[var(--text-secondary)]">Statut</th>
              <th class="px-4 py-3 text-right font-medium text-[var(--text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border-light)]">
            <tr
              v-for="colonne in filteredColonnes"
              :key="colonne.id"
              class="hover:bg-[var(--interactive-hover)]"
              draggable="true"
              @dragstart="handleDragStart($event, colonne)"
              @dragover.prevent
              @drop="handleDrop($event, colonne)"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <FontAwesomeIcon
                    :icon="['fas', 'grip-vertical']"
                    class="text-[var(--text-muted)] cursor-grab"
                  />
                  <span class="font-mono">{{ colonne.ordre }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <code class="px-2 py-1 rounded bg-[var(--bg-page)] text-xs">{{ colonne.cle }}</code>
              </td>
              <td class="px-4 py-3 font-medium">{{ colonne.label }}</td>
              <td class="px-4 py-3 text-center">
                <UiBadge :variant="getApplicableVariant(colonne.applicable_a)">
                  {{ getApplicableLabel(colonne.applicable_a) }}
                </UiBadge>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="text-[var(--text-muted)]">{{ getTypeLabel(colonne.type_donnee) }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <FontAwesomeIcon
                  v-if="colonne.formule"
                  :icon="['fas', 'calculator']"
                  class="text-[var(--color-primary)]"
                  :title="colonne.formule"
                />
                <span v-else class="text-[var(--text-muted)]">-</span>
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  :class="[
                    'inline-flex items-center gap-1 text-xs',
                    colonne.est_active ? 'text-[var(--color-success)]' : 'text-[var(--text-muted)]'
                  ]"
                >
                  <span
                    :class="[
                      'w-2 h-2 rounded-full',
                      colonne.est_active ? 'bg-[var(--color-success)]' : 'bg-[var(--text-muted)]'
                    ]"
                  />
                  {{ colonne.est_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <UiButton
                    variant="ghost"
                    size="sm"
                    :icon="['fas', 'edit']"
                    title="Modifier"
                    @click="openEditModal(colonne)"
                  />
                  <UiButton
                    variant="ghost"
                    size="sm"
                    :icon="['fas', 'trash']"
                    class="text-[var(--color-error)]"
                    title="Supprimer"
                    :disabled="colonne.est_systeme"
                    @click="openDeleteModal(colonne)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty state -->
        <div v-if="!filteredColonnes.length && !isLoading" class="p-8">
          <UiEmptyState
            :icon="['fas', 'columns']"
            title="Aucune colonne"
            description="Créez votre première colonne dynamique"
          />
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <UiModal
      v-model="showFormModal"
      :title="editingColonne ? 'Modifier la colonne' : 'Nouvelle colonne'"
      size="md"
    >
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Clé -->
          <UiFormInput
            v-model="formData.cle"
            label="Clé technique"
            placeholder="budget_primitif"
            :error="formErrors.cle"
            :disabled="!!editingColonne"
            required
          >
            <template #hint>
              <span class="text-xs text-[var(--text-muted)]">
                Identifiant unique (snake_case, sans accents)
              </span>
            </template>
          </UiFormInput>

          <!-- Label -->
          <UiFormInput
            v-model="formData.label"
            label="Libellé"
            placeholder="Budget Primitif"
            :error="formErrors.label"
            required
          />

          <!-- Applicable à -->
          <UiFormSelect
            v-model="formData.applicable_a"
            label="Applicable à"
            :options="applicableOptions"
            :error="formErrors.applicable_a"
            required
          />

          <!-- Type de donnée -->
          <UiFormSelect
            v-model="formData.type_donnee"
            label="Type de donnée"
            :options="typeOptions"
            :error="formErrors.type_donnee"
            required
          />

          <!-- Formule (optionnel) -->
          <UiFormInput
            v-model="formData.formule"
            label="Formule de calcul (optionnel)"
            placeholder="{or_admis} / {previsions_definitives}"
          >
            <template #hint>
              <span class="text-xs text-[var(--text-muted)]">
                Utilisez {nom_colonne} pour référencer d'autres colonnes
              </span>
            </template>
          </UiFormInput>

          <!-- Largeur -->
          <UiFormInput
            v-model.number="formData.largeur"
            type="number"
            label="Largeur (pixels)"
            placeholder="120"
          />

          <!-- Ordre -->
          <UiFormInput
            v-model.number="formData.ordre"
            type="number"
            label="Ordre d'affichage"
            placeholder="1"
          />

          <!-- Options -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <input
                v-model="formData.est_obligatoire"
                type="checkbox"
                id="est_obligatoire"
                class="rounded border-[var(--border-default)]"
              />
              <label for="est_obligatoire" class="text-sm text-[var(--text-secondary)]">
                Champ obligatoire
              </label>
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="formData.est_editable"
                type="checkbox"
                id="est_editable"
                class="rounded border-[var(--border-default)]"
              />
              <label for="est_editable" class="text-sm text-[var(--text-secondary)]">
                Modifiable par l'utilisateur
              </label>
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="formData.est_visible"
                type="checkbox"
                id="est_visible"
                class="rounded border-[var(--border-default)]"
              />
              <label for="est_visible" class="text-sm text-[var(--text-secondary)]">
                Visible dans les tableaux
              </label>
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="formData.est_active"
                type="checkbox"
                id="est_active"
                class="rounded border-[var(--border-default)]"
              />
              <label for="est_active" class="text-sm text-[var(--text-secondary)]">
                Colonne active
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <UiButton type="button" variant="outline" @click="showFormModal = false">
            Annuler
          </UiButton>
          <UiButton type="submit" variant="primary" :loading="isSubmitting">
            {{ editingColonne ? 'Enregistrer' : 'Créer' }}
          </UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Delete Modal -->
    <UiModal v-model="showDeleteModal" title="Supprimer la colonne" size="sm">
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer la colonne
        <strong class="text-[var(--text-primary)]">{{ deletingColonne?.label }}</strong> ?
      </p>
      <p class="mt-2 text-sm text-[var(--color-warning)]">
        Les données existantes pour cette colonne seront perdues.
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
  </div>
</template>

<script setup lang="ts">
interface ColonneDynamique {
  id: number
  cle: string
  label: string
  applicable_a: 'recette' | 'depense' | 'tous' | 'equilibre'
  type_donnee: 'montant' | 'pourcentage' | 'texte' | 'date' | 'nombre'
  formule?: string
  largeur?: number
  ordre: number
  est_obligatoire: boolean
  est_editable: boolean
  est_visible: boolean
  est_active: boolean
  est_systeme: boolean
}

definePageMeta({
  layout: 'admin',
})

const toast = useAppToast()

// ============================================================================
// STATE
// ============================================================================

const colonnes = ref<ColonneDynamique[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const filterType = ref('')

const showFormModal = ref(false)
const editingColonne = ref<ColonneDynamique | null>(null)
const isSubmitting = ref(false)
const formData = reactive({
  cle: '',
  label: '',
  applicable_a: 'tous' as ColonneDynamique['applicable_a'],
  type_donnee: 'montant' as ColonneDynamique['type_donnee'],
  formule: '',
  largeur: 120,
  ordre: 1,
  est_obligatoire: false,
  est_editable: true,
  est_visible: true,
  est_active: true,
})
const formErrors = reactive<Record<string, string>>({})

const showDeleteModal = ref(false)
const deletingColonne = ref<ColonneDynamique | null>(null)
const isDeleting = ref(false)

let draggedColonne: ColonneDynamique | null = null

// ============================================================================
// OPTIONS
// ============================================================================

const typeFilterOptions = [
  { value: '', label: 'Toutes les colonnes' },
  { value: 'recette', label: 'Recettes uniquement' },
  { value: 'depense', label: 'Dépenses uniquement' },
  { value: 'tous', label: 'Communes' },
]

const applicableOptions = [
  { value: 'recette', label: 'Recettes' },
  { value: 'depense', label: 'Dépenses' },
  { value: 'tous', label: 'Tous (recettes et dépenses)' },
  { value: 'equilibre', label: 'Tableau d\'équilibre' },
]

const typeOptions = [
  { value: 'montant', label: 'Montant (Ariary)' },
  { value: 'pourcentage', label: 'Pourcentage' },
  { value: 'nombre', label: 'Nombre' },
  { value: 'texte', label: 'Texte' },
  { value: 'date', label: 'Date' },
]

// ============================================================================
// COMPUTED
// ============================================================================

const filteredColonnes = computed(() => {
  let result = [...colonnes.value]

  if (filterType.value) {
    result = result.filter(c =>
      c.applicable_a === filterType.value || c.applicable_a === 'tous'
    )
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.cle.toLowerCase().includes(q) ||
      c.label.toLowerCase().includes(q)
    )
  }

  return result.sort((a, b) => a.ordre - b.ordre)
})

const colonnesRecettes = computed(() =>
  colonnes.value
    .filter(c => c.applicable_a === 'recette' || c.applicable_a === 'tous')
    .filter(c => c.est_active)
    .sort((a, b) => a.ordre - b.ordre)
)

const colonnesDepenses = computed(() =>
  colonnes.value
    .filter(c => c.applicable_a === 'depense' || c.applicable_a === 'tous')
    .filter(c => c.est_active)
    .sort((a, b) => a.ordre - b.ordre)
)

// ============================================================================
// METHODS
// ============================================================================

const loadColonnes = async () => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    colonnes.value = generateMockColonnes()
  } catch (error) {
    console.error('Erreur chargement:', error)
    toast.error('Erreur lors du chargement')
  } finally {
    isLoading.value = false
  }
}

const generateMockColonnes = (): ColonneDynamique[] => [
  // Colonnes communes
  { id: 1, cle: 'budget_primitif', label: 'Budget Primitif', applicable_a: 'tous', type_donnee: 'montant', ordre: 1, est_obligatoire: false, est_editable: true, est_visible: true, est_active: true, est_systeme: true },
  { id: 2, cle: 'budget_additionnel', label: 'Budget Additionnel', applicable_a: 'tous', type_donnee: 'montant', ordre: 2, est_obligatoire: false, est_editable: true, est_visible: true, est_active: true, est_systeme: true },
  { id: 3, cle: 'modifications', label: 'Modifications +/-', applicable_a: 'tous', type_donnee: 'montant', ordre: 3, est_obligatoire: false, est_editable: true, est_visible: true, est_active: true, est_systeme: true },
  { id: 4, cle: 'previsions_definitives', label: 'Prévisions Définitives', applicable_a: 'tous', type_donnee: 'montant', formule: '{budget_primitif} + {budget_additionnel} + {modifications}', ordre: 4, est_obligatoire: false, est_editable: false, est_visible: true, est_active: true, est_systeme: true },

  // Colonnes recettes
  { id: 10, cle: 'or_admis', label: 'OR Admis', applicable_a: 'recette', type_donnee: 'montant', ordre: 5, est_obligatoire: false, est_editable: true, est_visible: true, est_active: true, est_systeme: true },
  { id: 11, cle: 'recouvrement', label: 'Recouvrement', applicable_a: 'recette', type_donnee: 'montant', ordre: 6, est_obligatoire: false, est_editable: true, est_visible: true, est_active: true, est_systeme: true },
  { id: 12, cle: 'reste_a_recouvrer', label: 'Reste à Recouvrer', applicable_a: 'recette', type_donnee: 'montant', formule: '{or_admis} - {recouvrement}', ordre: 7, est_obligatoire: false, est_editable: false, est_visible: true, est_active: true, est_systeme: true },
  { id: 13, cle: 'taux_execution_recette', label: "Taux d'Exécution", applicable_a: 'recette', type_donnee: 'pourcentage', formule: '{or_admis} / {previsions_definitives}', ordre: 8, est_obligatoire: false, est_editable: false, est_visible: true, est_active: true, est_systeme: true },

  // Colonnes dépenses
  { id: 20, cle: 'engagement', label: 'Engagement', applicable_a: 'depense', type_donnee: 'montant', ordre: 5, est_obligatoire: false, est_editable: true, est_visible: true, est_active: true, est_systeme: true },
  { id: 21, cle: 'mandat_admis', label: 'Mandat Admis', applicable_a: 'depense', type_donnee: 'montant', ordre: 6, est_obligatoire: false, est_editable: true, est_visible: true, est_active: true, est_systeme: true },
  { id: 22, cle: 'paiement', label: 'Paiement', applicable_a: 'depense', type_donnee: 'montant', ordre: 7, est_obligatoire: false, est_editable: true, est_visible: true, est_active: true, est_systeme: true },
  { id: 23, cle: 'reste_a_payer', label: 'Reste à Payer', applicable_a: 'depense', type_donnee: 'montant', formule: '{mandat_admis} - {paiement}', ordre: 8, est_obligatoire: false, est_editable: false, est_visible: true, est_active: true, est_systeme: true },
  { id: 24, cle: 'taux_execution_depense', label: "Taux d'Exécution", applicable_a: 'depense', type_donnee: 'pourcentage', formule: '{mandat_admis} / {previsions_definitives}', ordre: 9, est_obligatoire: false, est_editable: false, est_visible: true, est_active: true, est_systeme: true },
]

const getApplicableVariant = (type: string): string => {
  const variants: Record<string, string> = {
    recette: 'success',
    depense: 'error',
    tous: 'primary',
    equilibre: 'warning',
  }
  return variants[type] || 'default'
}

const getApplicableLabel = (type: string): string => {
  const labels: Record<string, string> = {
    recette: 'Recettes',
    depense: 'Dépenses',
    tous: 'Tous',
    equilibre: 'Équilibre',
  }
  return labels[type] || type
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    montant: 'Montant',
    pourcentage: '%',
    nombre: 'Nombre',
    texte: 'Texte',
    date: 'Date',
  }
  return labels[type] || type
}

// Form handling
const openCreateModal = () => {
  editingColonne.value = null
  Object.assign(formData, {
    cle: '',
    label: '',
    applicable_a: 'tous',
    type_donnee: 'montant',
    formule: '',
    largeur: 120,
    ordre: colonnes.value.length + 1,
    est_obligatoire: false,
    est_editable: true,
    est_visible: true,
    est_active: true,
  })
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  showFormModal.value = true
}

const openEditModal = (colonne: ColonneDynamique) => {
  editingColonne.value = colonne
  Object.assign(formData, {
    cle: colonne.cle,
    label: colonne.label,
    applicable_a: colonne.applicable_a,
    type_donnee: colonne.type_donnee,
    formule: colonne.formule || '',
    largeur: colonne.largeur || 120,
    ordre: colonne.ordre,
    est_obligatoire: colonne.est_obligatoire,
    est_editable: colonne.est_editable,
    est_visible: colonne.est_visible,
    est_active: colonne.est_active,
  })
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  showFormModal.value = true
}

const handleSubmit = async () => {
  Object.keys(formErrors).forEach(key => delete formErrors[key])

  if (!formData.cle) {
    formErrors.cle = 'La clé est requise'
    return
  }
  if (!/^[a-z_]+$/.test(formData.cle)) {
    formErrors.cle = 'La clé doit être en snake_case (minuscules et underscores)'
    return
  }
  if (!formData.label) {
    formErrors.label = 'Le libellé est requis'
    return
  }

  isSubmitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    if (editingColonne.value) {
      const index = colonnes.value.findIndex(c => c.id === editingColonne.value!.id)
      if (index !== -1) {
        colonnes.value[index] = {
          ...colonnes.value[index],
          label: formData.label,
          applicable_a: formData.applicable_a,
          type_donnee: formData.type_donnee,
          formule: formData.formule || undefined,
          largeur: formData.largeur,
          ordre: formData.ordre,
          est_obligatoire: formData.est_obligatoire,
          est_editable: formData.est_editable,
          est_visible: formData.est_visible,
          est_active: formData.est_active,
        }
      }
      toast.success('Colonne mise à jour')
    } else {
      colonnes.value.push({
        id: Date.now(),
        cle: formData.cle,
        label: formData.label,
        applicable_a: formData.applicable_a,
        type_donnee: formData.type_donnee,
        formule: formData.formule || undefined,
        largeur: formData.largeur,
        ordre: formData.ordre,
        est_obligatoire: formData.est_obligatoire,
        est_editable: formData.est_editable,
        est_visible: formData.est_visible,
        est_active: formData.est_active,
        est_systeme: false,
      })
      toast.success('Colonne créée')
    }

    showFormModal.value = false
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de l\'enregistrement')
  } finally {
    isSubmitting.value = false
  }
}

// Delete handling
const openDeleteModal = (colonne: ColonneDynamique) => {
  if (colonne.est_systeme) {
    toast.warning('Les colonnes système ne peuvent pas être supprimées')
    return
  }
  deletingColonne.value = colonne
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!deletingColonne.value) return

  isDeleting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    colonnes.value = colonnes.value.filter(c => c.id !== deletingColonne.value!.id)
    toast.success('Colonne supprimée')
    showDeleteModal.value = false
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de la suppression')
  } finally {
    isDeleting.value = false
  }
}

// Drag and drop for reordering
const handleDragStart = (event: DragEvent, colonne: ColonneDynamique) => {
  draggedColonne = colonne
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDrop = async (event: DragEvent, targetColonne: ColonneDynamique) => {
  if (!draggedColonne || draggedColonne.id === targetColonne.id) return

  const draggedIndex = colonnes.value.findIndex(c => c.id === draggedColonne!.id)
  const targetIndex = colonnes.value.findIndex(c => c.id === targetColonne.id)

  if (draggedIndex === -1 || targetIndex === -1) return

  // Réorganiser
  const [removed] = colonnes.value.splice(draggedIndex, 1)
  colonnes.value.splice(targetIndex, 0, removed)

  // Mettre à jour les ordres
  colonnes.value.forEach((c, i) => {
    c.ordre = i + 1
  })

  toast.success('Ordre mis à jour')
  draggedColonne = null
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadColonnes()
})
</script>
