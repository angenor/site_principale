<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/admin/geo/provinces"
      class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] mb-6 transition-colors"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-3 h-3" />
      Retour aux provinces
    </NuxtLink>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <UiSkeleton class="h-8 w-48 mb-2" />
        <UiSkeleton class="h-4 w-32" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiSkeleton v-for="i in 4" :key="i" class="h-32 rounded-xl" />
      </div>
    </div>

    <!-- Error state -->
    <UiErrorState
      v-else-if="error"
      :message="error"
      @retry="loadProvince"
    />

    <!-- Content -->
    <template v-else-if="province">
      <!-- Province header -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="font-heading text-2xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
              Province de {{ province.nom }}
            </h1>
            <p class="mt-1 text-sm text-[var(--text-muted)]">
              Code: <span class="font-mono">{{ province.code }}</span>
            </p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-[var(--color-primary)]">{{ province.nb_regions }}</p>
              <p class="text-xs text-[var(--text-muted)]">Régions</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-[var(--color-secondary)]">{{ province.nb_communes }}</p>
              <p class="text-xs text-[var(--text-muted)]">Communes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Regions header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-[var(--text-primary)]">
          Régions de la province
        </h2>
        <span class="text-sm text-[var(--text-muted)]">
          {{ regions.length }} région(s)
        </span>
      </div>

      <!-- Empty state -->
      <UiEmptyState
        v-if="!regions.length"
        title="Aucune région"
        description="Cette province n'a pas encore de régions enregistrées."
        icon="map"
      />

      <!-- Regions grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="region in regions"
          :key="region.id"
          :to="`/admin/geo/regions/${region.id}`"
          class="group bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-5 hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                {{ region.nom }}
              </h3>
              <span class="text-xs text-[var(--text-muted)] font-mono">
                {{ region.code }}
              </span>
            </div>
            <div class="p-2 rounded-lg bg-[var(--bg-secondary)]">
              <font-awesome-icon :icon="['fas', 'location-dot']" class="text-[var(--color-primary)] text-sm" />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'city']" class="text-[var(--text-muted)] text-xs" />
              <span class="text-sm text-[var(--text-secondary)]">
                {{ region.nb_communes || 0 }} communes
              </span>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-right']"
              class="text-[var(--text-muted)] group-hover:text-[var(--color-primary)] text-xs transition-colors"
            />
          </div>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ProvinceWithStats, RegionWithStats } from '~/types/collectivites'
import { useGeoService } from '~/services/geo.service'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const route = useRoute()
const geoService = useGeoService()

// State
const province = ref<ProvinceWithStats | null>(null)
const regions = ref<RegionWithStats[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Methods
const loadProvince = async () => {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    error.value = 'ID de province invalide'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const [provinceData, regionsData] = await Promise.all([
      geoService.getProvince(id),
      geoService.getProvinceRegions(id),
    ])
    province.value = provinceData
    regions.value = regionsData
  } catch (e: any) {
    console.error('Erreur chargement province:', e)
    error.value = e?.message || 'Erreur lors du chargement de la province'

    // Mock data for development
    const mockProvinces: Record<number, ProvinceWithStats> = {
      1: { id: 1, code: 'ANT', nom: 'Antananarivo', nb_regions: 4, nb_communes: 180, created_at: '', updated_at: '' },
      2: { id: 2, code: 'ANS', nom: 'Antsiranana', nb_regions: 3, nb_communes: 82, created_at: '', updated_at: '' },
      3: { id: 3, code: 'FIA', nom: 'Fianarantsoa', nb_regions: 4, nb_communes: 200, created_at: '', updated_at: '' },
      4: { id: 4, code: 'MAH', nom: 'Mahajanga', nb_regions: 4, nb_communes: 125, created_at: '', updated_at: '' },
      5: { id: 5, code: 'TOA', nom: 'Toamasina', nb_regions: 3, nb_communes: 110, created_at: '', updated_at: '' },
      6: { id: 6, code: 'TOL', nom: 'Toliara', nb_regions: 4, nb_communes: 153, created_at: '', updated_at: '' },
    }

    const mockRegions: Record<number, RegionWithStats[]> = {
      1: [
        { id: 1, code: 'ANA', nom: 'Analamanga', province_id: 1, nb_communes: 55, created_at: '', updated_at: '' },
        { id: 2, code: 'BON', nom: 'Bongolava', province_id: 1, nb_communes: 25, created_at: '', updated_at: '' },
        { id: 3, code: 'ITA', nom: 'Itasy', province_id: 1, nb_communes: 45, created_at: '', updated_at: '' },
        { id: 4, code: 'VAK', nom: 'Vakinankaratra', province_id: 1, nb_communes: 55, created_at: '', updated_at: '' },
      ],
      2: [
        { id: 5, code: 'DIA', nom: 'Diana', province_id: 2, nb_communes: 30, created_at: '', updated_at: '' },
        { id: 6, code: 'SAV', nom: 'Sava', province_id: 2, nb_communes: 52, created_at: '', updated_at: '' },
      ],
      3: [
        { id: 7, code: 'AMO', nom: 'Amoron\'i Mania', province_id: 3, nb_communes: 45, created_at: '', updated_at: '' },
        { id: 8, code: 'HMN', nom: 'Haute Matsiatra', province_id: 3, nb_communes: 55, created_at: '', updated_at: '' },
        { id: 9, code: 'IHO', nom: 'Ihorombe', province_id: 3, nb_communes: 25, created_at: '', updated_at: '' },
        { id: 10, code: 'VVS', nom: 'Vatovavy', province_id: 3, nb_communes: 75, created_at: '', updated_at: '' },
      ],
    }

    province.value = mockProvinces[id] || null
    regions.value = mockRegions[id] || []
    error.value = null
  } finally {
    loading.value = false
  }
}

// Load on mount
onMounted(() => {
  loadProvince()
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadProvince()
})
</script>
