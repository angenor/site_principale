<script setup lang="ts">
interface Props {
  // Image
  image?: string
  imageAlt?: string
  // Contenu
  title?: string
  subtitle?: string
  description?: string
  // Metadata
  date?: string
  category?: string
  categoryColor?: string
  region?: string
  // Actions
  linkTo?: string
  linkText?: string
  // Variantes
  variant?: 'default' | 'horizontal' | 'compact' | 'featured'
  // Options
  showImage?: boolean
  aspectRatio?: 'video' | 'square' | 'portrait'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  showImage: true,
  aspectRatio: 'video',
  linkText: 'Lire la suite'
})

// Formater la date
const formattedDate = computed(() => {
  if (!props.date) return null
  const d = new Date(props.date)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Classes pour l'aspect ratio de l'image
const aspectRatioClasses = computed(() => {
  switch (props.aspectRatio) {
    case 'square': return 'aspect-square'
    case 'portrait': return 'aspect-[3/4]'
    default: return 'aspect-video'
  }
})

// Classes pour la variante
const cardClasses = computed(() => {
  const base = 'card-mom overflow-hidden'
  switch (props.variant) {
    case 'horizontal':
      return `${base} flex flex-col md:flex-row`
    case 'compact':
      return `${base} flex flex-row`
    case 'featured':
      return `${base} relative`
    default:
      return base
  }
})
</script>

<template>
  <article :class="cardClasses">
    <!-- Placeholder pour maintenir la hauteur minimale en mode featured -->
    <div v-if="variant === 'featured'" class="aspect-[3/4] w-full" aria-hidden="true" />

    <!-- Image -->
    <div
      v-if="showImage && image"
      :class="[
        'overflow-hidden',
        variant === 'horizontal' ? 'relative md:w-2/5 flex-shrink-0' : '',
        variant === 'compact' ? 'relative w-24 h-24 flex-shrink-0' : '',
        variant === 'featured' ? 'absolute inset-0' : 'relative ' + aspectRatioClasses
      ]"
    >
      <img
        :src="image"
        :alt="imageAlt || title || 'Image'"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <!-- Overlay pour les cartes "featured" -->
      <div v-if="variant === 'featured'" class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <!-- Badge catégorie sur l'image -->
      <span
        v-if="category && variant !== 'compact'"
        class="absolute top-3 left-3 badge-category"
        :style="categoryColor ? { backgroundColor: categoryColor + '20', color: categoryColor } : {}"
      >
        {{ category }}
      </span>
    </div>

    <!-- Contenu -->
    <div
      :class="[
        'flex flex-col',
        variant === 'featured' ? 'absolute bottom-0 left-0 right-0 p-6 text-white' : 'p-5',
        variant === 'horizontal' ? 'flex-1 justify-center' : '',
        variant === 'compact' ? 'flex-1 justify-center py-2' : ''
      ]"
    >
      <!-- Metadata supérieur -->
      <div
        v-if="(date || region) && variant !== 'featured'"
        class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2"
      >
        <span v-if="date" class="flex items-center">
          <font-awesome-icon icon="calendar" class="w-3 h-3 mr-1" />
          {{ formattedDate }}
        </span>
        <span v-if="region" class="flex items-center">
          <font-awesome-icon icon="location-dot" class="w-3 h-3 mr-1" />
          {{ region }}
        </span>
      </div>

      <!-- Catégorie (pour compact) -->
      <span
        v-if="category && variant === 'compact'"
        class="text-xs font-semibold uppercase tracking-wide text-ti-blue dark:text-ti-blue-400 mb-1"
      >
        {{ category }}
      </span>

      <!-- Titre -->
      <h3
        v-if="title"
        :class="[
          'font-heading font-bold uppercase tracking-wide',
          variant === 'compact' ? 'text-sm line-clamp-2' : 'text-lg lg:text-xl line-clamp-2',
          variant === 'featured' ? 'text-white' : 'text-gray-900 dark:text-white'
        ]"
      >
        <NuxtLink
          v-if="linkTo"
          :to="linkTo"
          class="hover:text-ti-blue dark:hover:text-ti-blue-400 transition-colors duration-200"
        >
          {{ title }}
        </NuxtLink>
        <span v-else>{{ title }}</span>
      </h3>

      <!-- Sous-titre -->
      <p
        v-if="subtitle && variant !== 'compact'"
        :class="[
          'text-sm mt-1',
          variant === 'featured' ? 'text-gray-200' : 'text-gray-600 dark:text-gray-400'
        ]"
      >
        {{ subtitle }}
      </p>

      <!-- Description -->
      <p
        v-if="description && variant !== 'compact'"
        :class="[
          'mt-3 text-sm line-clamp-3',
          variant === 'featured' ? 'text-gray-200' : 'text-gray-600 dark:text-gray-400'
        ]"
      >
        {{ description }}
      </p>

      <!-- Metadata pour featured -->
      <div
        v-if="(date || region) && variant === 'featured'"
        class="flex items-center gap-3 text-xs text-gray-300 mt-3"
      >
        <span v-if="date" class="flex items-center">
          <font-awesome-icon icon="calendar" class="w-3 h-3 mr-1" />
          {{ formattedDate }}
        </span>
        <span v-if="region" class="flex items-center">
          <font-awesome-icon icon="location-dot" class="w-3 h-3 mr-1" />
          {{ region }}
        </span>
      </div>

      <!-- Lien d'action -->
      <div v-if="linkTo && variant !== 'compact'" class="mt-4">
        <NuxtLink
          :to="linkTo"
          :class="[
            'inline-flex items-center text-sm font-semibold transition-colors duration-200',
            variant === 'featured'
              ? 'text-ti-blue-300 hover:text-white'
              : 'text-ti-blue hover:text-ti-blue-700 dark:text-ti-blue-400 dark:hover:text-ti-blue-300'
          ]"
        >
          {{ linkText }}
          <font-awesome-icon icon="arrow-right" class="w-3 h-3 ml-2" />
        </NuxtLink>
      </div>

      <!-- Slot pour contenu personnalisé -->
      <slot />
    </div>
  </article>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
