<script setup lang="ts">
const emit = defineEmits<{
  search: [communeId: string, annee: number]
}>()

const { regions, getDistrictsByRegion, getCommunesByDistrict } = useMockData()
const { isDark } = useDarkMode()

// Logo dynamique basé sur le thème
const logoSrc = computed(() => {
  return isDark.value
    ? '/images/logos/logo_fond_noire_texte_blanc.jpeg'
    : '/images/logos/logo_fond_noire_texte_bleu.jpeg'
})

// États
const selectedRegion = ref<string>('')
const selectedDistrict = ref<string>('')
const selectedCommune = ref<string>('')
const selectedAnnee = ref<number>(2024)

// Listes filtrées
const districts = computed(() => {
  if (!selectedRegion.value) return []
  return getDistrictsByRegion(selectedRegion.value)
})

const communes = computed(() => {
  if (!selectedDistrict.value) return []
  return getCommunesByDistrict(selectedDistrict.value)
})

// Années disponibles
const annees = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

// Réinitialiser les sélections en cascade
watch(selectedRegion, () => {
  selectedDistrict.value = ''
  selectedCommune.value = ''
})

watch(selectedDistrict, () => {
  selectedCommune.value = ''
})

// Fonction de recherche avec redirection
const handleSearch = () => {
  if (!selectedCommune.value) {
    alert('Veuillez sélectionner une commune')
    return
  }

  // Redirection vers la page du compte administratif
  const url = `/compte-administratif?commune=${encodeURIComponent(selectedCommune.value)}&annee=${selectedAnnee.value}`
  window.location.href = url
}
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
          <h1 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
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

        <!-- Formulaire de recherche moderne -->
        <div class="max-w-5xl mx-auto animate-fade-in-up">
          <div class="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-white/20">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
              Rechercher un Compte Administratif
            </h3>

            <!-- Grille de sélection -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <!-- Région -->
              <div class="relative">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Région
                </label>
                <div class="relative">
                  <select
                    v-model="selectedRegion"
                    class="w-full pl-4 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all appearance-none text-gray-800 font-medium hover:border-gray-300"
                  >
                    <option value="">Sélectionner...</option>
                    <option v-for="region in regions" :key="region.id" :value="region.id">
                      {{ region.nom }}
                    </option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- District -->
              <div class="relative">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  District
                </label>
                <div class="relative">
                  <select
                    v-model="selectedDistrict"
                    :disabled="!selectedRegion"
                    class="w-full pl-4 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all appearance-none text-gray-800 font-medium hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Sélectionner...</option>
                    <option v-for="district in districts" :key="district.id" :value="district.id">
                      {{ district.nom }}
                    </option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Commune -->
              <div class="relative">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Commune
                </label>
                <div class="relative">
                  <select
                    v-model="selectedCommune"
                    :disabled="!selectedDistrict"
                    class="w-full pl-4 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all appearance-none text-gray-800 font-medium hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Sélectionner...</option>
                    <option v-for="commune in communes" :key="commune.id" :value="commune.id">
                      {{ commune.nom }}
                    </option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Année -->
              <div class="relative">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Année
                </label>
                <div class="relative">
                  <select
                    v-model="selectedAnnee"
                    class="w-full pl-4 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all appearance-none text-gray-800 font-medium hover:border-gray-300"
                  >
                    <option v-for="annee in annees" :key="annee" :value="annee">
                      {{ annee }}
                    </option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bouton de recherche -->
            <div class="flex justify-center">
              <button
                @click="handleSearch"
                :disabled="!selectedCommune"
                class="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-60 flex items-center gap-3"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Rechercher</span>
                <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Info sélection -->
            <Transition name="fade">
              <div v-if="selectedCommune" class="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <p class="text-sm font-semibold text-blue-900 mb-1">Sélection actuelle :</p>
                    <p class="text-sm text-blue-800">
                      <span class="font-medium">{{ regions.find(r => r.id === selectedRegion)?.nom }}</span>
                      <span class="mx-2">→</span>
                      <span class="font-medium">{{ districts.find(d => d.id === selectedDistrict)?.nom }}</span>
                      <span class="mx-2">→</span>
                      <span class="font-medium">{{ communes.find(c => c.id === selectedCommune)?.nom }}</span>
                      <span class="ml-2 text-blue-600">({{ selectedAnnee }})</span>
                    </p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Indicateurs clés en bas -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 animate-slide-up-delayed">
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="bg-blue-500/20 p-3 rounded-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p class="text-3xl font-bold text-white">22</p>
                <p class="text-sm text-blue-100">Régions</p>
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="bg-green-500/20 p-3 rounded-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p class="text-3xl font-bold text-white">119</p>
                <p class="text-sm text-blue-100">Communes</p>
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div class="flex items-center gap-4">
              <div class="bg-yellow-500/20 p-3 rounded-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p class="text-3xl font-bold text-white">2024</p>
                <p class="text-sm text-blue-100">Année active</p>
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
</style>
