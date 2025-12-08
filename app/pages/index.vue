<script setup lang="ts">
import type { DashboardStats } from '~/types'

// Métadonnées de la page
useHead({
  title: 'Plateforme de Suivi des Revenus Miniers - Accueil',
  meta: [
    {
      name: 'description',
      content: 'Plateforme de suivi de l\'utilisation des revenus miniers des collectivités territoriales à Madagascar'
    }
  ]
})

const statistiquesService = useStatistiquesService()

// États
const showScrollTop = ref(false)
const isLoadingStats = ref(true)
const dashboardStats = ref<DashboardStats | null>(null)

// Charger les statistiques
const loadStats = async () => {
  isLoadingStats.value = true
  try {
    dashboardStats.value = await statistiquesService.getDashboardStats()
  } catch (err: any) {
    console.error('Erreur lors du chargement des statistiques:', err)
  } finally {
    isLoadingStats.value = false
  }
}

// Formatage des montants
const formatMontant = (value: number | undefined): string => {
  if (!value) return '0'
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + ' Mrd'
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + ' M'
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + ' K'
  }
  return value.toLocaleString('fr-FR')
}

// Gestion du scroll to top
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadStats()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Hero Section avec recherche intégrée -->
    <HeroSection />

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <!-- Section Statistiques -->
      <section v-if="dashboardStats || isLoadingStats" class="py-8">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center flex items-center justify-center gap-3">
          <font-awesome-icon :icon="['fas', 'chart-bar']" class="text-blue-600 dark:text-blue-400" />
          <span>Statistiques de la plateforme</span>
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Communes avec données -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Communes avec données</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  <template v-if="isLoadingStats">
                    <span class="inline-block w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                  </template>
                  <template v-else>
                    {{ dashboardStats?.communes_avec_donnees || 0 }}
                    <span class="text-sm font-normal text-gray-500">/ {{ dashboardStats?.communes_total || 0 }}</span>
                  </template>
                </p>
              </div>
              <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <font-awesome-icon :icon="['fas', 'city']" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div v-if="!isLoadingStats && dashboardStats?.communes_total" class="mt-4">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  :style="{ width: `${(dashboardStats.communes_avec_donnees / dashboardStats.communes_total) * 100}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ Math.round((dashboardStats.communes_avec_donnees / dashboardStats.communes_total) * 100) }}% de couverture
              </p>
            </div>
          </div>

          <!-- Total Recettes -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Recettes</p>
                <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  <template v-if="isLoadingStats">
                    <span class="inline-block w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                  </template>
                  <template v-else>
                    {{ formatMontant(dashboardStats?.total_recettes) }}
                    <span class="text-sm font-normal">Ar</span>
                  </template>
                </p>
              </div>
              <div class="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <font-awesome-icon :icon="['fas', 'arrow-trend-up']" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div v-if="!isLoadingStats && dashboardStats?.evolution_recettes" class="mt-4 flex items-center gap-1">
              <font-awesome-icon
                :icon="['fas', dashboardStats.evolution_recettes >= 0 ? 'arrow-up' : 'arrow-down']"
                :class="dashboardStats.evolution_recettes >= 0 ? 'text-green-500' : 'text-red-500'"
                class="w-3 h-3"
              />
              <span :class="dashboardStats.evolution_recettes >= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm font-medium">
                {{ Math.abs(dashboardStats.evolution_recettes).toFixed(1) }}%
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">vs année précédente</span>
            </div>
          </div>

          <!-- Total Dépenses -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Dépenses</p>
                <p class="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  <template v-if="isLoadingStats">
                    <span class="inline-block w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                  </template>
                  <template v-else>
                    {{ formatMontant(dashboardStats?.total_depenses) }}
                    <span class="text-sm font-normal">Ar</span>
                  </template>
                </p>
              </div>
              <div class="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                <font-awesome-icon :icon="['fas', 'arrow-trend-down']" class="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div v-if="!isLoadingStats && dashboardStats?.evolution_depenses" class="mt-4 flex items-center gap-1">
              <font-awesome-icon
                :icon="['fas', dashboardStats.evolution_depenses >= 0 ? 'arrow-up' : 'arrow-down']"
                :class="dashboardStats.evolution_depenses <= 0 ? 'text-green-500' : 'text-red-500'"
                class="w-3 h-3"
              />
              <span :class="dashboardStats.evolution_depenses <= 0 ? 'text-green-500' : 'text-red-500'" class="text-sm font-medium">
                {{ Math.abs(dashboardStats.evolution_depenses).toFixed(1) }}%
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">vs année précédente</span>
            </div>
          </div>

          <!-- Comptes administratifs -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Comptes Administratifs</p>
                <p class="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  <template v-if="isLoadingStats">
                    <span class="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                  </template>
                  <template v-else>
                    {{ dashboardStats?.total_comptes_administratifs || 0 }}
                  </template>
                </p>
              </div>
              <div class="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div v-if="!isLoadingStats && dashboardStats?.comptes_par_statut" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="(count, statut) in dashboardStats.comptes_par_statut"
                :key="statut"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300': statut === 'brouillon',
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': statut === 'valide',
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': statut === 'publie',
                }"
              >
                {{ count }} {{ statut }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section informations complémentaires -->
      <section class="grid md:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-800 dark:text-white">Transparence</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Accédez librement aux informations financières des collectivités bénéficiaires des revenus miniers.
          </p>
        </div>

        <!-- Card 2 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-800 dark:text-white">Redevabilité</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Suivez l'utilisation des fonds publics et l'exécution budgétaire en temps réel.
          </p>
        </div>

        <!-- Card 3 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-800 dark:text-white">Accessibilité</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Données ouvertes, téléchargeables et facilement exploitables pour tous les citoyens.
          </p>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 dark:bg-gray-950 text-white mt-16 print:hidden transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="font-bold text-lg mb-3">À propos</h3>
            <p class="text-gray-300 dark:text-gray-400 text-sm">
              Projet "Minerais critiques : justice fiscale et redistribution de revenus"
              mené par PCQVP Madagascar et TI Madagascar.
            </p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-3">Contact</h3>
            <p class="text-gray-300 dark:text-gray-400 text-sm">
              Email: vramaherison@transparency.mg<br>
              Transparency International - Initiative Madagascar
            </p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-3">Ressources</h3>
            <p class="text-gray-300 dark:text-gray-400 text-sm">
              Plateforme de suivi des revenus miniers<br>
              Collectivités Territoriales de Madagascar
            </p>
          </div>
        </div>
        <div class="border-t border-gray-700 dark:border-gray-800 mt-8 pt-6 text-center text-gray-400 dark:text-gray-500 text-sm">
          <p>&copy; {{ new Date().getFullYear() }} PCQVP Madagascar. Tous droits réservés.</p>
        </div>
      </div>
    </footer>

    <!-- Bouton scroll to top -->
    <Transition name="fade">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition print:hidden z-50"
        aria-label="Retour en haut"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* Print styles */
@media print {
  .print\:hidden {
    display: none !important;
  }

  body {
    background: white;
  }

  main {
    max-width: 100%;
    padding: 0;
  }
}
</style>
