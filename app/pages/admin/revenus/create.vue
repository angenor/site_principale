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

    <!-- Header -->
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Nouveau revenu minier
      </h1>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">
        Enregistrer un nouveau revenu issu d'un projet minier
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Source du revenu</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Projet -->
          <UiFormSelect
            v-model="form.projet_minier_id"
            label="Projet minier"
            :options="projetOptions"
            placeholder="Sélectionner un projet"
            required
            :error="formErrors.projet_minier_id"
          />

          <!-- Commune -->
          <UiFormSelect
            v-model="form.commune_id"
            label="Commune bénéficiaire"
            :options="communeOptions"
            placeholder="Sélectionner une commune"
            :error="formErrors.commune_id"
            hint="Commune qui reçoit ce revenu"
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
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Période</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>

        <div class="mt-6">
          <UiFormTextarea
            v-model="form.description"
            label="Description"
            placeholder="Notes ou commentaires sur ce revenu"
            :rows="2"
            :error="formErrors.description"
          />
        </div>
      </div>

      <!-- Summary card -->
      <div v-if="selectedProjet" class="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'gem']" class="text-[var(--color-secondary)] text-lg" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-[var(--text-primary)]">{{ selectedProjet.nom }}</p>
            <p class="text-sm text-[var(--text-muted)]">
              {{ selectedProjet.type_minerai }} • {{ selectedProjet.societe_exploitante }}
            </p>
          </div>
          <div v-if="form.montant > 0" class="text-right">
            <p class="text-sm text-[var(--text-muted)]">Montant</p>
            <p class="text-lg font-bold text-[var(--color-primary)]">{{ formatMoney(form.montant) }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <UiButton
          type="button"
          variant="outline"
          @click="router.push('/admin/revenus')"
        >
          Annuler
        </UiButton>
        <UiButton
          type="submit"
          variant="primary"
          :loading="saving"
          :icon="['fas', 'plus']"
        >
          Enregistrer le revenu
        </UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { RevenuMinierFormData, ProjetMinierWithStats } from '~/types/projets-miniers'
import type { CommuneWithStats } from '~/types/collectivites'
import { useProjetsService } from '~/services/projets.service'
import { useGeoService } from '~/services/geo.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const projetsService = useProjetsService()
const geoService = useGeoService()
const toast = useToast()

// State
const projets = ref<ProjetMinierWithStats[]>([])
const communes = ref<CommuneWithStats[]>([])
const saving = ref(false)

// Form
const currentYear = new Date().getFullYear()
const form = ref<RevenuMinierFormData>({
  projet_minier_id: '',
  commune_id: null,
  annee: currentYear,
  trimestre: null,
  type_revenu: 'ristourne',
  montant: 0,
  date_versement: null,
  description: null,
})
const formErrors = ref<Record<string, string>>({})

// Computed
const selectedProjet = computed(() =>
  projets.value.find(p => p.id === form.value.projet_minier_id)
)

const projetOptions = computed(() =>
  projets.value.map(p => ({ value: p.id, label: `${p.nom} (${p.type_minerai})` }))
)

const communeOptions = computed(() => [
  { value: '', label: 'Non spécifiée' },
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
  { value: 1, label: 'T1 (Janvier - Mars)' },
  { value: 2, label: 'T2 (Avril - Juin)' },
  { value: 3, label: 'T3 (Juillet - Septembre)' },
  { value: 4, label: 'T4 (Octobre - Décembre)' },
]

// Methods
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 0,
  }).format(amount)
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
      { id: '1', nom: 'Site de Mandena', code: 'QMM-MAN', type_minerai: 'Ilménite', societe_exploitante: 'QIT Madagascar Minerals', statut: 'en_cours', created_at: '', updated_at: '' },
      { id: '2', nom: 'Ambatovy Mine', code: 'AMB-001', type_minerai: 'Nickel', societe_exploitante: 'Ambatovy Minerals', statut: 'en_cours', created_at: '', updated_at: '' },
      { id: '3', nom: 'Bemanevika', code: 'KRA-BEM', type_minerai: 'Chromite', societe_exploitante: 'Kraoma SA', statut: 'en_cours', created_at: '', updated_at: '' },
    ]
    communes.value = []
  }

  // Pre-fill projet if passed via query
  if (route.query.projet_id) {
    form.value.projet_minier_id = route.query.projet_id as string
  }
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.projet_minier_id) {
    formErrors.value.projet_minier_id = 'Le projet minier est requis'
  }

  if (!form.value.type_revenu) {
    formErrors.value.type_revenu = 'Le type de revenu est requis'
  }

  if (!form.value.annee) {
    formErrors.value.annee = 'L\'année est requise'
  }

  if (!form.value.montant || form.value.montant <= 0) {
    formErrors.value.montant = 'Le montant doit être supérieur à 0'
  }

  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    const newRevenu = await projetsService.createRevenu(form.value)
    toast.success('Revenu enregistré avec succès')
    router.push(`/admin/revenus/${newRevenu.id}`)
  } catch (e: any) {
    console.error('Erreur création revenu:', e)
    toast.error(e?.message || 'Erreur lors de l\'enregistrement du revenu')
  } finally {
    saving.value = false
  }
}

// Load on mount
onMounted(() => {
  loadReferenceData()
})
</script>
