<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/admin/projets"
      class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] mb-6 transition-colors"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-3 h-3" />
      Retour aux projets
    </NuxtLink>

    <!-- Header -->
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Nouveau projet minier
      </h1>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">
        Enregistrer un nouveau projet d'exploitation minière
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Informations générales</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nom -->
          <UiFormInput
            v-model="form.nom"
            label="Nom du projet"
            placeholder="Ex: Site de Mandena"
            required
            :error="formErrors.nom"
          />

          <!-- Code -->
          <UiFormInput
            v-model="form.code"
            label="Code"
            placeholder="Ex: QMM-MAN"
            required
            hint="Code unique d'identification"
            :error="formErrors.code"
          />

          <!-- Type minerai -->
          <UiFormSelect
            v-model="form.type_minerai"
            label="Type de minerai"
            :options="mineraiOptions"
            placeholder="Sélectionner un type"
            required
            :error="formErrors.type_minerai"
          />

          <!-- Société -->
          <UiFormSelect
            v-model="form.societe_exploitante"
            label="Société exploitante"
            :options="societeOptions"
            placeholder="Sélectionner une société"
            required
            :error="formErrors.societe_exploitante"
          />

          <!-- Statut -->
          <UiFormSelect
            v-model="form.statut"
            label="Statut"
            :options="statutOptions"
            required
            :error="formErrors.statut"
          />

          <!-- Région -->
          <UiFormSelect
            v-model="form.region_id"
            label="Région"
            :options="regionOptions"
            placeholder="Sélectionner une région"
            :error="formErrors.region_id"
          />

          <!-- Description -->
          <div class="md:col-span-2">
            <UiFormTextarea
              v-model="form.description"
              label="Description"
              placeholder="Description du projet minier et des activités"
              :rows="3"
              :error="formErrors.description"
            />
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Dates et localisation</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Date début -->
          <UiFormInput
            v-model="form.date_debut"
            label="Date de début"
            type="date"
            :error="formErrors.date_debut"
          />

          <!-- Date fin -->
          <UiFormInput
            v-model="form.date_fin"
            label="Date de fin (prévue)"
            type="date"
            :error="formErrors.date_fin"
          />

          <!-- Coordonnées GPS -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Coordonnées GPS <span class="text-[var(--text-muted)] font-normal">(optionnel)</span>
            </label>
            <div class="grid grid-cols-2 gap-4">
              <UiFormInput
                v-model.number="gpsLatitude"
                label=""
                type="number"
                step="0.000001"
                placeholder="Latitude (ex: -24.9875)"
              />
              <UiFormInput
                v-model.number="gpsLongitude"
                label=""
                type="number"
                step="0.000001"
                placeholder="Longitude (ex: 46.9875)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <UiButton
          type="button"
          variant="outline"
          @click="router.push('/admin/projets')"
        >
          Annuler
        </UiButton>
        <UiButton
          type="submit"
          variant="primary"
          :loading="saving"
          :icon="['fas', 'plus']"
        >
          Créer le projet
        </UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ProjetMinierFormData } from '~/types/projets-miniers'
import type { Societe } from '~/services/projets.service'
import type { RegionWithStats } from '~/types/collectivites'
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
const toast = useAppToast()

// State
const societes = ref<Societe[]>([])
const regions = ref<RegionWithStats[]>([])
const typesMinerai = ref<string[]>([])
const saving = ref(false)

// Form
const form = ref<ProjetMinierFormData>({
  nom: '',
  code: '',
  type_minerai: '',
  societe_exploitante: '',
  region_id: null,
  date_debut: null,
  date_fin: null,
  statut: 'planifie',
  description: null,
  coordonnees_gps: null,
})
const formErrors = ref<Record<string, string>>({})
const gpsLatitude = ref<number | null>(null)
const gpsLongitude = ref<number | null>(null)

// Options
const statutOptions = [
  { value: 'planifie', label: 'Planifié' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'suspendu', label: 'Suspendu' },
  { value: 'termine', label: 'Terminé' },
]

const societeOptions = computed(() =>
  societes.value.map(s => ({ value: s.nom, label: s.nom }))
)

const mineraiOptions = computed(() =>
  typesMinerai.value.map(t => ({ value: t, label: t }))
)

const regionOptions = computed(() => [
  { value: '', label: 'Aucune' },
  ...regions.value.map(r => ({ value: r.id, label: r.nom })),
])

// Methods
const loadReferenceData = async () => {
  try {
    const [societesData, typesData, regionsData] = await Promise.all([
      projetsService.getAllSocietes(),
      projetsService.getTypesMinerai(),
      geoService.getRegions({ limit: 100 }),
    ])
    societes.value = societesData
    typesMinerai.value = typesData
    regions.value = regionsData.items
  } catch (e) {
    console.error('Erreur chargement données de référence:', e)
    societes.value = [
      { id: '1', nom: 'QIT Madagascar Minerals', code: 'QMM', created_at: '', updated_at: '' },
      { id: '2', nom: 'Ambatovy Minerals', code: 'AMB', created_at: '', updated_at: '' },
      { id: '3', nom: 'Kraoma SA', code: 'KRA', created_at: '', updated_at: '' },
      { id: '4', nom: 'Toliara Sands', code: 'TLS', created_at: '', updated_at: '' },
    ]
    typesMinerai.value = ['Ilménite', 'Nickel', 'Cobalt', 'Chromite', 'Or', 'Graphite', 'Saphir', 'Rubis']
    regions.value = []
  }

  // Pre-fill societe if passed via query
  if (route.query.societe_id) {
    const societe = societes.value.find(s => s.id === route.query.societe_id)
    if (societe) {
      form.value.societe_exploitante = societe.nom
    }
  }
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.nom?.trim()) {
    formErrors.value.nom = 'Le nom est requis'
  } else if (form.value.nom.length < 2) {
    formErrors.value.nom = 'Le nom doit contenir au moins 2 caractères'
  }

  if (!form.value.code?.trim()) {
    formErrors.value.code = 'Le code est requis'
  } else if (form.value.code.length < 2) {
    formErrors.value.code = 'Le code doit contenir au moins 2 caractères'
  }

  if (!form.value.type_minerai) {
    formErrors.value.type_minerai = 'Le type de minerai est requis'
  }

  if (!form.value.societe_exploitante) {
    formErrors.value.societe_exploitante = 'La société exploitante est requise'
  }

  if (!form.value.statut) {
    formErrors.value.statut = 'Le statut est requis'
  }

  // Validate dates
  if (form.value.date_debut && form.value.date_fin) {
    if (new Date(form.value.date_fin) < new Date(form.value.date_debut)) {
      formErrors.value.date_fin = 'La date de fin doit être après la date de début'
    }
  }

  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  // Update GPS coordinates
  if (gpsLatitude.value !== null && gpsLongitude.value !== null) {
    form.value.coordonnees_gps = {
      latitude: gpsLatitude.value,
      longitude: gpsLongitude.value,
    }
  }

  saving.value = true
  try {
    const newProjet = await projetsService.createProjet(form.value)
    toast.success(`Projet "${form.value.nom}" créé avec succès`)
    router.push(`/admin/projets/${newProjet.id}`)
  } catch (e: any) {
    console.error('Erreur création projet:', e)
    toast.error(e?.message || 'Erreur lors de la création du projet')
  } finally {
    saving.value = false
  }
}

// Load on mount
onMounted(() => {
  loadReferenceData()
})
</script>
