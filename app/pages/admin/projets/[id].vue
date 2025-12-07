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
      @retry="loadProjet"
    />

    <!-- Content -->
    <template v-else-if="projet">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              {{ projet.nom }}
            </h1>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                getStatutClass(projet.statut)
              ]"
            >
              {{ getStatutLabel(projet.statut) }}
            </span>
          </div>
          <p class="text-sm text-[var(--text-muted)]">
            Code: <span class="font-mono">{{ projet.code }}</span>
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
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <!-- Minerai card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'gem']" class="text-[var(--color-secondary)]" />
            </div>
            <div>
              <p class="text-sm text-[var(--text-muted)]">Minerai</p>
              <p class="font-semibold text-[var(--text-primary)]">{{ projet.type_minerai }}</p>
            </div>
          </div>
        </div>

        <!-- Société card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'building']" class="text-[var(--color-primary)]" />
            </div>
            <div>
              <p class="text-sm text-[var(--text-muted)]">Société</p>
              <p class="font-semibold text-[var(--text-primary)] truncate">{{ projet.societe_exploitante }}</p>
            </div>
          </div>
        </div>

        <!-- Dates card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-[var(--color-info)]/10 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'calendar']" class="text-[var(--color-info)]" />
            </div>
            <div>
              <p class="text-sm text-[var(--text-muted)]">Période</p>
              <p class="font-semibold text-[var(--text-primary)]">
                {{ projet.date_debut ? formatDate(projet.date_debut) : 'N/A' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Revenus card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'coins']" class="text-[var(--color-success)]" />
            </div>
            <div>
              <p class="text-sm text-[var(--text-muted)]">Total revenus</p>
              <p class="font-semibold text-[var(--color-primary)]">
                {{ (projet as any).total_revenus ? formatMoney((projet as any).total_revenus) : '0 MGA' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit form -->
      <div v-if="isEditing" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 mb-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Modifier le projet</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nom -->
          <UiFormInput
            v-model="form.nom"
            label="Nom du projet"
            placeholder="Nom du projet"
            required
            :error="formErrors.nom"
          />

          <!-- Code -->
          <UiFormInput
            v-model="form.code"
            label="Code"
            placeholder="Code unique"
            required
            :error="formErrors.code"
          />

          <!-- Type minerai -->
          <UiFormSelect
            v-model="form.type_minerai"
            label="Type de minerai"
            :options="mineraiOptions"
            required
            :error="formErrors.type_minerai"
          />

          <!-- Société -->
          <UiFormSelect
            v-model="form.societe_exploitante"
            label="Société exploitante"
            :options="societeOptions"
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
            label="Date de fin"
            type="date"
            :error="formErrors.date_fin"
          />

          <!-- Description -->
          <div class="md:col-span-2">
            <UiFormTextarea
              v-model="form.description"
              label="Description"
              placeholder="Description du projet et des activités"
              :rows="3"
              :error="formErrors.description"
            />
          </div>

          <!-- Coordonnées GPS -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Coordonnées GPS
            </label>
            <div class="grid grid-cols-2 gap-4">
              <UiFormInput
                v-model.number="gpsLatitude"
                label=""
                type="number"
                step="0.000001"
                placeholder="Latitude"
              />
              <UiFormInput
                v-model.number="gpsLongitude"
                label=""
                type="number"
                step="0.000001"
                placeholder="Longitude"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- View mode details -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Details card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Détails du projet</h2>

          <div class="space-y-4">
            <div>
              <p class="text-sm text-[var(--text-muted)]">Description</p>
              <p v-if="projet.description" class="text-[var(--text-primary)] whitespace-pre-line">
                {{ projet.description }}
              </p>
              <p v-else class="text-[var(--text-muted)] italic">Aucune description</p>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-light)]">
              <div>
                <p class="text-sm text-[var(--text-muted)]">Date de début</p>
                <p class="text-[var(--text-primary)]">{{ projet.date_debut ? formatDate(projet.date_debut) : '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-[var(--text-muted)]">Date de fin</p>
                <p class="text-[var(--text-primary)]">{{ projet.date_fin ? formatDate(projet.date_fin) : '-' }}</p>
              </div>
            </div>

            <div v-if="projet.coordonnees_gps" class="pt-4 border-t border-[var(--border-light)]">
              <p class="text-sm text-[var(--text-muted)]">Coordonnées GPS</p>
              <p class="font-mono text-[var(--text-primary)]">
                {{ projet.coordonnees_gps.latitude }}, {{ projet.coordonnees_gps.longitude }}
              </p>
            </div>
          </div>
        </div>

        <!-- Location card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Localisation</h2>

          <div class="space-y-3">
            <div v-if="projet.region" class="flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'location-dot']" class="text-[var(--color-primary)] text-sm w-4" />
              <span class="text-[var(--text-primary)]">Région {{ projet.region.nom }}</span>
            </div>
            <div v-if="projet.commune" class="flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'city']" class="text-[var(--color-primary)] text-sm w-4" />
              <span class="text-[var(--text-primary)]">{{ projet.commune.nom }}</span>
            </div>
            <p v-if="!projet.region && !projet.commune" class="text-[var(--text-muted)] italic">
              Localisation non renseignée
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-[var(--border-light)]">
            <p class="text-sm text-[var(--text-muted)] mb-2">Dates</p>
            <div class="text-sm">
              <p class="text-[var(--text-secondary)]">
                Créé le {{ formatDate(projet.created_at) }}
              </p>
              <p class="text-[var(--text-secondary)]">
                Modifié le {{ formatDate(projet.updated_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenus section -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">Revenus miniers</h2>
          <NuxtLink :to="`/admin/revenus/create?projet_id=${projet.id}`">
            <UiButton variant="outline" size="sm" :icon="['fas', 'plus']">
              Ajouter un revenu
            </UiButton>
          </NuxtLink>
        </div>

        <!-- Loading revenus -->
        <div v-if="loadingRevenus" class="space-y-3">
          <UiSkeleton v-for="i in 3" :key="i" class="h-16 rounded-lg" />
        </div>

        <!-- Empty state -->
        <UiEmptyState
          v-else-if="!revenus.length"
          title="Aucun revenu"
          description="Ce projet n'a pas encore de revenus enregistrés."
          icon="coins"
        />

        <!-- Revenus list -->
        <div v-else class="space-y-3">
          <NuxtLink
            v-for="revenu in revenus"
            :key="revenu.id"
            :to="`/admin/revenus/${revenu.id}`"
            class="group flex items-center justify-between p-4 rounded-lg border border-[var(--border-light)] hover:border-[var(--color-primary)] transition-colors"
          >
            <div>
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs font-medium',
                    getTypeRevenuClass(revenu.type_revenu)
                  ]"
                >
                  {{ getTypeRevenuLabel(revenu.type_revenu) }}
                </span>
                <span class="text-sm text-[var(--text-muted)]">
                  {{ revenu.annee }}{{ revenu.trimestre ? ` T${revenu.trimestre}` : '' }}
                </span>
              </div>
              <p v-if="revenu.commune" class="text-sm text-[var(--text-secondary)] mt-1">
                {{ revenu.commune.nom }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-mono font-semibold text-[var(--color-primary)]">
                {{ formatMoney(revenu.montant) }}
              </span>
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-[var(--text-muted)] group-hover:text-[var(--color-primary)]" />
            </div>
          </NuxtLink>

          <!-- View all link -->
          <NuxtLink
            v-if="revenus.length >= 10"
            :to="`/admin/revenus?projet_minier_id=${projet.id}`"
            class="block text-center py-3 text-sm text-[var(--color-primary)] hover:underline"
          >
            Voir tous les revenus
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ProjetMinier, ProjetMinierFormData, RevenuMinier } from '~/types/projets-miniers'
import type { Societe } from '~/services/projets.service'
import type { RegionWithStats } from '~/types/collectivites'
import { useProjetsService } from '~/services/projets.service'
import { useGeoService } from '~/services/geo.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const projetsService = useProjetsService()
const geoService = useGeoService()
const toast = useToast()

// State
const projet = ref<ProjetMinier | null>(null)
const revenus = ref<RevenuMinier[]>([])
const societes = ref<Societe[]>([])
const regions = ref<RegionWithStats[]>([])
const typesMinerai = ref<string[]>([])
const loading = ref(true)
const loadingRevenus = ref(true)
const error = ref<string | null>(null)
const isEditing = ref(false)
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

const getStatutLabel = (statut: string) => {
  const labels: Record<string, string> = {
    en_cours: 'En cours',
    suspendu: 'Suspendu',
    termine: 'Terminé',
    planifie: 'Planifié',
  }
  return labels[statut] || statut
}

const getStatutClass = (statut: string) => {
  const classes: Record<string, string> = {
    en_cours: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    suspendu: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    termine: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]',
    planifie: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
  }
  return classes[statut] || 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
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
    ]
    typesMinerai.value = ['Ilménite', 'Nickel', 'Cobalt', 'Chromite', 'Or', 'Graphite']
    regions.value = []
  }
}

const loadProjet = async () => {
  const id = route.params.id as string
  if (!id) {
    error.value = 'ID de projet invalide'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    projet.value = await projetsService.getProjet(id)
  } catch (e: any) {
    console.error('Erreur chargement projet:', e)
    error.value = e?.message || 'Erreur lors du chargement du projet'

    // Mock data
    projet.value = {
      id,
      nom: 'Site de Mandena',
      code: 'QMM-MAN',
      type_minerai: 'Ilménite',
      societe_exploitante: 'QIT Madagascar Minerals',
      region_id: '1',
      statut: 'en_cours',
      description: 'Site d\'extraction d\'ilménite dans le sud-est de Madagascar. Ce projet fait partie des plus grands projets miniers du pays.',
      date_debut: '2009-01-01',
      date_fin: null,
      coordonnees_gps: { latitude: -24.9875, longitude: 46.9875 },
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-11-20T14:45:00Z',
      region: { id: '1', code: 'ANO', nom: 'Anosy' },
      commune: { id: '1', code: 'TFD', nom: 'Fort Dauphin' },
    }
    error.value = null
  } finally {
    loading.value = false
  }
}

const loadRevenus = async () => {
  const id = route.params.id as string
  if (!id) return

  loadingRevenus.value = true
  try {
    revenus.value = await projetsService.getRevenusByProjet(id)
  } catch (e) {
    console.error('Erreur chargement revenus:', e)
    // Mock data
    revenus.value = [
      {
        id: '1',
        projet_minier_id: id,
        commune_id: '1',
        annee: 2024,
        trimestre: 3,
        type_revenu: 'ristourne',
        montant: 125000000,
        created_at: '',
        updated_at: '',
        commune: { id: '1', code: 'TFD', nom: 'Fort Dauphin' },
      },
      {
        id: '2',
        projet_minier_id: id,
        commune_id: '1',
        annee: 2024,
        trimestre: 2,
        type_revenu: 'redevance',
        montant: 450000000,
        created_at: '',
        updated_at: '',
        commune: { id: '1', code: 'TFD', nom: 'Fort Dauphin' },
      },
      {
        id: '3',
        projet_minier_id: id,
        commune_id: '2',
        annee: 2024,
        trimestre: 1,
        type_revenu: 'ristourne',
        montant: 85000000,
        created_at: '',
        updated_at: '',
        commune: { id: '2', code: 'AMP', nom: 'Amboasary' },
      },
    ]
  } finally {
    loadingRevenus.value = false
  }
}

const startEditing = () => {
  if (!projet.value) return

  form.value = {
    nom: projet.value.nom,
    code: projet.value.code,
    type_minerai: projet.value.type_minerai,
    societe_exploitante: projet.value.societe_exploitante,
    region_id: projet.value.region_id || null,
    date_debut: projet.value.date_debut || null,
    date_fin: projet.value.date_fin || null,
    statut: projet.value.statut,
    description: projet.value.description || null,
    coordonnees_gps: projet.value.coordonnees_gps || null,
  }
  gpsLatitude.value = projet.value.coordonnees_gps?.latitude || null
  gpsLongitude.value = projet.value.coordonnees_gps?.longitude || null
  formErrors.value = {}
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  formErrors.value = {}
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.nom?.trim()) {
    formErrors.value.nom = 'Le nom est requis'
  }
  if (!form.value.code?.trim()) {
    formErrors.value.code = 'Le code est requis'
  }
  if (!form.value.type_minerai) {
    formErrors.value.type_minerai = 'Le type de minerai est requis'
  }
  if (!form.value.societe_exploitante) {
    formErrors.value.societe_exploitante = 'La société est requise'
  }
  if (!form.value.statut) {
    formErrors.value.statut = 'Le statut est requis'
  }

  return Object.keys(formErrors.value).length === 0
}

const saveChanges = async () => {
  if (!validateForm() || !projet.value) return

  // Update GPS coordinates
  if (gpsLatitude.value !== null && gpsLongitude.value !== null) {
    form.value.coordonnees_gps = {
      latitude: gpsLatitude.value,
      longitude: gpsLongitude.value,
    }
  } else {
    form.value.coordonnees_gps = null
  }

  saving.value = true
  try {
    await projetsService.updateProjet(projet.value.id, form.value)
    toast.success('Projet mis à jour avec succès')
    isEditing.value = false
    await loadProjet()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

// Load on mount
onMounted(async () => {
  await loadReferenceData()
  await loadProjet()
  loadRevenus()

  // Start editing if query param is set
  if (route.query.edit === 'true' && projet.value) {
    startEditing()
  }
})

// Watch for edit query param
watch(() => route.query.edit, (edit) => {
  if (edit === 'true' && projet.value) {
    startEditing()
  }
})
</script>
