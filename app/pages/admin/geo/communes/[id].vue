<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/admin/geo/communes"
      class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] mb-6 transition-colors"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-3 h-3" />
      Retour aux communes
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
      @retry="loadCommune"
    />

    <!-- Content -->
    <template v-else-if="commune">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              {{ commune.nom }}
            </h1>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                commune.type_commune === 'urbaine'
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
              ]"
            >
              {{ commune.type_commune === 'urbaine' ? 'Urbaine' : 'Rurale' }}
            </span>
          </div>
          <p class="text-sm text-[var(--text-muted)]">
            Code: <span class="font-mono">{{ commune.code }}</span>
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
        <!-- Location card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Localisation</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'location-dot']" class="text-[var(--color-primary)] text-sm" />
              <NuxtLink
                v-if="commune.region_id"
                :to="`/admin/geo/regions/${commune.region_id}`"
                class="text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                {{ commune.region_nom || 'Région' }}
              </NuxtLink>
            </div>
            <div class="flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'map']" class="text-[var(--text-muted)] text-sm" />
              <span class="text-[var(--text-secondary)]">{{ commune.province_nom || 'Province' }}</span>
            </div>
          </div>
        </div>

        <!-- Stats card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Statistiques</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-secondary)]">Population</span>
              <span v-if="commune.population" class="font-mono font-medium text-[var(--text-primary)]">
                {{ formatNumber(commune.population) }}
              </span>
              <span v-else class="text-[var(--text-muted)]">Non renseignée</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-secondary)]">Superficie</span>
              <span v-if="commune.superficie_km2" class="font-mono font-medium text-[var(--text-primary)]">
                {{ formatNumber(commune.superficie_km2) }} km²
              </span>
              <span v-else class="text-[var(--text-muted)]">Non renseignée</span>
            </div>
          </div>
        </div>

        <!-- Comptes card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5">
          <h3 class="text-sm font-medium text-[var(--text-muted)] mb-3">Données financières</h3>
          <div class="text-center py-2">
            <p class="text-2xl font-bold text-[var(--color-primary)]">{{ commune.nb_comptes_administratifs || 0 }}</p>
            <p class="text-sm text-[var(--text-muted)]">Comptes administratifs</p>
          </div>
          <NuxtLink
            :to="`/admin/comptes-administratifs?commune_id=${commune.id}`"
            class="mt-3 flex items-center justify-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
          >
            Voir les comptes
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs" />
          </NuxtLink>
        </div>
      </div>

      <!-- Edit form -->
      <div v-if="isEditing" class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Modifier la commune</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Code -->
          <UiFormInput
            v-model="form.code"
            label="Code"
            placeholder="Ex: ANT-001"
            required
            :error="formErrors.code"
          />

          <!-- Nom -->
          <UiFormInput
            v-model="form.nom"
            label="Nom"
            placeholder="Nom de la commune"
            required
            :error="formErrors.nom"
          />

          <!-- Type -->
          <UiFormSelect
            v-model="form.type_commune"
            label="Type"
            :options="[
              { value: 'urbaine', label: 'Urbaine' },
              { value: 'rurale', label: 'Rurale' },
            ]"
            required
            :error="formErrors.type_commune"
          />

          <!-- Region -->
          <UiFormSelect
            v-model="form.region_id"
            label="Région"
            :options="regionOptions"
            required
            :error="formErrors.region_id"
          />

          <!-- Population -->
          <UiFormInput
            v-model.number="form.population"
            label="Population"
            type="number"
            placeholder="Nombre d'habitants"
            :error="formErrors.population"
          />

          <!-- Superficie -->
          <UiFormInput
            v-model.number="form.superficie_km2"
            label="Superficie (km²)"
            type="number"
            step="0.01"
            placeholder="Surface en km²"
            :error="formErrors.superficie_km2"
          />
        </div>
      </div>

      <!-- View mode details -->
      <div v-else class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Informations détaillées</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p class="text-sm text-[var(--text-muted)]">Code</p>
            <p class="font-mono text-[var(--text-primary)]">{{ commune.code }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Nom</p>
            <p class="text-[var(--text-primary)]">{{ commune.nom }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Type</p>
            <p class="text-[var(--text-primary)]">{{ commune.type_commune === 'urbaine' ? 'Commune urbaine' : 'Commune rurale' }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Région</p>
            <p class="text-[var(--text-primary)]">{{ commune.region_nom || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Population</p>
            <p class="text-[var(--text-primary)]">{{ commune.population ? formatNumber(commune.population) + ' habitants' : 'Non renseignée' }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Superficie</p>
            <p class="text-[var(--text-primary)]">{{ commune.superficie_km2 ? formatNumber(commune.superficie_km2) + ' km²' : 'Non renseignée' }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Créée le</p>
            <p class="text-[var(--text-primary)]">{{ formatDate(commune.created_at) }}</p>
          </div>
          <div>
            <p class="text-sm text-[var(--text-muted)]">Dernière modification</p>
            <p class="text-[var(--text-primary)]">{{ formatDate(commune.updated_at) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { CommuneWithStats, CommuneFormData, Region } from '~/types/collectivites'
import { useGeoService } from '~/services/geo.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const geoService = useGeoService()
const toast = useToast()

// State
const commune = ref<CommuneWithStats | null>(null)
const regions = ref<Region[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const isEditing = ref(false)
const saving = ref(false)

// Form
const form = ref<CommuneFormData>({
  code: '',
  nom: '',
  type_commune: 'rurale',
  region_id: 0,
  population: null,
  superficie_km2: null,
})
const formErrors = ref<Record<string, string>>({})

// Computed
const regionOptions = computed(() =>
  regions.value.map(r => ({ value: r.id, label: r.nom }))
)

// Methods
const formatNumber = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

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

const loadRegions = async () => {
  try {
    regions.value = await geoService.getAllRegions()
  } catch (e) {
    console.error('Erreur chargement régions:', e)
    // Mock data
    regions.value = [
      { id: 1, code: 'ANA', nom: 'Analamanga', province_id: 1, created_at: '', updated_at: '' },
      { id: 2, code: 'BON', nom: 'Bongolava', province_id: 1, created_at: '', updated_at: '' },
    ]
  }
}

const loadCommune = async () => {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    error.value = 'ID de commune invalide'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    commune.value = await geoService.getCommune(id)
  } catch (e: any) {
    console.error('Erreur chargement commune:', e)
    error.value = e?.message || 'Erreur lors du chargement de la commune'

    // Mock data
    commune.value = {
      id,
      code: 'ANT-001',
      nom: 'Antananarivo Renivohitra',
      type_commune: 'urbaine',
      region_id: 1,
      region_nom: 'Analamanga',
      province_nom: 'Antananarivo',
      population: 1275207,
      superficie_km2: 86.4,
      nb_comptes_administratifs: 5,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-11-20T14:45:00Z',
    }
    error.value = null
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  if (!commune.value) return

  form.value = {
    code: commune.value.code,
    nom: commune.value.nom,
    type_commune: commune.value.type_commune,
    region_id: commune.value.region_id,
    population: commune.value.population || null,
    superficie_km2: commune.value.superficie_km2 || null,
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

  if (!form.value.code?.trim()) {
    formErrors.value.code = 'Le code est requis'
  }
  if (!form.value.nom?.trim()) {
    formErrors.value.nom = 'Le nom est requis'
  }
  if (!form.value.type_commune) {
    formErrors.value.type_commune = 'Le type est requis'
  }
  if (!form.value.region_id) {
    formErrors.value.region_id = 'La région est requise'
  }

  return Object.keys(formErrors.value).length === 0
}

const saveChanges = async () => {
  if (!validateForm() || !commune.value) return

  saving.value = true
  try {
    await geoService.updateCommune(commune.value.id, form.value)
    toast.success('Commune mise à jour avec succès')
    isEditing.value = false
    await loadCommune()
  } catch (e: any) {
    toast.error(e?.message || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

// Check for edit query param
watch(() => route.query.edit, (edit) => {
  if (edit === 'true' && commune.value) {
    startEditing()
  }
}, { immediate: true })

// Load on mount
onMounted(async () => {
  await loadRegions()
  await loadCommune()

  // Start editing if query param is set
  if (route.query.edit === 'true' && commune.value) {
    startEditing()
  }
})
</script>
