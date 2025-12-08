<template>
  <UiModal
    v-model="isOpen"
    title="Ajouter une ligne"
    description="Sélectionnez un compte du plan comptable à ajouter au tableau"
    size="lg"
    :confirm-text="selectedCompte ? 'Ajouter' : undefined"
    :confirm-disabled="!selectedCompte"
    :confirm-loading="isLoading"
    cancel-text="Annuler"
    show-default-footer
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <!-- Filtres -->
    <div class="space-y-4">
      <!-- Type et Section -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Type
          </label>
          <div class="flex gap-2">
            <button
              v-for="t in typeOptions"
              :key="t.value"
              type="button"
              :class="[
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                dataType === t.value
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--interactive-hover)]'
              ]"
              @click="dataType = t.value"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Section
          </label>
          <div class="flex gap-2">
            <button
              v-for="s in sectionOptions"
              :key="s.value"
              type="button"
              :class="[
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                section === s.value
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--interactive-hover)]'
              ]"
              @click="section = s.value"
            >
              {{ s.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Recherche -->
      <div>
        <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Rechercher un compte
        </label>
        <div class="relative">
          <font-awesome-icon
            :icon="['fas', 'search']"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Code ou intitulé..."
            class="w-full pl-10 pr-4 py-2 border border-[var(--border-default)] rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>
      </div>

      <!-- Liste des comptes -->
      <div class="border border-[var(--border-default)] rounded-lg overflow-hidden">
        <div v-if="isLoadingComptes" class="flex items-center justify-center py-8">
          <UiLoadingSpinner size="md" />
        </div>

        <div v-else-if="filteredComptes.length === 0" class="py-8 text-center">
          <font-awesome-icon :icon="['fas', 'inbox']" class="text-3xl text-[var(--text-muted)] mb-2" />
          <p class="text-sm text-[var(--text-muted)]">
            Aucun compte disponible
          </p>
        </div>

        <div v-else class="max-h-[300px] overflow-y-auto">
          <button
            v-for="compte in filteredComptes"
            :key="compte.code"
            type="button"
            :class="[
              'w-full px-4 py-3 text-left border-b border-[var(--border-light)] last:border-b-0 transition-colors',
              selectedCompte?.code === compte.code
                ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]'
                : 'hover:bg-[var(--interactive-hover)]',
              existingCodes.has(compte.code) ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            :disabled="existingCodes.has(compte.code)"
            @click="selectCompte(compte)"
          >
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                  compte.niveau === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                  compte.niveau === 2 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                ]"
              >
                N{{ compte.niveau }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm text-[var(--text-muted)]">{{ compte.code }}</span>
                  <span v-if="existingCodes.has(compte.code)" class="text-xs text-amber-600 dark:text-amber-400">
                    (déjà ajouté)
                  </span>
                </div>
                <p class="text-sm text-[var(--text-primary)] truncate">
                  {{ compte.intitule }}
                </p>
              </div>
              <font-awesome-icon
                v-if="selectedCompte?.code === compte.code"
                :icon="['fas', 'check-circle']"
                class="text-[var(--color-primary)]"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- Compte sélectionné -->
      <div v-if="selectedCompte" class="p-4 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] rounded-lg">
        <div class="flex items-center gap-2 text-sm">
          <font-awesome-icon :icon="['fas', 'check']" class="text-[var(--color-success)]" />
          <span class="font-medium text-[var(--text-primary)]">Sélectionné:</span>
          <span class="font-mono">{{ selectedCompte.code }}</span>
          <span>-</span>
          <span>{{ selectedCompte.intitule }}</span>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import type { PlanComptable, TypeMouvement, SectionBudgetaire } from '~/types/comptabilite'
import type { DataType } from '~/types/donnees'
import { usePlanComptableService } from '~/services/plan-comptable.service'

interface Props {
  modelValue: boolean
  initialDataType?: DataType
  initialSection?: 'fonctionnement' | 'investissement'
  existingCodes?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  initialDataType: 'recette',
  initialSection: 'fonctionnement',
  existingCodes: () => new Set(),
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'add': [compteCode: string, dataType: DataType]
}>()

const planComptableService = usePlanComptableService()

// State
const dataType = ref<DataType>(props.initialDataType)
const section = ref<'fonctionnement' | 'investissement'>(props.initialSection)
const searchQuery = ref('')
const selectedCompte = ref<PlanComptable | null>(null)
const comptes = ref<PlanComptable[]>([])
const isLoadingComptes = ref(false)
const isLoading = ref(false)

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const typeOptions = [
  { value: 'recette' as DataType, label: 'Recette' },
  { value: 'depense' as DataType, label: 'Dépense' },
]

const sectionOptions = [
  { value: 'fonctionnement' as const, label: 'Fonct.' },
  { value: 'investissement' as const, label: 'Invest.' },
]

const filteredComptes = computed(() => {
  let result = comptes.value

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.intitule.toLowerCase().includes(query)
    )
  }

  // Trier: niveau croissant, puis code
  return result.sort((a, b) => {
    if (a.niveau !== b.niveau) return a.niveau - b.niveau
    return a.code.localeCompare(b.code)
  })
})

// Methods
const loadComptes = async () => {
  isLoadingComptes.value = true
  try {
    const typeMouvement: TypeMouvement = dataType.value === 'recette' ? 'RECETTE' : 'DEPENSE'
    const sectionValue: SectionBudgetaire = section.value === 'fonctionnement' ? 'FONCTIONNEMENT' : 'INVESTISSEMENT'

    comptes.value = await planComptableService.getAllRubriques({
      type_mouvement: typeMouvement,
      section: sectionValue,
      actif: true,
    })
  } catch (error) {
    console.error('Erreur lors du chargement des comptes:', error)
    comptes.value = []
  } finally {
    isLoadingComptes.value = false
  }
}

const selectCompte = (compte: PlanComptable) => {
  if (props.existingCodes.has(compte.code)) return
  selectedCompte.value = compte
}

const handleConfirm = () => {
  if (!selectedCompte.value) return
  emit('add', selectedCompte.value.code, dataType.value)
  handleCancel()
}

const handleCancel = () => {
  selectedCompte.value = null
  searchQuery.value = ''
  isOpen.value = false
}

// Watchers
watch([dataType, section], () => {
  selectedCompte.value = null
  loadComptes()
})

watch(isOpen, (open) => {
  if (open) {
    dataType.value = props.initialDataType
    section.value = props.initialSection
    loadComptes()
  }
})
</script>
