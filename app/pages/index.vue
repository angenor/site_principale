<script setup lang="ts">
import type { CompteAdministratif } from '~/composables/useMockData'

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

const { getCompteAdministratif } = useMockData()

// État de la page
const compteAffi = ref<CompteAdministratif | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const showScrollTop = ref(false)

// Gestion de la recherche
const handleSearch = (communeId: string, annee: number) => {
  isLoading.value = true
  errorMessage.value = ''

  // Simuler un délai de chargement (comme une vraie API)
  setTimeout(() => {
    const compte = getCompteAdministratif(communeId, annee)

    if (compte) {
      compteAffi.value = compte
      // Scroller vers le tableau
      nextTick(() => {
        const tableauElement = document.getElementById('tableau-financier')
        if (tableauElement) {
          tableauElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    } else {
      errorMessage.value = 'Aucun compte administratif trouvé pour cette commune et cette année.'
      compteAffi.value = null
    }

    isLoading.value = false
  }, 500)
}

// Gestion du téléchargement
const handleTelecharger = (format: 'excel' | 'word') => {
  // Simulation du téléchargement (à implémenter plus tard avec une vraie génération)
  const fileName = `compte_administratif_${compteAffi.value?.commune.nom}_${compteAffi.value?.annee}.${format === 'excel' ? 'xlsx' : 'docx'}`

  alert(`Téléchargement du fichier: ${fileName}\n\nNote: La génération automatique des fichiers Excel/Word sera implémentée lors de l'intégration avec Supabase.`)

  // TODO: Implémenter la génération réelle de fichiers
  // - Excel: utiliser SheetJS (xlsx)
  // - Word: utiliser docx.js
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
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
    <!-- En-tête de la plateforme -->
    <PlatformHeader />

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <!-- Section de sélection -->
      <section>
        <SelectionCollectivite @search="handleSearch" />
      </section>

      <!-- Indicateur de chargement -->
      <Transition name="fade">
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p class="mt-4 text-gray-600 font-medium">Chargement des données...</p>
          </div>
        </div>
      </Transition>

      <!-- Message d'erreur -->
      <Transition name="fade">
        <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-red-800 font-bold">Aucune donnée disponible</h3>
              <p class="text-red-700 text-sm mt-1">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Message d'accueil (affiché uniquement si aucun compte n'est chargé) -->
      <Transition name="fade">
        <div v-if="!compteAffi && !isLoading && !errorMessage" class="bg-white rounded-lg shadow-lg p-8 text-center">
          <div class="max-w-2xl mx-auto">
            <svg class="w-20 h-20 mx-auto text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 class="text-2xl font-bold text-gray-800 mb-3">
              Bienvenue sur la Plateforme de Suivi
            </h2>
            <p class="text-gray-600 leading-relaxed mb-4">
              Sélectionnez une région, un district et une commune dans le formulaire ci-dessus
              pour consulter le compte administratif de la collectivité.
            </p>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 class="font-semibold text-blue-900 mb-2">Informations disponibles :</h3>
              <ul class="text-sm text-blue-800 space-y-1">
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Tableau détaillé des recettes fiscales et non fiscales
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Tableau détaillé des dépenses de fonctionnement
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Taux d'exécution et reste à recouvrer/payer
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Export Excel et Word disponibles
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Tableau financier -->
      <Transition name="slide-up">
        <section v-if="compteAffi && !isLoading" id="tableau-financier">
          <TableauFinancier
            :compte="compteAffi"
            @telecharger="handleTelecharger"
          />
        </section>
      </Transition>

      <!-- Section informations complémentaires -->
      <section v-if="!compteAffi && !isLoading" class="grid md:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-blue-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-800">Transparence</h3>
          </div>
          <p class="text-sm text-gray-600">
            Accédez librement aux informations financières des collectivités bénéficiaires des revenus miniers.
          </p>
        </div>

        <!-- Card 2 -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-green-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-800">Redevabilité</h3>
          </div>
          <p class="text-sm text-gray-600">
            Suivez l'utilisation des fonds publics et l'exécution budgétaire en temps réel.
          </p>
        </div>

        <!-- Card 3 -->
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-purple-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-800">Accessibilité</h3>
          </div>
          <p class="text-sm text-gray-600">
            Données ouvertes, téléchargeables et facilement exploitables pour tous les citoyens.
          </p>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white mt-16 print:hidden">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="font-bold text-lg mb-3">À propos</h3>
            <p class="text-gray-300 text-sm">
              Projet "Minerais critiques : justice fiscale et redistribution de revenus"
              mené par PCQVP Madagascar et TI Madagascar.
            </p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-3">Contact</h3>
            <p class="text-gray-300 text-sm">
              Email: vramaherison@transparency.mg<br>
              Transparency International - Initiative Madagascar
            </p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-3">Liens utiles</h3>
            <ul class="text-gray-300 text-sm space-y-1">
              <li><NuxtLink to="/about" class="hover:text-white transition">À propos du projet</NuxtLink></li>
              <li><NuxtLink to="/contact" class="hover:text-white transition">Contact</NuxtLink></li>
              <li><a href="#" class="hover:text-white transition">Mentions légales</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {{ new Date().getFullYear() }} PCQVP Madagascar. Tous droits réservés.</p>
        </div>
      </div>
    </footer>

    <!-- Bouton scroll to top -->
    <Transition name="fade">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition print:hidden z-50"
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
