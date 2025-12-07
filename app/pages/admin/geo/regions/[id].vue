<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/admin/geo/regions"
      class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] mb-6 transition-colors"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-3 h-3" />
      Retour aux régions
    </NuxtLink>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <UiSkeleton class="h-8 w-48 mb-2" />
        <UiSkeleton class="h-4 w-32" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiSkeleton v-for="i in 6" :key="i" class="h-24 rounded-xl" />
      </div>
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadRegion"
    />

    <!-- Content -->
    <template v-else-if="region">
      <!-- Region header -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
                Région {{ region.nom }}
              </h1>
              <span class="px-2 py-1 rounded-full text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-mono">
                {{ region.code }}
              </span>
            </div>
            <NuxtLink
              v-if="region.province_nom"
              :to="`/admin/geo/provinces/${region.province_id}`"
              class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'map']" class="text-xs" />
              Province de {{ region.province_nom }}
            </NuxtLink>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-center">
              <p class="text-3xl font-bold text-[var(--color-primary)]">{{ region.nb_communes || 0 }}</p>
              <p class="text-xs text-[var(--text-muted)]">Communes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Communes filter -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">
            Communes de la région
          </h2>
          <div class="flex items-center gap-2">
            <button
              :class="[
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                !typeFilter ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]'
              ]"
              @click="typeFilter = null"
            >
              Toutes
            </button>
            <button
              :class="[
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                typeFilter === 'urbaine' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]'
              ]"
              @click="typeFilter = 'urbaine'"
            >
              Urbaines
            </button>
            <button
              :class="[
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                typeFilter === 'rurale' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]'
              ]"
              @click="typeFilter = 'rurale'"
            >
              Rurales
            </button>
          </div>
        </div>
        <div class="w-64">
          <UiFormInput
            v-model="searchQuery"
            placeholder="Rechercher une commune..."
            :icon="['fas', 'magnifying-glass']"
          />
        </div>
      </div>

      <!-- Empty state -->
      <UiEmptyState
        v-if="!filteredCommunes.length"
        title="Aucune commune"
        :description="hasFilters ? 'Aucune commune ne correspond à vos critères.' : 'Cette région n\'a pas encore de communes enregistrées.'"
        icon="city"
      />

      <!-- Communes grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <NuxtLink
          v-for="commune in filteredCommunes"
          :key="commune.id"
          :to="`/admin/geo/communes/${commune.id}`"
          class="group bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="font-medium text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                {{ commune.nom }}
              </h3>
              <span class="text-xs text-[var(--text-muted)] font-mono">
                {{ commune.code }}
              </span>
            </div>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-xs',
                commune.type_commune === 'urbaine'
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
              ]"
            >
              {{ commune.type_commune === 'urbaine' ? 'Urbaine' : 'Rurale' }}
            </span>
          </div>

          <div class="flex items-center justify-between text-sm text-[var(--text-muted)]">
            <div v-if="commune.population" class="flex items-center gap-1">
              <font-awesome-icon :icon="['fas', 'users']" class="text-xs" />
              {{ formatNumber(commune.population) }} hab.
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-right']"
              class="text-xs group-hover:text-[var(--color-primary)] transition-colors"
            />
          </div>
        </NuxtLink>
      </div>

      <!-- Summary -->
      <div class="mt-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-[var(--text-muted)]">
            {{ filteredCommunes.length }} commune(s) affichée(s)
          </span>
          <div class="flex items-center gap-4">
            <span class="text-[var(--text-secondary)]">
              <span class="font-medium text-[var(--color-primary)]">{{ communesUrbaines }}</span> urbaines
            </span>
            <span class="text-[var(--text-secondary)]">
              <span class="font-medium text-[var(--color-success)]">{{ communesRurales }}</span> rurales
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { RegionWithStats, CommuneWithStats } from '~/types/collectivites'
import { useGeoService } from '~/services/geo.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const geoService = useGeoService()

// State
const region = ref<RegionWithStats | null>(null)
const communes = ref<CommuneWithStats[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const typeFilter = ref<'urbaine' | 'rurale' | null>(null)

// Computed
const filteredCommunes = computed(() => {
  let result = communes.value

  if (typeFilter.value) {
    result = result.filter(c => c.type_commune === typeFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.nom.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
    )
  }

  return result
})

const hasFilters = computed(() => typeFilter.value !== null || searchQuery.value !== '')

const communesUrbaines = computed(() =>
  communes.value.filter(c => c.type_commune === 'urbaine').length
)

const communesRurales = computed(() =>
  communes.value.filter(c => c.type_commune === 'rurale').length
)

// Methods
const formatNumber = (n: number) => {
  return new Intl.NumberFormat('fr-FR').format(n)
}

const loadRegion = async () => {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    error.value = 'ID de région invalide'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const [regionData, communesData] = await Promise.all([
      geoService.getRegion(id),
      geoService.getRegionCommunes(id),
    ])
    region.value = regionData
    communes.value = communesData
  } catch (e: any) {
    console.error('Erreur chargement région:', e)
    error.value = e?.message || 'Erreur lors du chargement de la région'

    // Mock data
    region.value = {
      id,
      code: 'ANA',
      nom: 'Analamanga',
      province_id: 1,
      province_nom: 'Antananarivo',
      nb_communes: 12,
      created_at: '',
      updated_at: '',
    }

    communes.value = [
      { id: 1, code: 'ANT-001', nom: 'Antananarivo Renivohitra', type_commune: 'urbaine', region_id: id, population: 1275207, created_at: '', updated_at: '' },
      { id: 2, code: 'ANT-002', nom: 'Ambohidratrimo', type_commune: 'urbaine', region_id: id, population: 45000, created_at: '', updated_at: '' },
      { id: 3, code: 'ANT-003', nom: 'Andramasina', type_commune: 'rurale', region_id: id, population: 28000, created_at: '', updated_at: '' },
      { id: 4, code: 'ANT-004', nom: 'Anjozorobe', type_commune: 'rurale', region_id: id, population: 32000, created_at: '', updated_at: '' },
      { id: 5, code: 'ANT-005', nom: 'Ankazobe', type_commune: 'rurale', region_id: id, population: 25000, created_at: '', updated_at: '' },
      { id: 6, code: 'ANT-006', nom: 'Manjakandriana', type_commune: 'rurale', region_id: id, population: 18000, created_at: '', updated_at: '' },
      { id: 7, code: 'ANT-007', nom: 'Tana Atsimondrano', type_commune: 'urbaine', region_id: id, population: 85000, created_at: '', updated_at: '' },
      { id: 8, code: 'ANT-008', nom: 'Tana Avaradrano', type_commune: 'urbaine', region_id: id, population: 72000, created_at: '', updated_at: '' },
      { id: 9, code: 'ANT-009', nom: 'Arivonimamo', type_commune: 'rurale', region_id: id, population: 22000, created_at: '', updated_at: '' },
      { id: 10, code: 'ANT-010', nom: 'Miarinarivo', type_commune: 'rurale', region_id: id, population: 15000, created_at: '', updated_at: '' },
      { id: 11, code: 'ANT-011', nom: 'Soavinandriana', type_commune: 'rurale', region_id: id, population: 12000, created_at: '', updated_at: '' },
      { id: 12, code: 'ANT-012', nom: 'Tsiroanomandidy', type_commune: 'rurale', region_id: id, population: 18000, created_at: '', updated_at: '' },
    ]
    error.value = null
  } finally {
    loading.value = false
  }
}

// Load on mount
onMounted(() => {
  loadRegion()
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadRegion()
})
</script>
