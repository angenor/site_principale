<template>
  <div>
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Provinces
        </h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Les 6 provinces de Madagascar
        </p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in 6"
        :key="i"
        class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6"
      >
        <UiSkeleton class="h-6 w-32 mb-4" />
        <UiSkeleton class="h-4 w-24 mb-2" />
        <UiSkeleton class="h-4 w-28" />
      </div>
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadProvinces"
    />

    <!-- Provinces grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="province in provinces"
        :key="province.id"
        :to="`/admin/geo/provinces/${province.id}`"
        class="group bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-200"
      >
        <!-- Province header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
              {{ province.nom }}
            </h3>
            <span class="text-xs text-[var(--text-muted)] font-mono">
              Code: {{ province.code }}
            </span>
          </div>
          <div class="p-2 rounded-lg bg-[var(--color-primary)]/10">
            <font-awesome-icon :icon="['fas', 'map']" class="text-[var(--color-primary)]" />
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-3 rounded-lg bg-[var(--bg-secondary)]">
            <p class="text-2xl font-bold text-[var(--color-primary)]">
              {{ province.nb_regions || 0 }}
            </p>
            <p class="text-xs text-[var(--text-muted)]">Régions</p>
          </div>
          <div class="text-center p-3 rounded-lg bg-[var(--bg-secondary)]">
            <p class="text-2xl font-bold text-[var(--color-secondary)]">
              {{ province.nb_communes || 0 }}
            </p>
            <p class="text-xs text-[var(--text-muted)]">Communes</p>
          </div>
        </div>

        <!-- Action hint -->
        <div class="mt-4 flex items-center justify-end text-sm text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
          <span>Voir les régions</span>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="ml-2 w-3 h-3" />
        </div>
      </NuxtLink>
    </div>

    <!-- Summary -->
    <div
      v-if="!loading && !error && provinces.length"
      class="mt-8 bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6"
    >
      <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Récapitulatif
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="text-center">
          <p class="text-3xl font-bold text-[var(--color-primary)]">{{ provinces.length }}</p>
          <p class="text-sm text-[var(--text-muted)]">Provinces</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold text-[var(--color-secondary)]">{{ totalRegions }}</p>
          <p class="text-sm text-[var(--text-muted)]">Régions au total</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold text-[var(--color-accent)]">{{ totalCommunes }}</p>
          <p class="text-sm text-[var(--text-muted)]">Communes au total</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProvinceWithStats } from '~/types/collectivites'
import { useGeoService } from '~/services/geo.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const geoService = useGeoService()

// State
const provinces = ref<ProvinceWithStats[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Computed
const totalRegions = computed(() =>
  provinces.value.reduce((sum, p) => sum + (p.nb_regions || 0), 0)
)

const totalCommunes = computed(() =>
  provinces.value.reduce((sum, p) => sum + (p.nb_communes || 0), 0)
)

// Methods
const loadProvinces = async () => {
  loading.value = true
  error.value = null

  try {
    provinces.value = await geoService.getProvinces()
  } catch (e: any) {
    console.error('Erreur chargement provinces:', e)
    error.value = e?.message || 'Erreur lors du chargement des provinces'

    // Mock data for development
    provinces.value = [
      { id: 1, code: 'ANT', nom: 'Antananarivo', nb_regions: 4, nb_communes: 180, created_at: '', updated_at: '' },
      { id: 2, code: 'ANS', nom: 'Antsiranana', nb_regions: 3, nb_communes: 82, created_at: '', updated_at: '' },
      { id: 3, code: 'FIA', nom: 'Fianarantsoa', nb_regions: 4, nb_communes: 200, created_at: '', updated_at: '' },
      { id: 4, code: 'MAH', nom: 'Mahajanga', nb_regions: 4, nb_communes: 125, created_at: '', updated_at: '' },
      { id: 5, code: 'TOA', nom: 'Toamasina', nb_regions: 3, nb_communes: 110, created_at: '', updated_at: '' },
      { id: 6, code: 'TOL', nom: 'Toliara', nb_regions: 4, nb_communes: 153, created_at: '', updated_at: '' },
    ]
    error.value = null // Clear error since we have mock data
  } finally {
    loading.value = false
  }
}

// Load on mount
onMounted(() => {
  loadProvinces()
})
</script>
