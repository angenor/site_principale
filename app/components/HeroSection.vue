<script setup lang="ts">
import type { ProvinceWithStats, RegionWithStats, CommuneWithStats } from '~/types/collectivites'

const emit = defineEmits<{
  search: [communeId: string, annee: number]
}>()

const geoService = useGeoService()
const { isDark } = useDarkMode()

// Logo dynamique basé sur le thème
const logoSrc = computed(() => {
  return isDark.value
    ? '/images/logos/logo_fond_noire_texte_blanc.jpeg'
    : '/images/logos/logo_fond_noire_texte_bleu.jpeg'
})

// États de chargement
const isLoadingProvinces = ref(true)
const isLoadingRegions = ref(false)
const isLoadingCommunes = ref(false)
const error = ref<string | null>(null)

// Données
const provinces = ref<ProvinceWithStats[]>([])
const regions = ref<RegionWithStats[]>([])
const communes = ref<CommuneWithStats[]>([])

// Sélections
const selectedProvince = ref<number | ''>('')
const selectedRegion = ref<number | ''>('')
const selectedCommune = ref<number | ''>('')
const selectedAnnee = ref<number>(new Date().getFullYear())

// Années disponibles
const annees = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

// Statistiques totales
const totalProvinces = computed(() => provinces.value.length)
const totalRegions = computed(() => provinces.value.reduce((sum, p) => sum + (p.nb_regions || 0), 0))
const totalCommunes = computed(() => provinces.value.reduce((sum, p) => sum + (p.nb_communes || 0), 0))

// Compteurs pour les labels
const totalRegionsForProvince = computed(() => {
  if (!selectedProvince.value) return 0
  const province = provinces.value.find(p => p.id === selectedProvince.value)
  return province?.nb_regions || regions.value.length
})

const totalCommunesForProvince = computed(() => {
  if (!selectedProvince.value) return 0
  const province = provinces.value.find(p => p.id === selectedProvince.value)
  return province?.nb_communes || 0
})

const totalCommunesForRegion = computed(() => {
  if (!selectedRegion.value) return 0
  const region = regions.value.find(r => r.id === selectedRegion.value)
  return region?.nb_communes || communes.value.length
})

// Charger les provinces au démarrage
const loadProvinces = async () => {
  isLoadingProvinces.value = true
  error.value = null
  try {
    provinces.value = await geoService.getProvinces()
  } catch (err: any) {
    console.error('Erreur lors du chargement des provinces:', err)
    error.value = 'Impossible de charger les provinces'
  } finally {
    isLoadingProvinces.value = false
  }
}

// Charger les régions d'une province
const loadRegions = async (provinceId: number) => {
  isLoadingRegions.value = true
  try {
    regions.value = await geoService.getProvinceRegions(provinceId)
  } catch (err: any) {
    console.error('Erreur lors du chargement des régions:', err)
    regions.value = []
  } finally {
    isLoadingRegions.value = false
  }
}

// Charger les communes d'une région
const loadCommunes = async (regionId: number) => {
  isLoadingCommunes.value = true
  try {
    communes.value = await geoService.getRegionCommunes(regionId)
  } catch (err: any) {
    console.error('Erreur lors du chargement des communes:', err)
    communes.value = []
  } finally {
    isLoadingCommunes.value = false
  }
}

// Réinitialiser les sélections en cascade
watch(selectedProvince, async (newVal) => {
  selectedRegion.value = ''
  selectedCommune.value = ''
  regions.value = []
  communes.value = []

  if (newVal) {
    await loadRegions(newVal)
  }
})

watch(selectedRegion, async (newVal) => {
  selectedCommune.value = ''
  communes.value = []

  if (newVal) {
    await loadCommunes(newVal)
  }
})

// Fonction de recherche avec redirection
const handleSearch = async () => {
  if (!selectedCommune.value) {
    alert('Veuillez sélectionner une commune')
    return
  }

  // Navigation vers la page du compte administratif avec transition
  await navigateTo({
    path: '/compte-administratif',
    query: {
      commune: selectedCommune.value,
      annee: selectedAnnee.value
    }
  })
}

