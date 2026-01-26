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

// Charger la configuration du site
const { data: siteConfig } = await useFetch<Record<string, string>>('/api/config')

// Texte d'introduction (dynamique ou fallback)
const introText = computed(() => {
  return siteConfig.value?.strategic_axes_intro || 'Quatre piliers fondamentaux pour une gouvernance minière responsable à Madagascar'
})

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
          <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {{ axe.description }}
          </p>
        </article>
      </div>

      <!-- Message si aucun axe -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">
          Aucun axe stratégique disponible pour le moment.
        </p>
      </div>
    </div>
  </section>
</template>
