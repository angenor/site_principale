<script setup lang="ts">
interface StrategicAxis {
  id: string
  title: string
  description: string
  icon: string | null
  color: string | null
  backgroundImage: string | null
  linkUrl: string | null
  sortOrder: number
}

// Charger les axes stratégiques depuis l'API
const { data: axes, pending, error } = await useFetch<StrategicAxis[]>('/api/strategic-axes')

// Utiliser la config partagée
const { getConfig } = useAppSettings()

// Texte d'introduction (dynamique ou fallback)
const introText = computed(() => getConfig('strategic_axes_intro', 'Quatre piliers fondamentaux pour une gouvernance minière responsable à Madagascar'))

// Valeurs par défaut pour les axes sans icon/color définis
const defaultAxesConfig: Record<string, { icon: string; color: string }> = {
  'Transparence': { icon: 'eye', color: '#3695d8' },
  'Redevabilité': { icon: 'scale-balanced', color: '#22c55e' },
  'Durabilité': { icon: 'leaf', color: '#c4d600' },
  'Inclusion': { icon: 'users', color: '#ffb81c' }
}

// Helper pour obtenir l'icône et la couleur
const getIcon = (axe: StrategicAxis) => axe.icon || defaultAxesConfig[axe.title]?.icon || 'bullseye'
const getColor = (axe: StrategicAxis) => axe.color || defaultAxesConfig[axe.title]?.color || '#3695d8'

// Détecter si l'icône est une image (URL) ou un nom FontAwesome
const isCustomImage = (icon: string | null) => {
  if (!icon) return false
  return icon.startsWith('/') || icon.startsWith('http')
}

// Limite de caractères pour afficher le bouton "Voir plus"
const DESCRIPTION_LIMIT = 150

// État du modal
const selectedAxe = ref<StrategicAxis | null>(null)
const isModalOpen = ref(false)

// Vérifier si le texte est tronqué
const isTextTruncated = (description: string) => description.length > DESCRIPTION_LIMIT

// Ouvrir le modal
const openModal = (axe: StrategicAxis) => {
  selectedAxe.value = axe
  isModalOpen.value = true
}

// Fermer le modal
const closeModal = () => {
  isModalOpen.value = false
  selectedAxe.value = null
}
</script>

<template>
  <section class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Titre de section -->
      <div class="text-center mb-12">
        <h2 class="text-3xl lg:text-4xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-4">
          Nos Axes Stratégiques
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ introText }}
        </p>
      </div>

      <!-- État de chargement -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div v-for="i in 4" :key="i" class="animate-pulse bg-white dark:bg-gray-900 rounded-xl p-6">
          <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl mb-5"></div>
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500 dark:text-red-400">
          Impossible de charger les axes stratégiques. Veuillez réessayer plus tard.
        </p>
      </div>

      <!-- Grille des axes -->
      <div v-else-if="axes && axes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <article
          v-for="axe in axes"
          :key="axe.id"
          class="group bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Icône -->
          <div
            class="w-16 h-16 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
            :style="{ backgroundColor: getColor(axe) + '20' }"
          >
            <!-- Image personnalisée -->
            <img
              v-if="isCustomImage(axe.icon)"
              :src="axe.icon!"
              alt=""
              class="w-8 h-8 object-contain"
            />
            <!-- Icône FontAwesome -->
            <font-awesome-icon
              v-else
              :icon="getIcon(axe)"
              class="w-8 h-8"
              :style="{ color: getColor(axe) }"
            />
          </div>

          <!-- Contenu -->
          <h3 class="text-xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-3">
            {{ axe.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-4">
            {{ axe.description }}
          </p>
          <!-- Bouton Voir plus -->
          <button
            v-if="isTextTruncated(axe.description)"
            @click="openModal(axe)"
            class="mt-3 text-sm font-medium cursor-pointer hover:underline transition-colors"
            :style="{ color: getColor(axe) }"
          >
            Voir plus
            <font-awesome-icon icon="arrow-right" class="ml-1 w-3 h-3" />
          </button>
        </article>
      </div>

      <!-- Message si aucun axe -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">
          Aucun axe stratégique disponible pour le moment.
        </p>
      </div>
    </div>

    <!-- Modal Popup -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="isModalOpen && selectedAxe"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <!-- Overlay -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

          <!-- Modal Content -->
          <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <!-- Header avec couleur de l'axe -->
            <div
              class="p-6 text-white"
              :style="{ backgroundColor: getColor(selectedAxe) }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- Icône -->
                  <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <img
                      v-if="isCustomImage(selectedAxe.icon)"
                      :src="selectedAxe.icon!"
                      alt=""
                      class="w-6 h-6 object-contain"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="getIcon(selectedAxe)"
                      class="w-6 h-6 text-white"
                    />
                  </div>
                  <h3 class="text-xl font-heading font-bold uppercase">
                    {{ selectedAxe.title }}
                  </h3>
                </div>
                <!-- Bouton fermer -->
                <button
                  @click="closeModal"
                  class="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <font-awesome-icon icon="xmark" class="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto max-h-[50vh]">
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {{ selectedAxe.description }}
              </p>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                @click="closeModal"
                class="w-full py-2.5 px-4 rounded-lg font-medium text-white transition-colors cursor-pointer"
                :style="{ backgroundColor: getColor(selectedAxe) }"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
/* Animation du modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
