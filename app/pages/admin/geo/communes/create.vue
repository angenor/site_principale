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

    <!-- Header -->
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Nouvelle commune
      </h1>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">
        Créer une nouvelle commune dans le système
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Informations générales</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Code -->
          <UiFormInput
            v-model="form.code"
            label="Code"
            placeholder="Ex: ANT-001"
            required
            :error="formErrors.code"
            hint="Code unique d'identification"
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
            label="Type de commune"
            :options="[
              { value: 'urbaine', label: 'Commune urbaine' },
              { value: 'rurale', label: 'Commune rurale' },
            ]"
            required
            :error="formErrors.type_commune"
          />

          <!-- Province (for region filtering) -->
          <UiFormSelect
            v-model="selectedProvince"
            label="Province"
            :options="provinceOptions"
            placeholder="Sélectionner une province"
            @update:model-value="handleProvinceChange"
          />

          <!-- Region -->
          <UiFormSelect
            v-model="form.region_id"
            label="Région"
            :options="regionOptions"
            :disabled="!selectedProvince"
            :placeholder="selectedProvince ? 'Sélectionner une région' : 'Sélectionnez d\'abord une province'"
            required
            :error="formErrors.region_id"
          />
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-6">Informations complémentaires</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Population -->
          <UiFormInput
            v-model.number="form.population"
            label="Population"
            type="number"
            placeholder="Nombre d'habitants"
            :error="formErrors.population"
            hint="Optionnel"
          />

          <!-- Superficie -->
          <UiFormInput
            v-model.number="form.superficie_km2"
            label="Superficie (km²)"
            type="number"
            step="0.01"
            placeholder="Surface en km²"
            :error="formErrors.superficie_km2"
            hint="Optionnel"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <UiButton
          type="button"
          variant="outline"
          @click="router.push('/admin/geo/communes')"
        >
          Annuler
        </UiButton>
        <UiButton
          type="submit"
          variant="primary"
          :loading="saving"
          :icon="['fas', 'plus']"
        >
          Créer la commune
        </UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { CommuneFormData, ProvinceWithStats, RegionWithStats } from '~/types/collectivites'
import { useGeoService } from '~/services/geo.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const router = useRouter()
const geoService = useGeoService()
const toast = useToast()

// State
const provinces = ref<ProvinceWithStats[]>([])
const regions = ref<RegionWithStats[]>([])
const selectedProvince = ref<number | null>(null)
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
const provinceOptions = computed(() =>
  provinces.value.map(p => ({ value: p.id, label: p.nom }))
)

const regionOptions = computed(() => {
  if (!selectedProvince.value) return []
  return regions.value
    .filter(r => r.province_id === selectedProvince.value)
    .map(r => ({ value: r.id, label: r.nom }))
})

// Methods
const loadProvinces = async () => {
  try {
    provinces.value = await geoService.getProvinces()
  } catch (e) {
    console.error('Erreur chargement provinces:', e)
    provinces.value = [
      { id: 1, code: 'ANT', nom: 'Antananarivo', nb_regions: 4, nb_communes: 180, created_at: '', updated_at: '' },
      { id: 2, code: 'ANS', nom: 'Antsiranana', nb_regions: 3, nb_communes: 82, created_at: '', updated_at: '' },
      { id: 3, code: 'FIA', nom: 'Fianarantsoa', nb_regions: 4, nb_communes: 200, created_at: '', updated_at: '' },
      { id: 4, code: 'MAH', nom: 'Mahajanga', nb_regions: 4, nb_communes: 125, created_at: '', updated_at: '' },
      { id: 5, code: 'TOA', nom: 'Toamasina', nb_regions: 3, nb_communes: 110, created_at: '', updated_at: '' },
      { id: 6, code: 'TOL', nom: 'Toliara', nb_regions: 4, nb_communes: 153, created_at: '', updated_at: '' },
    ]
  }
}

const loadRegions = async () => {
  try {
    const response = await geoService.getRegions({ limit: 100 })
    regions.value = response.items
  } catch (e) {
    console.error('Erreur chargement régions:', e)
    regions.value = [
      { id: 1, code: 'ANA', nom: 'Analamanga', province_id: 1, nb_communes: 55, created_at: '', updated_at: '' },
      { id: 2, code: 'BON', nom: 'Bongolava', province_id: 1, nb_communes: 25, created_at: '', updated_at: '' },
      { id: 3, code: 'ITA', nom: 'Itasy', province_id: 1, nb_communes: 45, created_at: '', updated_at: '' },
      { id: 4, code: 'VAK', nom: 'Vakinankaratra', province_id: 1, nb_communes: 55, created_at: '', updated_at: '' },
    ]
  }
}

const handleProvinceChange = () => {
  form.value.region_id = 0
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!form.value.code?.trim()) {
    formErrors.value.code = 'Le code est requis'
  } else if (form.value.code.length < 2) {
    formErrors.value.code = 'Le code doit contenir au moins 2 caractères'
  }

  if (!form.value.nom?.trim()) {
    formErrors.value.nom = 'Le nom est requis'
  } else if (form.value.nom.length < 2) {
    formErrors.value.nom = 'Le nom doit contenir au moins 2 caractères'
  }

  if (!form.value.type_commune) {
    formErrors.value.type_commune = 'Le type est requis'
  }

  if (!form.value.region_id) {
    formErrors.value.region_id = 'La région est requise'
  }

  if (form.value.population !== null && form.value.population < 0) {
    formErrors.value.population = 'La population ne peut pas être négative'
  }

  if (form.value.superficie_km2 !== null && form.value.superficie_km2 < 0) {
    formErrors.value.superficie_km2 = 'La superficie ne peut pas être négative'
  }

  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    const newCommune = await geoService.createCommune(form.value)
    toast.success(`Commune "${form.value.nom}" créée avec succès`)
    router.push(`/admin/geo/communes/${newCommune.id}`)
  } catch (e: any) {
    console.error('Erreur création commune:', e)
    toast.error(e?.message || 'Erreur lors de la création de la commune')
  } finally {
    saving.value = false
  }
}

// Load on mount
onMounted(async () => {
  await Promise.all([loadProvinces(), loadRegions()])
})
</script>
