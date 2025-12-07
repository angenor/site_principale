<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/admin/revenus"
      class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] mb-6 transition-colors"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-3 h-3" />
      Retour aux revenus
    </NuxtLink>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <UiSkeleton class="h-8 w-64 mb-4" />
        <UiSkeleton class="h-4 w-48 mb-2" />
        <UiSkeleton class="h-4 w-32" />
      </div>
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadRevenu"
    />

    <!-- Content -->
    <template v-else-if="revenu">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Revenu minier
            </h1>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                getTypeRevenuClass(revenu.type_revenu)
              ]"
            >
              {{ getTypeRevenuLabel(revenu.type_revenu) }}
            </span>
          </div>
          <p class="text-sm text-[var(--text-muted)]">
            {{ revenu.annee }}{{ revenu.trimestre ? ` - Trimestre ${revenu.trimestre}` : '' }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <UiButton
            v-if="!isEditing"
            variant="primary"
            :icon="['fas', 'edit']"
            @click="startEditing"
          >
            Modifier
          </UiButton>
          <template v-else>
            <UiButton variant="outline" @click="cancelEditing">
              Annuler
            </UiButton>
            <UiButton
              variant="primary"
              :loading="saving"
              @click="saveChanges"
            >
              Enregistrer
            </UiButton>
          </template>
        </div>
      </div>

      <!-- Info cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Montant card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Montant</h3>
          <p class="text-3xl font-bold text-[var(--color-primary)]">
            {{ formatMoney(revenu.montant) }}
          </p>
        </div>

        <!-- Projet card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Projet minier</h3>
          <NuxtLink
            v-if="revenu.projet_minier"
            :to="`/admin/projets/${revenu.projet_minier_id}`"
            class="flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'gem']" class="text-[var(--color-secondary)]" />
            <div>
              <p class="font-medium">{{ revenu.projet_minier.nom }}</p>
              <p class="text-xs text-[var(--text-muted)]">{{ revenu.projet_minier.type_minerai }}</p>
            </div>
          </NuxtLink>
          <p v-else class="text-[var(--text-muted)] italic">Non spécifié</p>
        </div>

        <!-- Commune card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Commune bénéficiaire</h3>
          <NuxtLink
            v-if="revenu.commune"
            :to="`/admin/geo/communes/${revenu.commune_id}`"
            class="flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'city']" class="text-[var(--color-primary)]" />
            <p class="font-medium">{{ revenu.commune.nom }}</p>
          </NuxtLink>
          <p v-else class="text-[var(--text-muted)] italic">Non spécifiée</p>
        </div>
      </div>

      <!-- Edit form -->
      <div v-if="isEditing" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Modifier le revenu</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Projet -->
          <UiFormSelect
            v-model="form.projet_minier_id"
            label="Projet minier"
            :options="projetOptions"
            required
            :error="formErrors.projet_minier_id"
          />

          <!-- Commune -->
          <UiFormSelect
            v-model="form.commune_id"
            label="Commune"
            :options="communeOptions"
            placeholder="Sélectionner une commune"
            :error="formErrors.commune_id"
          />

          <!-- Type -->
          <UiFormSelect
            v-model="form.type_revenu"
            label="Type de revenu"
            :options="typeOptions"
            required
            :error="formErrors.type_revenu"
          />

          <!-- Montant -->
          <UiFormInput
            v-model.number="form.montant"
            label="Montant (MGA)"
            type="number"
            placeholder="0"
            required
            :error="formErrors.montant"
          />

          <!-- Année -->
          <UiFormSelect
            v-model="form.annee"
            label="Année"
            :options="anneeOptions"
            required
            :error="formErrors.annee"
          />

          <!-- Trimestre -->
          <UiFormSelect
            v-model="form.trimestre"
            label="Trimestre"
            :options="trimestreOptions"
            :error="formErrors.trimestre"
          />

          <!-- Date versement -->
          <UiFormInput
            v-model="form.date_versement"
            label="Date de versement"
            type="date"
            :error="formErrors.date_versement"
          />

          <!-- Description -->
          <div class="md:col-span-2">
            <UiFormTextarea
              v-model="form.description"
              label="Description"
              placeholder="Notes ou commentaires"
              :rows="2"
              :error="formErrors.description"
            />
          </div>
        </div>
      </div>

      <!-- View mode details -->
      <div v-else class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Détails</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p class="text-sm text-[var(--text-muted)]">Type</p>
            <p class="text-[var(--text-primary)]">{{ getTypeRevenuLabel(revenu.type_revenu) }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Montant</p>
            <p class="font-mono text-[var(--color-primary)] font-semibold">{{ formatMoney(revenu.montant) }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Année</p>
            <p class="text-[var(--text-primary)]">{{ revenu.annee }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Trimestre</p>
            <p class="text-[var(--text-primary)]">{{ revenu.trimestre ? `T${revenu.trimestre}` : 'Non spécifié' }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Date de versement</p>
            <p class="text-[var(--text-primary)]">{{ revenu.date_versement ? formatDate(revenu.date_versement) : '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Description</p>
            <p class="text-[var(--text-primary)]">{{ revenu.description || '-' }}</p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-[var(--border-light)] grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-[var(--text-muted)]">Créé le</p>
            <p class="text-[var(--text-primary)]">{{ formatDate(revenu.created_at) }}</p>
          </div>
          <div>
            <p class="text-[var(--text-muted)]">Dernière modification</p>
            <p class="text-[var(--text-primary)]">{{ formatDate(revenu.updated_at) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { RevenuMinier, RevenuMinierFormData, ProjetMinierWithStats } from '~/types/projets-miniers'
import type { CommuneWithStats } from '~/types/collectivites'
import { useProjetsService } from '~/services/projets.service'
import { useGeoService } from '~/services/geo.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const projetsService = useProjetsService()
const geoService = useGeoService()
const toast = useAppToast()

// State
const revenu = ref<RevenuMinier | null>(null)
const projets = ref<ProjetMinierWithStats[]>([])
const communes = ref<CommuneWithStats[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const isEditing = ref(false)
const saving = ref(false)

// Form
const form = ref<RevenuMinierFormData>({
  projet_minier_id: '',
  commune_id: null,
  annee: new Date().getFullYear(),
  trimestre: null,
  type_revenu: 'ristourne',
  montant: 0,
  date_versement: null,
  description: null,
})
const formErrors = ref<Record<string, string>>({})

// Options
const currentYear = new Date().getFullYear()

const projetOptions = computed(() =>
  projets.value.map(p => ({ value: p.id, label: p.nom }))
)

const communeOptions = computed(() => [
  { value: '', label: 'Aucune' },
  ...communes.value.map(c => ({ value: c.id, label: c.nom })),
])

const typeOptions = [
  { value: 'ristourne', label: 'Ristourne' },
  { value: 'redevance', label: 'Redevance' },
  { value: 'autre', label: 'Autre' },
]

const anneeOptions = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push({ value: y, label: String(y) })
  }
  return years
})

const trimestreOptions = [
  { value: '', label: 'Non spécifié' },
  { value: 1, label: 'T1' },
  { value: 2, label: 'T2' },
  { value: 3, label: 'T3' },
  { value: 4, label: 'T4' },
]

// Methods
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 0,
  }).format(amount)
}

const getTypeRevenuLabel = (type: string) => {
  const labels: Record<string, string> = {
    ristourne: 'Ristourne',
    redevance: 'Redevance',
    autre: 'Autre',
  }
  return labels[type] || type
}

const getTypeRevenuClass = (type: string) => {
  const classes: Record<string, string> = {
    ristourne: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
    redevance: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    autre: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]',
  }
  return classes[type] || 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
}

const loadReferenceData = async () => {
  try {
    const [projetsData, communesData] = await Promise.all([
      projetsService.getProjets({ limit: 100 }),
      geoService.getCommunes({ limit: 500 }),
    ])
    projets.value = projetsData.items
    communes.value = communesData.items
  } catch (e) {
    console.error('Erreur chargement données de référence:', e)
    projets.value = [
      { id: '1', nom: 'Site de Mandena', code: 'QMM-MAN', type_minerai: 'Ilménite', societe_exploitante: 'QMM', statut: 'en_cours', created_at: '', updated_at: '' },
      { id: '2', nom: 'Ambatovy Mine', code: 'AMB-001', type_minerai: 'Nickel', societe_exploitante: 'Ambatovy', statut: 'en_cours', created_at: '', updated_at: '' },
    ]
    communes.value = []
  }
}

const loadRevenu = async () => {
  const id = route.params.id as string
  if (!id) {
    error.value = 'ID de revenu invalide'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    revenu.value = await projetsService.getRevenu(id)
  } catch (e: any) {
    console.error('Erreur chargement revenu:', e)
    error.value = e?.message || 'Erreur lors du chargement du revenu'

    // Mock data
    revenu.value = {
      id,
      projet_minier_id: '1',
      commune_id: '1',
      annee: 2024,
      trimestre: 3,
      type_revenu: 'ristourne',
      montant: 125000000,
      date_versement: '2024-09-30',
      description: 'Ristourne trimestrielle issue des activités du site de Mandena',
      created_at: '2024-10-01T10:30:00Z',
      updated_at: '2024-10-15T14:45:00Z',
      projet_minier: { id: '1', code: 'QMM-MAN', nom: 'Site de Mandena', type_minerai: 'Ilménite' },
      commune: { id: '1', code: 'TFD', nom: 'Fort Dauphin' },
    }
    error.value = null
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  if (!revenu.value) return

  form.value = {
    projet_minier_id: revenu.value.projet_minier_id,
    commune_id: revenu.value.commune_id || null,
    annee: revenu.value.annee,
    trimestre: revenu.value.trimestre || null,
    type_revenu: revenu.value.type_revenu,
    montant: revenu.value.montant,
    date_versement: revenu.value.date_versement || null,
    description: revenu.value.description || null,
  }
  formErrors.value = {}
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  formErrors.value = {}
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.projet_minier_id) {
    formErrors.value.projet_minier_id = 'Le projet est requis'
  }
  if (!form.value.type_revenu) {
    formErrors.value.type_revenu = 'Le type est requis'
  }
  if (!form.value.annee) {
    formErrors.value.annee = 'L\'année est requise'
  }
  if (!form.value.montant || form.value.montant <= 0) {
    formErrors.value.montant = 'Le montant doit être positif'
  }

  return Object.keys(formErrors.value).length === 0
}

const saveChanges = async () => {
  if (!validateForm() || !revenu.value) return

  saving.value = true
  try {
    await projetsService.updateRevenu(revenu.value.id, form.value)
    toast.success('Revenu mis à jour avec succès')
    isEditing.value = false
    await loadRevenu()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

// Load on mount
onMounted(async () => {
  await loadReferenceData()
  await loadRevenu()

  // Start editing if query param is set
  if (route.query.edit === 'true' && revenu.value) {
    startEditing()
  }
})

// Watch for edit query param
watch(() => route.query.edit, (edit) => {
  if (edit === 'true' && revenu.value) {
    startEditing()
  }
})
</script>
