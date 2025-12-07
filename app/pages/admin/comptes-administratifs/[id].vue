<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
      <UiLoadingSpinner size="lg" />
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadCompte"
    />

    <!-- Content -->
    <template v-else-if="compte">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
          <NuxtLink
            to="/admin/comptes-administratifs"
            class="hover:text-[var(--color-primary)] transition-colors"
          >
            Comptes administratifs
          </NuxtLink>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3 h-3" />
          <span class="text-[var(--text-secondary)]">{{ collectiviteName }}</span>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              {{ collectiviteName }}
            </h1>
            <p class="mt-1 text-[var(--text-secondary)]">
              Compte administratif - Exercice {{ compte.annee }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <UiBadge :variant="getStatutVariant(compte.statut)" size="lg">
              {{ getStatutLabel(compte.statut) }}
            </UiBadge>

            <div class="flex items-center gap-2">
              <UiButton
                v-if="compte.statut === 'brouillon'"
                variant="success"
                size="sm"
                :icon="['fas', 'check']"
                :loading="isValidating"
                @click="handleValider"
              >
                Valider
              </UiButton>
              <UiButton
                v-if="compte.statut === 'valide'"
                variant="primary"
                size="sm"
                :icon="['fas', 'globe']"
                :loading="isPublishing"
                @click="handlePublier"
              >
                Publier
              </UiButton>
              <UiButton
                variant="outline"
                size="sm"
                :icon="['fas', 'download']"
                @click="handleExport"
              >
                Exporter
              </UiButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <p class="text-sm text-[var(--text-muted)] mb-1">Total Recettes</p>
          <p class="text-xl font-bold text-[var(--color-success)] font-mono">
            {{ formatMontant(totaux.recettes) }}
          </p>
        </div>
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <p class="text-sm text-[var(--text-muted)] mb-1">Total Dépenses</p>
          <p class="text-xl font-bold text-[var(--color-error)] font-mono">
            {{ formatMontant(totaux.depenses) }}
          </p>
        </div>
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <p class="text-sm text-[var(--text-muted)] mb-1">Solde</p>
          <p
            :class="[
              'text-xl font-bold font-mono',
              totaux.solde >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
            ]"
          >
            {{ formatMontant(totaux.solde) }}
          </p>
        </div>
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <p class="text-sm text-[var(--text-muted)] mb-1">Lignes saisies</p>
          <p class="text-xl font-bold text-[var(--text-primary)] font-mono">
            {{ lignes.length }}
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
        <UiTabs v-model="activeTab" variant="underline">
          <UiTabPanel name="recettes" label="Recettes">
            <div class="p-4">
              <LignesTable
                :lignes="lignesRecettes"
                :colonnes="colonnes"
                :loading="isLoadingLignes"
                :editable="isEditable"
                @update="handleLigneUpdate"
              />
            </div>
          </UiTabPanel>

          <UiTabPanel name="depenses" label="Dépenses">
            <div class="p-4">
              <LignesTable
                :lignes="lignesDepenses"
                :colonnes="colonnes"
                :loading="isLoadingLignes"
                :editable="isEditable"
                @update="handleLigneUpdate"
              />
            </div>
          </UiTabPanel>

          <UiTabPanel name="equilibre" label="Équilibre">
            <div class="p-4">
              <LignesTable
                :lignes="lignesEquilibre"
                :colonnes="colonnes"
                :loading="isLoadingLignes"
                :editable="isEditable"
                @update="handleLigneUpdate"
              />
            </div>
          </UiTabPanel>

          <UiTabPanel name="historique" label="Historique">
            <div class="p-4">
              <div class="text-center py-8 text-[var(--text-muted)]">
                <font-awesome-icon :icon="['fas', 'history']" class="text-4xl mb-3" />
                <p>Historique des modifications à venir</p>
              </div>
            </div>
          </UiTabPanel>
        </UiTabs>
      </div>

      <!-- Notes section -->
      <div
        v-if="compte.notes"
        class="mt-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4"
      >
        <h3 class="font-medium text-[var(--text-primary)] mb-2">Notes</h3>
        <p class="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{{ compte.notes }}</p>
      </div>

      <!-- Metadata -->
      <div class="mt-6 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Créé le {{ formatDate(compte.created_at) }}</span>
        <span>Dernière modification le {{ formatDate(compte.updated_at) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { CompteAdministratif, LigneBudgetaire, ColonneDynamique } from '~/types/comptes-administratifs'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const toast = useToast()
const comptesService = useComptesAdministratifsService()

// ============================================================================
// STATE
// ============================================================================

const compte = ref<CompteAdministratif | null>(null)
const lignes = ref<LigneBudgetaire[]>([])
const colonnes = ref<ColonneDynamique[]>([])
const isLoading = ref(true)
const isLoadingLignes = ref(false)
const error = ref<string | null>(null)
const activeTab = ref('recettes')

// Action states
const isValidating = ref(false)
const isPublishing = ref(false)

// ============================================================================
// COMPUTED
// ============================================================================

const compteId = computed(() => route.params.id as string)

const collectiviteName = computed(() => {
  if (!compte.value) return ''
  return compte.value.commune?.nom || compte.value.district?.nom || compte.value.region?.nom || 'N/A'
})

const isEditable = computed(() => {
  return compte.value?.statut === 'brouillon' || compte.value?.statut === 'valide'
})

const lignesRecettes = computed(() => {
  return lignes.value.filter(l => l.rubrique?.type === 'recette')
})

const lignesDepenses = computed(() => {
  return lignes.value.filter(l => l.rubrique?.type === 'depense')
})

const lignesEquilibre = computed(() => {
  return lignes.value.filter(l => l.rubrique?.type === 'equilibre')
})

const totaux = computed(() => {
  const recettes = lignesRecettes.value.reduce((sum, l) => {
    const montant = l.valeurs?.realisation || l.valeurs?.prevision || 0
    return sum + (typeof montant === 'number' ? montant : 0)
  }, 0)

  const depenses = lignesDepenses.value.reduce((sum, l) => {
    const montant = l.valeurs?.realisation || l.valeurs?.prevision || 0
    return sum + (typeof montant === 'number' ? montant : 0)
  }, 0)

  return {
    recettes,
    depenses,
    solde: recettes - depenses,
  }
})

// ============================================================================
// METHODS
// ============================================================================

const loadCompte = async () => {
  isLoading.value = true
  error.value = null

  try {
    compte.value = await comptesService.getCompte(compteId.value)
    await Promise.all([loadLignes(), loadColonnes()])
  } catch (err: any) {
    console.error('Erreur lors du chargement du compte:', err)
    error.value = err.message || 'Erreur lors du chargement du compte administratif'
  } finally {
    isLoading.value = false
  }
}

const loadLignes = async () => {
  isLoadingLignes.value = true
  try {
    lignes.value = await comptesService.getLignes(compteId.value)
  } catch (err) {
    console.error('Erreur lors du chargement des lignes:', err)
    toast.error('Erreur lors du chargement des lignes budgétaires')
  } finally {
    isLoadingLignes.value = false
  }
}

const loadColonnes = async () => {
  try {
    colonnes.value = await comptesService.getColonnes({ est_active: true })
  } catch (err) {
    console.error('Erreur lors du chargement des colonnes:', err)
  }
}

const handleLigneUpdate = async (ligne: LigneBudgetaire, valeurs: Record<string, any>) => {
  try {
    await comptesService.updateLigne(compteId.value, ligne.id, { valeurs })
    // Update local state
    const index = lignes.value.findIndex(l => l.id === ligne.id)
    if (index !== -1) {
      lignes.value[index] = { ...lignes.value[index], valeurs }
    }
    toast.success('Ligne mise à jour')
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de la mise à jour')
  }
}

const handleValider = async () => {
  if (!compte.value) return

  isValidating.value = true
  try {
    compte.value = await comptesService.validerCompte(compte.value.id)
    toast.success('Compte validé avec succès')
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de la validation')
  } finally {
    isValidating.value = false
  }
}

const handlePublier = async () => {
  if (!compte.value) return

  isPublishing.value = true
  try {
    compte.value = await comptesService.publierCompte(compte.value.id)
    toast.success('Compte publié avec succès')
  } catch (err: any) {
    toast.error(err.message || 'Erreur lors de la publication')
  } finally {
    isPublishing.value = false
  }
}

const handleExport = () => {
  // TODO: Implement export functionality
  toast.info('Fonctionnalité d\'export à venir')
}

// Helpers
const getStatutVariant = (statut: string): string => {
  const variants: Record<string, string> = {
    brouillon: 'warning',
    valide: 'info',
    publie: 'success',
    archive: 'default',
  }
  return variants[statut] || 'default'
}

const getStatutLabel = (statut: string): string => {
  const labels: Record<string, string> = {
    brouillon: 'Brouillon',
    valide: 'Validé',
    publie: 'Publié',
    archive: 'Archivé',
  }
  return labels[statut] || statut
}

const formatMontant = (montant: number): string => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant) + ' Ar'
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadCompte()
})
</script>
