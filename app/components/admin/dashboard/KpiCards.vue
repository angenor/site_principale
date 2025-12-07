<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
    <UiStatCard
      label="Communes avec données"
      :value="stats?.communes_avec_donnees || 0"
      :suffix="`/ ${stats?.communes_total || 0}`"
      :icon="['fas', 'city']"
      icon-variant="primary"
      trend-label="vs année dernière"
      :loading="loading"
      :progress="progressCommunes"
      progress-label="Couverture"
      progress-variant="primary"
    />

    <UiStatCard
      label="Total Recettes"
      :value="stats?.total_recettes || 0"
      suffix="Ar"
      format="currency"
      :icon="['fas', 'arrow-trend-up']"
      icon-variant="success"
      :trend="stats?.evolution_recettes"
      :loading="loading"
    />

    <UiStatCard
      label="Total Dépenses"
      :value="stats?.total_depenses || 0"
      suffix="Ar"
      format="currency"
      :icon="['fas', 'arrow-trend-down']"
      icon-variant="error"
      :trend="stats?.evolution_depenses"
      :trend-inverted="true"
      :loading="loading"
    />

    <UiStatCard
      label="Projets Miniers Actifs"
      :value="stats?.projets_miniers_actifs || 0"
      :icon="['fas', 'gem']"
      icon-variant="warning"
      :trend="stats?.evolution_projets"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats } from '~/types'

interface Props {
  stats: DashboardStats | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// Progress for communes coverage
const progressCommunes = computed(() => {
  if (!props.stats?.communes_total) return 0
  return Math.round((props.stats.communes_avec_donnees / props.stats.communes_total) * 100)
})
</script>