// Charger les données au montage
onMounted(() => {
  loadProvinces()
})
</script>

<template>
  <section class="relative min-h-[600px] pt-20 lg:min-h-[700px] flex items-center overflow-hidden">
    <!-- Logo en haut à gauche -->
    <div class="absolute top-6 left-6 z-30">
      <div class="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
        <img
          :src="logoSrc"
          :key="logoSrc"
          alt="TI Madagascar"
          class="h-12 lg:h-16 w-auto object-contain transition-opacity duration-300"
        />
      </div>
    </div>

    <!-- Bouton de changement de thème en haut à droite -->
    <div class="absolute top-6 right-6 z-30">
      <ThemeToggle />
    </div>

    <!-- Image de fond avec overlay -->
    <div class="absolute inset-0 z-0">
      <img
        src="/images/hero_background.jpg"
        alt="Exploitation minière à Madagascar"
        class="w-full h-full object-cover"
      />
      <!-- Overlay gradient pour améliorer la lisibilité -->
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/90 to-blue-900/85 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/85"></div>

      <!-- Pattern overlay pour texture -->
      <div class="absolute inset-0 opacity-5" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
    </div>

    <!-- Contenu principal -->
    <div class="relative z-10 w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <!-- Titre principal -->
        <div class="text-center mb-8 lg:mb-12 animate-slide-up">
          <h1 class=" uppercase text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
            Plateforme de Suivi des Revenus Miniers
          </h1>
          <h2 class="text-xl sm:text-2xl lg:text-3xl text-blue-100 font-light mb-6 drop-shadow-lg">
            Collectivités Territoriales de Madagascar
          </h2>
          <div class="max-w-3xl mx-auto">
            <p class="text-base sm:text-lg text-blue-50 leading-relaxed drop-shadow-md">
              Projet "Minerais critiques : justice fiscale et redistribution de revenus"
            </p>
            <div class="flex flex-wrap justify-center gap-4 mt-6">
              <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-white font-medium">Transparence</span>
              </div>
              <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-white font-medium">Redevabilité</span>
              </div>
              <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-white font-medium">Accessibilité</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire de recherche moderne avec dark mode -->
        <div class="max-w-5xl mx-auto animate-fade-in-up rainbow-border-wrapper">
          <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 transition-colors duration-200">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center flex items-center justify-center gap-3">
              <font-awesome-icon icon="search" class="text-blue-600 dark:text-blue-400" />
              <span>Rechercher un Compte Administratif</span>
            </h3>

            <!-- Message d'erreur -->
            <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
              <div class="flex items-center gap-2">
                <font-awesome-icon icon="exclamation-circle" />
                <span>{{ error }}</span>
              </div>
            </div>

            <!-- Grille de sélection -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <!-- Province avec compteur -->
              <div class="relative">
                <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <font-awesome-icon icon="map-marker-alt" class="text-blue-500 dark:text-blue-400" />
                  <span>Province</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                    {{ totalProvinces }}
                  </span>
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <font-awesome-icon v-if="isLoadingProvinces" icon="spinner" class="w-4 h-4 text-gray-400 animate-spin" />
                    <font-awesome-icon v-else icon="globe" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <select
                    v-model="selectedProvince"
                    :disabled="isLoadingProvinces"
                    class="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all appearance-none text-gray-800 dark:text-gray-100 font-medium hover:border-gray-300 dark:hover:border-gray-500 disabled:opacity-60"
                  >
                    <option value="">{{ isLoadingProvinces ? 'Chargement...' : 'Sélectionner...' }}</option>
                    <option v-for="province in provinces" :key="province.id" :value="province.id">
                      {{ province.nom }}
                    </option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <font-awesome-icon icon="chevron-down" class="w-4 h-4 text-gray-400 dark:text-gray-300" />
                  </div>
                </div>
                <!-- Compteur Régions/Communes pour la province sélectionnée -->
                <Transition name="fade">
                  <div v-if="selectedProvince" class="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <font-awesome-icon icon="info-circle" class="text-blue-500 dark:text-blue-400" />
                    <span>{{ totalRegionsForProvince }} régions, {{ totalCommunesForProvince }} communes</span>
                  </div>
                </Transition>
              </div>

              <!-- Région avec compteur -->
              <div class="relative">
                <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <font-awesome-icon icon="building" class="text-green-500 dark:text-green-400" />
                  <span>Région</span>
                  <Transition name="fade" mode="out-in">
                    <span v-if="selectedProvince" :key="totalRegionsForProvince" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                      {{ totalRegionsForProvince }}
                    </span>
                  </Transition>
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <font-awesome-icon v-if="isLoadingRegions" icon="spinner" class="w-4 h-4 text-gray-400 animate-spin" />
                    <font-awesome-icon v-else icon="landmark" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <select
                    v-model="selectedRegion"
                    :disabled="!selectedProvince || isLoadingRegions"
                    class="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all appearance-none text-gray-800 dark:text-gray-100 font-medium hover:border-gray-300 dark:hover:border-gray-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">{{ isLoadingRegions ? 'Chargement...' : 'Sélectionner...' }}</option>
                    <option v-for="region in regions" :key="region.id" :value="region.id">
                      {{ region.nom }}
                    </option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <font-awesome-icon icon="chevron-down" class="w-4 h-4 text-gray-400 dark:text-gray-300" />
                  </div>
                </div>
                <!-- Compteur Communes pour la région sélectionnée -->
                <Transition name="fade">
                  <div v-if="selectedRegion" class="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <font-awesome-icon icon="info-circle" class="text-green-500 dark:text-green-400" />
                    <span>{{ totalCommunesForRegion }} communes</span>
                  </div>
                </Transition>
              </div>

              <!-- Commune avec compteur -->
              <div class="relative">
                <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <font-awesome-icon icon="users" class="text-purple-500 dark:text-purple-400" />
                  <span>Commune</span>
                  <Transition name="fade" mode="out-in">
                    <span v-if="selectedRegion" :key="totalCommunesForRegion" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200">
                      {{ totalCommunesForRegion }}
                    </span>
                  </Transition>
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <font-awesome-icon v-if="isLoadingCommunes" icon="spinner" class="w-4 h-4 text-gray-400 animate-spin" />
                    <font-awesome-icon v-else icon="home" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <select
                    v-model="selectedCommune"
                    :disabled="!selectedRegion || isLoadingCommunes"
                    class="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all appearance-none text-gray-800 dark:text-gray-100 font-medium hover:border-gray-300 dark:hover:border-gray-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">{{ isLoadingCommunes ? 'Chargement...' : 'Sélectionner...' }}</option>
                    <option v-for="commune in communes" :key="commune.id" :value="commune.id">
                      {{ commune.nom }}
                    </option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <font-awesome-icon icon="chevron-down" class="w-4 h-4 text-gray-400 dark:text-gray-300" />
                  </div>
                </div>
              </div>

              <!-- Année -->
              <div class="relative">
                <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <font-awesome-icon icon="calendar" class="text-orange-500 dark:text-orange-400" />
                  <span>Année</span>
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <font-awesome-icon icon="clock" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <select
                    v-model="selectedAnnee"
                    class="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all appearance-none text-gray-800 dark:text-gray-100 font-medium hover:border-gray-300 dark:hover:border-gray-500"
                  >
                    <option v-for="annee in annees" :key="annee" :value="annee">
                      {{ annee }}
                    </option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <font-awesome-icon icon="chevron-down" class="w-4 h-4 text-gray-400 dark:text-gray-300" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Bouton de recherche -->
            <div class="flex justify-center">
              <button
                @click="handleSearch"
                :disabled="!selectedCommune"
                class="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-60 flex items-center gap-3"
              >
                <font-awesome-icon icon="search" class="w-6 h-6" />
                <span>Rechercher</span>
                <font-awesome-icon icon="chevron-right" class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <!-- Info sélection avec dark mode -->
            <Transition name="fade">
              <div v-if="selectedCommune" class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                <div class="flex items-start gap-3">
                  <font-awesome-icon icon="info-circle" class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-2">
                      <font-awesome-icon icon="check-circle" class="text-green-500" />
                      Sélection actuelle :
                    </p>
                    <p class="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2 flex-wrap">
                      <span class="flex items-center gap-1 font-medium">
                        <font-awesome-icon icon="map-marker-alt" class="text-blue-600 dark:text-blue-400" />
                        {{ provinces.find(p => p.id === selectedProvince)?.nom }}
                      </span>
                      <font-awesome-icon icon="arrow-right" class="text-gray-400" />
                      <span class="flex items-center gap-1 font-medium">
                        <font-awesome-icon icon="building" class="text-green-600 dark:text-green-400" />
                        {{ regions.find(r => r.id === selectedRegion)?.nom }}
                      </span>
                      <font-awesome-icon icon="arrow-right" class="text-gray-400" />
                      <span class="flex items-center gap-1 font-medium">
                        <font-awesome-icon icon="home" class="text-purple-600 dark:text-purple-400" />
                        {{ communes.find(c => c.id === selectedCommune)?.nom }}
                      </span>
                      <span class="flex items-center gap-1 ml-2 text-blue-600 dark:text-blue-400 font-semibold">
                        <font-awesome-icon icon="calendar" />
                        ({{ selectedAnnee }})
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Indicateurs clés en bas (données réelles) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 animate-slide-up-delayed">
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="bg-blue-500/20 p-3 rounded-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-3xl font-bold text-white">
                  <template v-if="isLoadingProvinces">
                    <font-awesome-icon icon="spinner" class="animate-spin w-6 h-6" />
                  </template>
                  <template v-else>{{ totalProvinces }}</template>
                </p>
                <p class="text-sm text-blue-100">Provinces</p>
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="bg-green-500/20 p-3 rounded-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p class="text-3xl font-bold text-white">
                  <template v-if="isLoadingProvinces">
                    <font-awesome-icon icon="spinner" class="animate-spin w-6 h-6" />
                  </template>
                  <template v-else>{{ totalRegions }}</template>
                </p>
                <p class="text-sm text-blue-100">Régions</p>
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="bg-yellow-500/20 p-3 rounded-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p class="text-3xl font-bold text-white">
                  <template v-if="isLoadingProvinces">
                    <font-awesome-icon icon="spinner" class="animate-spin w-6 h-6" />
                  </template>
                  <template v-else>{{ totalCommunes }}</template>
                </p>
                <p class="text-sm text-blue-100">Communes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
      <svg class="w-6 h-6 text-white opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
</template>

<style scoped>
/* Animations personnalisées */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out 0.2s both;
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out 0.4s both;
}

.animate-slide-up-delayed {
  animation: slide-up 1s ease-out 0.6s both;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Effet glassmorphism amélioré */
select {
  backdrop-filter: blur(10px);
}

/* Print styles */
@media print {
  section {
    min-height: auto;
    page-break-inside: avoid;
  }

  .animate-bounce {
    display: none;
  }
}

/* Rainbow animated border */
.rainbow-border-wrapper {
  position: relative;
  border-radius: 1rem;
}

.rainbow-border-wrapper::before,
.rainbow-border-wrapper::after {
  content: '';
  position: absolute;
  inset: -3px;
  z-index: -1;
  border-radius: 1.1rem;
  background: linear-gradient(
    45deg,
    #fb0094,
    #0000ff,
    #00ff00,
    #ffff00,
    #ff0000,
    #fb0094,
    #0000ff,
    #00ff00,
    #ffff00,
    #ff0000
  );
  background-size: 400%;
  animation: steam 45s linear infinite;
}

.rainbow-border-wrapper::after {
  filter: blur(10px);
}

@keyframes steam {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
