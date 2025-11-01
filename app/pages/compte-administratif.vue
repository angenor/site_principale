<script setup lang="ts">
import type { CompteAdministratif } from '~/composables/useMockData'

// Récupérer les paramètres de la route
const route = useRoute()
const router = useRouter()

// Métadonnées de la page
useHead({
  title: 'Compte Administratif - Plateforme de Suivi des Revenus Miniers',
  meta: [
    {
      name: 'description',
      content: 'Visualisation du compte administratif des collectivités territoriales à Madagascar'
    }
  ]
})

const { getCompteAdministratif } = useMockData()

// État de la page
const compteAffi = ref<CompteAdministratif | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')
const showScrollTop = ref(false)

// Charger les données au montage
onMounted(() => {
  const communeId = route.query.commune as string
  const annee = parseInt(route.query.annee as string)

  if (!communeId || !annee) {
    errorMessage.value = 'Paramètres de recherche manquants'
    router.push('/')
    return
  }

  // Simuler un délai de chargement (comme une vraie API)
  setTimeout(() => {
    const compte = getCompteAdministratif(communeId, annee)

    if (compte) {
      compteAffi.value = compte
    } else {
      errorMessage.value = 'Aucun compte administratif trouvé pour cette commune et cette année.'
    }

    isLoading.value = false
  }, 500)

  // Gestion du scroll
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Gestion du téléchargement
const handleTelecharger = (format: 'excel' | 'word') => {
  const fileName = `compte_administratif_${compteAffi.value?.commune.nom}_${compteAffi.value?.annee}.${format === 'excel' ? 'xlsx' : 'docx'}`

  alert(`Téléchargement du fichier: ${fileName}\n\nNote: La génération automatique des fichiers Excel/Word sera implémentée lors de l'intégration avec Supabase.`)
}

// Retour à l'accueil
const retourAccueil = () => {
  router.push('/')
}

// Gestion du scroll to top
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Données mockup pour la description (à remplacer par données de Supabase)
const description = computed(() => {
  if (!compteAffi.value) return null

  return {
    titre: 'Description',
    contenu: `
      <p>La commune de <strong>${compteAffi.value.commune.nom}</strong> se situe dans le district de <strong>${compteAffi.value.district.nom}</strong>,
      région <strong>${compteAffi.value.region.nom}</strong>. Cette zone est reconnue pour ses activités minières significatives,
      notamment l'exploitation de minerais critiques essentiels à la transition énergétique mondiale.</p>

      <h3>Contexte minier local</h3>
      <p>Les activités extractives dans cette collectivité territoriale contribuent de manière substantielle aux revenus locaux.
      Les redevances minières constituent une source importante de financement pour le développement communal et l'amélioration
      des infrastructures publiques.</p>

      <h3>Utilisation des revenus</h3>
      <p>Les fonds issus de l'exploitation minière sont alloués selon les priorités définies dans le plan de développement communal,
      avec un accent particulier sur :</p>
      <ul>
        <li>L'éducation et la construction d'infrastructures scolaires</li>
        <li>L'accès à l'eau potable et l'assainissement</li>
        <li>Le développement des infrastructures routières</li>
        <li>Les services de santé publique</li>
      </ul>
    `
  }
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header avec bouton retour et ThemeToggle -->
    <header class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          @click="retourAccueil"
          class="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Retour à l'accueil</span>
        </button>

        <div class="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section v-if="compteAffi" class="relative min-h-[400px] flex items-center overflow-hidden">
      <!-- Image de fond avec overlay -->
      <div class="absolute inset-0 z-0">
        <img
          src="/images/hero_background.jpg"
          alt="Exploitation minière à Madagascar"
          class="w-full h-full object-cover"
        />
        <!-- Overlay gradient - allégé pour plus de visibilité -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-blue-900/70 dark:from-gray-900/80 dark:via-gray-800/75 dark:to-gray-900/80"></div>
      </div>

      <!-- Contenu de la hero section -->
      <div class="relative z-10 w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="text-center">
            <h1 class="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
              Compte Administratif {{ compteAffi.annee }}
            </h1>
            <div class="flex flex-wrap justify-center items-center gap-2 text-xl sm:text-2xl text-blue-100 mb-6">
              <span class="font-semibold">{{ compteAffi.region.nom }}</span>
              <span class="mx-2">→</span>
              <span class="font-semibold">{{ compteAffi.district.nom }}</span>
              <span class="mx-2">→</span>
              <span class="font-bold text-white">{{ compteAffi.commune.nom }}</span>
            </div>
            <div class="flex flex-wrap justify-center gap-4 mt-6">
              <div class="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span class="text-white font-medium">Population: {{ compteAffi.commune.population?.toLocaleString() }}</span>
              </div>
              <div class="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span class="text-white font-medium">Année fiscale: {{ compteAffi.annee }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <!-- Indicateur de chargement -->
      <Transition name="fade">
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
            <p class="mt-4 text-gray-600 dark:text-gray-300 font-medium">Chargement des données...</p>
          </div>
        </div>
      </Transition>

      <!-- Message d'erreur -->
      <Transition name="fade">
        <div v-if="errorMessage && !isLoading" class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-lg shadow">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-red-500 dark:text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-red-800 dark:text-red-300 font-bold">Aucune donnée disponible</h3>
              <p class="text-red-700 dark:text-red-400 text-sm mt-1">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Section Description du contexte minier -->
      <Transition name="slide-up">
        <section v-if="compteAffi && !isLoading && description" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 sm:p-8 lg:p-10 transition-all duration-200 border border-gray-100 dark:border-gray-700">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ description.titre }}
          </h2>

          <!-- Contenu riche avec support HTML -->
          <div class="description-content space-y-4">
            <div v-html="description.contenu" class="
              [&_p]:text-gray-700 dark:[&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4
              [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 dark:[&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-3
              [&_strong]:font-semibold [&_strong]:text-gray-900 dark:[&_strong]:text-white
              [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-2 [&_ul]:text-gray-700 dark:[&_ul]:text-gray-300
              [&_li]:text-gray-700 dark:[&_li]:text-gray-300
              [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-700 dark:[&_a]:hover:text-blue-300
            "></div>
          </div>

          <!-- Note pour l'éditeur -->
          <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg transition-colors duration-200">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Note pour l'éditeur</p>
                <p class="text-sm text-blue-800 dark:text-blue-300">
                  Cette section sera éditable via le système de gestion de contenu (CMS) et permettra l'ajout de textes, images, photos et liens concernant le contexte minier de la collectivité.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Transition>

      <!-- Tableau financier -->
      <Transition name="slide-up">
        <section v-if="compteAffi && !isLoading">
          <TableauFinancier
            :compte="compteAffi"
            @telecharger="handleTelecharger"
          />
        </section>
      </Transition>
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
  header,
  footer,
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
