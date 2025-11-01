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
const isTableauExpanded = ref(false)

// Toggle tableau expansion
const toggleTableau = () => {
  isTableauExpanded.value = !isTableauExpanded.value
}

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
      <div class="mx-auto px-4 py-4 flex items-center justify-between">
        <button
          @click="retourAccueil"
          class="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium group"
        >
          <font-awesome-icon icon="arrow-left" class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l'accueil</span>
        </button>

        <div class="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section v-if="compteAffi" class="relative min-h-[400px] flex items-center overflow-hidden pb-20">
      <!-- Image de fond sans overlay -->
      <div class="absolute inset-0 z-0">
        <img
          src="/images/hero_background.jpg"
          alt="Exploitation minière à Madagascar"
          class="w-full h-full object-cover brightness-90 dark:brightness-75"
        />
      </div>

      <!-- Contenu de la hero section avec fond semi-transparent -->
      <div class="relative z-10 w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="flex flex-col items-center gap-4">
            <!-- Titre avec fond glassmorphism et icône -->
            <div class="w-auto bg-white/0 dark:bg-gray-900/0 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-2xl border border-white/50 dark:border-gray-700/50">
              <h1 class="text-4xl sm:text-5xl font-bold text-white whitespace-nowrap flex items-center gap-4">
                <font-awesome-icon icon="landmark" class="text-blue-300 dark:text-blue-400" />
                Compte Administratif {{ compteAffi.annee }}
              </h1>
            </div>

            <!-- Breadcrumb avec fond glassmorphism et icône -->
            <div class="w-auto bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl px-6 py-3 rounded-xl shadow-lg border border-white/50 dark:border-gray-700/50">
              <div class="flex flex-wrap justify-center items-center gap-2 text-lg sm:text-xl text-gray-700 dark:text-gray-300">
                <font-awesome-icon icon="map-marker-alt" class="text-red-500 dark:text-red-400" />
                <span class="font-semibold">{{ compteAffi.region.nom }}</span>
                <font-awesome-icon icon="chevron-right" class="text-sm text-gray-400" />
                <span class="font-semibold">{{ compteAffi.district.nom }}</span>
                <font-awesome-icon icon="chevron-right" class="text-sm text-gray-400" />
                <span class="font-bold text-blue-600 dark:text-blue-400">{{ compteAffi.commune.nom }}</span>
              </div>
            </div>

            <!-- Badges d'information avec icônes -->
            <div class="flex flex-wrap justify-center gap-4 mt-2">
              <div class="bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/50 dark:border-gray-700/50">
                <span class="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2">
                  <font-awesome-icon icon="users" class="text-green-600 dark:text-green-400" />
                  Population: {{ compteAffi.commune.population?.toLocaleString() }}
                </span>
              </div>
              <div class="bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/50 dark:border-gray-700/50">
                <span class="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2">
                  <font-awesome-icon icon="calendar" class="text-purple-600 dark:text-purple-400" />
                  Année fiscale: {{ compteAffi.annee }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 space-y-8">
      <!-- Indicateur de chargement -->
      <Transition name="fade">
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div class="relative inline-block">
              <font-awesome-icon icon="spinner" class="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin" />
              <div class="absolute inset-0 animate-pulse">
                <font-awesome-icon icon="circle" class="w-16 h-16 text-blue-300 dark:text-blue-500 opacity-30" />
              </div>
            </div>
            <p class="mt-6 text-gray-700 dark:text-gray-300 font-semibold text-lg flex items-center justify-center gap-2">
              <font-awesome-icon icon="chart-bar" class="text-blue-600 dark:text-blue-400" />
              Chargement des données...
            </p>
            <p class="mt-2 text-gray-500 dark:text-gray-400 text-sm">Veuillez patienter</p>
          </div>
        </div>
      </Transition>

      <!-- Message d'erreur -->
      <Transition name="fade">
        <div v-if="errorMessage && !isLoading" class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 dark:border-red-400 p-6 rounded-lg shadow-lg">
          <div class="flex items-start gap-4">
            <div class="bg-red-500 dark:bg-red-600 p-3 rounded-lg shadow-md">
              <font-awesome-icon icon="exclamation-triangle" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-red-800 dark:text-red-300 font-bold text-lg flex items-center gap-2 mb-2">
                <font-awesome-icon icon="times-circle" class="text-red-600 dark:text-red-400" />
                Aucune donnée disponible
              </h3>
              <p class="text-red-700 dark:text-red-400 text-sm leading-relaxed">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Section Description du contexte minier (superposée au Hero) -->
      <Transition name="slide-up">
        <section v-if="compteAffi && !isLoading && description" class="relative -mt-16 z-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-3xl p-6 sm:p-8 lg:p-10 transition-all duration-200 border border-gray-100 dark:border-gray-700">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 p-3 rounded-xl shadow-lg">
              <font-awesome-icon icon="industry" class="w-6 h-6 text-white" />
            </div>
            <span>{{ description.titre }} - Contexte Minier</span>
          </h2>

          <!-- Contenu riche avec support HTML -->
          <div class="description-content space-y-6">
            <div v-html="description.contenu" class="
              [&_p]:text-gray-700 dark:[&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4
              [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 dark:[&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-3
              [&_strong]:font-semibold [&_strong]:text-gray-900 dark:[&_strong]:text-white
              [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-2 [&_ul]:text-gray-700 dark:[&_ul]:text-gray-300
              [&_li]:text-gray-700 dark:[&_li]:text-gray-300
              [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-700 dark:[&_a]:hover:text-blue-300
            "></div>

            <!-- Section Galerie Photos (Exemple) -->
            <div class="mt-8 space-y-4">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <font-awesome-icon icon="camera" class="text-purple-600 dark:text-purple-400" />
                Galerie Photos - Contexte Minier Local
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Photo 1 - Mine de cobalt -->
                <div class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div class="aspect-video relative">
                    <img
                      src="https://imgs.mongabay.com/wp-content/uploads/sites/26/2023/06/14150521/cobalt-mine.jpg"
                      alt="Mine de cobalt"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p class="text-white font-bold mb-1">Mine de cobalt</p>
                    <p class="text-white/90 text-xs">Exploitation de minerais critiques</p>
                  </div>
                </div>

                <!-- Photo 2 - Concentration de cassitérite -->
                <div class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div class="aspect-video relative">
                    <img
                      src="https://diplomatie.belgium.be/sites/default/files/styles/fluid_image/public/2022-11/Minersconcentratingcassiteriteandcoltan_KL.jpg?itok=EuU2PJlB"
                      alt="Mineurs concentrant la cassitérite"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p class="text-white font-bold mb-1">Traitement des minerais</p>
                    <p class="text-white/90 text-xs">Concentration de cassitérite et coltan</p>
                  </div>
                </div>

                <!-- Photo 3 - Site minier -->
                <div class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div class="aspect-video relative">
                    <img
                      src="https://static.euronews.com/articles/stories/08/97/03/94/1200x675_cmsv2_fb678fe0-5671-57f4-95f5-0abb520be44e-8970394.jpg"
                      alt="Site d'exploitation minière"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p class="text-white font-bold mb-1">Site d'exploitation</p>
                    <p class="text-white/90 text-xs">Zone d'extraction {{ compteAffi.commune.nom }}</p>
                  </div>
                </div>

                <!-- Photo 4 - Communauté et développement -->
                <div class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div class="aspect-video relative">
                    <img
                      src="https://www.afrique-sur7.fr/wp-content/uploads/2023/10/2ad85722-5c2c-4f30-a98c-89412ec2b5aa.jpg"
                      alt="Impact sur la communauté locale"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p class="text-white font-bold mb-1">Développement local</p>
                    <p class="text-white/90 text-xs">Impact social et économique</p>
                  </div>
                </div>
              </div>

              <!-- Note informative sur les photos -->
              <div class="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <font-awesome-icon icon="info-circle" class="text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <p class="text-sm text-purple-800 dark:text-purple-300">
                  Ces photos illustrent le contexte minier typique de la région. Cliquez pour voir en détail.
                </p>
              </div>
            </div>

            <!-- Section Liens Utiles (Exemple) -->
            <div class="mt-8 space-y-4">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <font-awesome-icon icon="link" class="text-blue-600 dark:text-blue-400" />
                Liens Utiles & Documentation
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Lien 1 -->
                <a href="#" class="group flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all">
                  <div class="bg-blue-500 dark:bg-blue-600 p-2 rounded-lg">
                    <font-awesome-icon icon="file-pdf" class="w-5 h-5 text-white" />
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      Rapport annuel d'activité minière
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Document PDF - {{ compteAffi.annee }}</p>
                  </div>
                  <font-awesome-icon icon="external-link-alt" class="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </a>

                <!-- Lien 2 -->
                <a href="#" class="group flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700 hover:shadow-lg transition-all">
                  <div class="bg-green-500 dark:bg-green-600 p-2 rounded-lg">
                    <font-awesome-icon icon="globe" class="w-5 h-5 text-white" />
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition">
                      Site officiel de la commune
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Informations administratives</p>
                  </div>
                  <font-awesome-icon icon="external-link-alt" class="w-4 h-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                </a>

                <!-- Lien 3 -->
                <a href="#" class="group flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all">
                  <div class="bg-purple-500 dark:bg-purple-600 p-2 rounded-lg">
                    <font-awesome-icon icon="chart-bar" class="w-5 h-5 text-white" />
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                      Statistiques minières régionales
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Données et analyses</p>
                  </div>
                  <font-awesome-icon icon="external-link-alt" class="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                </a>

                <!-- Lien 4 -->
                <a href="#" class="group flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all">
                  <div class="bg-orange-500 dark:bg-orange-600 p-2 rounded-lg">
                    <font-awesome-icon icon="landmark" class="w-5 h-5 text-white" />
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                      Cadre légal et réglementaire
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Législation minière à Madagascar</p>
                  </div>
                  <font-awesome-icon icon="external-link-alt" class="w-4 h-4 text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                </a>
              </div>
            </div>

            <!-- Section Tableau Financier Intégré -->
            <div class="mt-10 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <font-awesome-icon icon="table" class="text-indigo-600 dark:text-indigo-400" />
                  Données Financières - Compte Administratif {{ compteAffi.annee }}
                </h3>
              </div>

              <!-- Tableau avec masquage et bouton "Voir tout" -->
              <div class="relative">
                <div :class="[
                  'overflow-hidden transition-all duration-500',
                  isTableauExpanded ? 'max-h-[10000px]' : 'max-h-[600px]'
                ]">
                  <TableauFinancier
                    :compte="compteAffi"
                    @telecharger="handleTelecharger"
                  />
                </div>

                <!-- Gradient Overlay et Bouton "Voir tout" -->
                <div v-if="!isTableauExpanded" class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-800 via-white/90 dark:via-gray-800/90 to-transparent flex items-end justify-center pb-4">
                  <button
                    @click="toggleTableau"
                    class="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    <font-awesome-icon icon="chevron-down" class="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                    <span>Voir tout le tableau</span>
                    <font-awesome-icon icon="table" class="w-4 h-4" />
                  </button>
                </div>

                <!-- Bouton "Masquer" quand le tableau est déployé -->
                <div v-else class="flex justify-center mt-6">
                  <button
                    @click="toggleTableau"
                    class="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-500 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    <font-awesome-icon icon="chevron-up" class="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                    <span>Masquer le tableau</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Note pour l'éditeur -->
          <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 rounded-xl transition-colors duration-200 shadow-sm">
            <div class="flex items-start gap-4">
              <div class="bg-blue-500 dark:bg-blue-600 p-3 rounded-lg shadow-md">
                <font-awesome-icon icon="edit" class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1">
                <p class="text-base font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <font-awesome-icon icon="info-circle" class="text-blue-600 dark:text-blue-400" />
                  Note pour l'éditeur
                </p>
                <p class="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                  Cette section sera éditable via le système de gestion de contenu (CMS) et permettra l'ajout de textes, images, photos et liens concernant le contexte minier de la collectivité.
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span class="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 shadow-sm">
                    <font-awesome-icon icon="image" class="text-xs" />
                    Images
                  </span>
                  <span class="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 shadow-sm">
                    <font-awesome-icon icon="link" class="text-xs" />
                    Liens
                  </span>
                  <span class="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 shadow-sm">
                    <font-awesome-icon icon="file-alt" class="text-xs" />
                    Textes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Transition>
    </main>

    <!-- Footer -->
    <footer class="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 dark:from-gray-950 dark:via-black dark:to-gray-950 text-white mt-16 print:hidden transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
              <div class="bg-blue-600 p-2 rounded-lg">
                <font-awesome-icon icon="info-circle" class="w-4 h-4" />
              </div>
              À propos
            </h3>
            <p class="text-gray-300 dark:text-gray-400 text-sm leading-relaxed flex items-start gap-2">
              <font-awesome-icon icon="industry" class="text-blue-400 mt-1 flex-shrink-0" />
              <span>
                Projet "Minerais critiques : justice fiscale et redistribution de revenus"
                mené par PCQVP Madagascar et TI Madagascar.
              </span>
            </p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
              <div class="bg-green-600 p-2 rounded-lg">
                <font-awesome-icon icon="envelope" class="w-4 h-4" />
              </div>
              Contact
            </h3>
            <div class="space-y-2 text-gray-300 dark:text-gray-400 text-sm">
              <p class="flex items-center gap-2">
                <font-awesome-icon icon="envelope" class="text-green-400" />
                vramaherison@transparency.mg
              </p>
              <p class="flex items-start gap-2">
                <font-awesome-icon icon="building" class="text-green-400 mt-1 flex-shrink-0" />
                <span>Transparency International - Initiative Madagascar</span>
              </p>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
              <div class="bg-purple-600 p-2 rounded-lg">
                <font-awesome-icon icon="globe" class="w-4 h-4" />
              </div>
              Ressources
            </h3>
            <div class="space-y-2 text-gray-300 dark:text-gray-400 text-sm">
              <p class="flex items-center gap-2">
                <font-awesome-icon icon="chart-bar" class="text-purple-400" />
                Plateforme de suivi des revenus miniers
              </p>
              <p class="flex items-center gap-2">
                <font-awesome-icon icon="landmark" class="text-purple-400" />
                Collectivités Territoriales de Madagascar
              </p>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-700 dark:border-gray-800 mt-8 pt-6 text-center text-gray-400 dark:text-gray-500 text-sm">
          <p class="flex items-center justify-center gap-2">
            <font-awesome-icon icon="heart" class="text-red-500" />
            &copy; {{ new Date().getFullYear() }} PCQVP Madagascar. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>

    <!-- Bouton scroll to top -->
    <Transition name="fade">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all print:hidden z-50 group"
        aria-label="Retour en haut"
      >
        <font-awesome-icon icon="arrow-up" class="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
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
