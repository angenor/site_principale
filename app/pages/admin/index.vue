<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="font-heading text-3xl font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Tableau de Bord
      </h1>
      <p class="mt-2 text-[var(--text-secondary)]">
        Vue d'ensemble de la plateforme de suivi des revenus miniers.
      </p>
    </div>

    <!-- KPI Cards -->
    <AdminDashboardKpiCards
      :stats="dashboardStats"
      :loading="statsLoading"
      class="mb-8"
    />

    <!-- Charts and Activity section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Revenue Chart -->
      <div class="lg:col-span-2">
        <AdminDashboardRevenueChart
          :data="revenueData"
          :loading="revenueLoading"
          @period-change="handlePeriodChange"
        />
      </div>

      <!-- Quick Actions -->
      <AdminDashboardQuickActions />
    </div>

    <!-- Recent Activity -->
    <AdminDashboardRecentActivity
      :activities="recentActivities"
      :loading="activitiesLoading"
      class="mb-8"
    />

    <!-- Welcome message for new users -->
    <div class="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-700)] rounded-xl p-6 text-white">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <font-awesome-icon :icon="['fas', 'rocket']" class="text-3xl" />
        </div>
        <div>
          <h3 class="font-heading text-xl font-bold uppercase tracking-wide mb-1">
            Bienvenue, {{ user?.prenom || user?.nom || 'Administrateur' }} !
          </h3>
          <p class="text-white/80">
            Explorez le tableau de bord pour suivre les revenus miniers des collectivités territoriales de Madagascar.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats, ActivityLog } from '~/types'
import { useStatistiquesService } from '../../services'

definePageMeta({
  layout: 'admin',
})

const { user } = useAuth()
const statistiquesService = useStatistiquesService()

// ============================================================================
// DASHBOARD STATS
// ============================================================================

const dashboardStats = ref<DashboardStats | null>(null)
const statsLoading = ref(true)

const loadDashboardStats = async () => {
  statsLoading.value = true
  try {
    dashboardStats.value = await statistiquesService.getDashboardStats()
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
    // Utiliser des données de fallback en cas d'erreur
    dashboardStats.value = {
      communes_avec_donnees: 0,
      communes_total: 1695,
      total_recettes: 0,
      total_depenses: 0,
      projets_miniers_actifs: 0,
      evolution_recettes: 0,
      evolution_depenses: 0,
      evolution_projets: 0,
    }
  } finally {
    statsLoading.value = false
  }
}

// ============================================================================
// REVENUE CHART DATA
// ============================================================================

interface ChartData {
  period: string
  recettes: number
  depenses: number
  revenus_miniers?: number
}

const revenueData = ref<ChartData[]>([])
const revenueLoading = ref(true)
const selectedRevenuePeriod = ref('12m')

const loadRevenueData = async (period: string = '12m') => {
  revenueLoading.value = true
  try {
    // Déterminer le nombre d'années à récupérer
    const annees = period === '6m' ? 1 : period === '12m' ? 1 : 3

    const data = await statistiquesService.getRevenusParAnnee({ annees })

    // Transformer les données pour le graphique
    revenueData.value = data.map((item: { annee: number; total: number; evolution: number }) => ({
      period: String(item.annee),
      recettes: item.total,
      depenses: Math.round(item.total * 0.85), // Estimation des dépenses
      revenus_miniers: Math.round(item.total * 0.15), // Estimation revenus miniers
    }))
  } catch (error) {
    console.error('Erreur lors du chargement des revenus:', error)
    // Données de démonstration en cas d'erreur
    revenueData.value = generateMockRevenueData(period)
  } finally {
    revenueLoading.value = false
  }
}

const handlePeriodChange = (period: string) => {
  selectedRevenuePeriod.value = period
  loadRevenueData(period)
}

// Générer des données de démonstration
const generateMockRevenueData = (period: string): ChartData[] => {
  const months = period === '6m' ? 6 : period === '12m' ? 12 : 36
  const data: ChartData[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })

    data.push({
      period: monthName,
      recettes: Math.round(150000000 + Math.random() * 100000000),
      depenses: Math.round(120000000 + Math.random() * 80000000),
      revenus_miniers: Math.round(20000000 + Math.random() * 30000000),
    })
  }

  return data
}

// ============================================================================
// RECENT ACTIVITIES
// ============================================================================

const recentActivities = ref<ActivityLog[]>([])
const activitiesLoading = ref(true)

const loadRecentActivities = async () => {
  activitiesLoading.value = true
  try {
    recentActivities.value = await statistiquesService.getActiviteRecente({ limite: 5 })
  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error)
    // Données de démonstration
    recentActivities.value = [
      {
        id: '1',
        action: 'create',
        table_name: 'comptes_administratifs',
        description: 'Nouvelle recette ajoutée pour Antananarivo-Renivohitra',
        user_id: '1',
        user_name: 'Jean Rakoto',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        action: 'update',
        table_name: 'comptes_administratifs',
        description: 'Compte administratif 2024 publié pour Toamasina I',
        user_id: '2',
        user_name: 'Marie Rabe',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        action: 'import',
        table_name: 'communes',
        description: 'Import de données Excel - 25 communes',
        user_id: '3',
        user_name: 'Admin',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ]
  } finally {
    activitiesLoading.value = false
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadDashboardStats()
  loadRevenueData(selectedRevenuePeriod.value)
  loadRecentActivities()
})
</script>
