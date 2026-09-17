<script setup lang="ts">
// Carte d'un audio/vidéo : ouvre le contenu sur le site source

const props = withDefaults(defineProps<{
  item: AudioVideoSummary
  /** Aperçu dans l'administration : pas de lien */
  preview?: boolean
}>(), {
  preview: false
})

defineEmits<{
  (e: 'select-category', categoryId: string): void
}>()

const { thumb } = useImageVariants()

const isAudio = computed(() => props.item.format === 'AUDIO')
const host = computed(() => getUrlHost(props.item.externalUrl))
const categoryColor = computed(() => props.item.category?.color || '#6B7280')

const formattedDate = computed(() => {
  if (!props.item.publishedAt) return ''
  return new Date(props.item.publishedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})
</script>

<template>
  <article
    :id="preview ? undefined : `av-${item.id}`"
    class="group relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 scroll-mt-28"
  >
    <!-- Couverture -->
    <div class="relative aspect-video bg-gray-900 overflow-hidden">
      <img
        v-if="item.coverImage"
        :src="thumb(item.coverImage)"
        alt=""
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-ti-blue to-ti-blue-800" />
      <div class="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors" />
      <span class="absolute inset-0 flex items-center justify-center">
        <span class="w-14 h-14 rounded-full bg-white/90 text-ti-blue flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
          <font-awesome-icon :icon="isAudio ? 'headphones' : 'play'" class="text-xl" :class="{ 'ml-1': !isAudio }" />
        </span>
      </span>
      <span class="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
        <font-awesome-icon :icon="isAudio ? 'headphones' : 'video'" class="text-[0.7rem]" />
        {{ isAudio ? 'Audio' : 'Vidéo' }}
      </span>
    </div>

    <!-- Informations -->
    <div class="flex flex-col flex-1 p-5">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-xs">
        <button
          v-if="item.category && !preview"
          type="button"
          class="relative z-10 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80"
          :style="{ backgroundColor: `${categoryColor}20`, color: categoryColor }"
          :title="`Voir la catégorie ${item.category.name}`"
          @click="$emit('select-category', item.category.id)"
        >
          <CategoryIcon :icon="item.category.icon" />
          {{ item.category.name }}
        </button>
        <span
          v-else-if="item.category"
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium"
          :style="{ backgroundColor: `${categoryColor}20`, color: categoryColor }"
        >
          <CategoryIcon :icon="item.category.icon" />
          {{ item.category.name }}
        </span>
        <time v-if="formattedDate" :datetime="item.publishedAt || undefined" class="text-gray-500 dark:text-gray-400">
          {{ formattedDate }}
        </time>
      </div>

      <h3 class="text-lg font-bold leading-snug text-gray-900 dark:text-white line-clamp-2">
        <a
          v-if="!preview"
          :href="item.externalUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="after:absolute after:inset-0 focus:outline-none focus-visible:underline"
        >
          {{ item.title }}
        </a>
        <template v-else>{{ item.title }}</template>
      </h3>

      <p v-if="item.description" class="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
        {{ item.description }}
      </p>

      <p v-if="item.speakers.length" class="mt-3 text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
        <font-awesome-icon icon="microphone" class="mt-1 text-xs text-gray-400" />
        <span><span class="sr-only">Intervenants : </span>{{ item.speakers.join(', ') }}</span>
      </p>

      <p class="mt-auto pt-4 text-xs font-semibold uppercase tracking-wide text-ti-blue dark:text-blue-400 flex items-center gap-2">
        {{ isAudio ? 'Écouter' : 'Regarder' }}<template v-if="host"> sur {{ host }}</template>
        <font-awesome-icon icon="external-link-alt" class="text-[0.65rem]" />
      </p>
    </div>
  </article>
</template>
