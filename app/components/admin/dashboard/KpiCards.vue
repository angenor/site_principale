<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
    <UiStatCard
      label="Communes avec données"
      :value="stats?.communes_avec_donnees || 0"
      :suffix="`/ ${stats?.total_communes || 0}`"
      :icon="['fas', 'city']"
      icon-variant="primary"
      :trend="stats?.evolution_communes"
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
      :value="stats?.projets_actifs || 0"
      :icon="['fas', 'gem']"
      icon-variant="warning"
      :trend="stats?.evolution_projets"
      :loading="loading"
      :description="stats?.total_revenus_miniers ? `${formatCurrency(stats.total_revenus_miniers)} Ar de revenus` : undefined"
    />
  </div>
</template>

<script setup lang="ts">
interface DashboardKpis {
  communes_avec_donnees: number
  total_communes: number
  evolution_communes?: number
  total_recettes: number
  evolution_recettes?: number
  total_depenses: number
  evolution_depenses?: number
  projets_actifs: number
  evolution_projets?: number
  total_revenus_miniers?: number
}

interface Props {
  stats: DashboardKpis | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// Progress for communes coverage
const progressCommunes = computed(() => {
  if (!props.stats?.total_communes) return 0
  return Math.round((props.stats.communes_avec_donnees / props.stats.total_communes) * 100)
})

// Format currency
const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} Mrd`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)} K`
  }
  return String(value)
}
</script>
