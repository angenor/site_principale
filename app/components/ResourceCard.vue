<script setup lang="ts">
// Carte d'un rapport à télécharger : couverture présentée comme une page de document

const props = withDefaults(defineProps<{
  item: ResourceSummary
  /** Aperçu dans l'administration : pas de lien ni de téléchargement */
  preview?: boolean
}>(), {
  preview: false
})

defineEmits<{
  (e: 'select-category', categoryId: string): void
}>()

const { thumb } = useImageVariants()

const categoryColor = computed(() => props.item.category?.color || '#6B7280')
const primaryFile = computed(() => props.item.files[0])
const isOnline = computed(() => !!primaryFile.value && !primaryFile.value.fileUrl && !!primaryFile.value.externalUrl)

// Format et poids du document (le poids n'a de sens que s'il n'y a qu'une version)
const formatLabel = computed(() => {
  const file = primaryFile.value
  if (!file) return 'Document'
  if (isOnline.value) return 'Document en ligne'
  const size = props.item.files.length === 1 ? formatFileSize(file.fileSize) : ''
  return [getFileExtension(file.filename) || 'Document', size].filter(Boolean).join(' · ')
})

const formatIcon = computed(() => isOnline.value ? 'link' : getFileIcon(primaryFile.value?.mimeType))

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
    :id="preview ? undefined : item.slug"
    class="group flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 scroll-mt-28"
  >
    <!-- Couverture -->
    <div class="relative aspect-[3/4] rounded-t-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
      <img
        v-if="item.coverImage"
        :src="thumb(item.coverImage)"
        :alt="`Couverture : ${item.title}`"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-ti-blue to-ti-blue-800 flex items-center justify-center">
        <font-awesome-icon :icon="formatIcon" class="text-6xl text-white/40" />
      </div>

      <!-- Coin de page corné -->
      <span
        aria-hidden="true"
        class="absolute top-0 right-0 w-10 h-10 shadow-[-3px_3px_4px_rgba(0,0,0,0.2)] bg-[linear-gradient(to_bottom_left,var(--color-white)_50%,var(--color-gray-200)_50%)] dark:bg-[linear-gradient(to_bottom_left,var(--color-gray-800)_50%,var(--color-gray-500)_50%)]"
      />

      <span class="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
        <font-awesome-icon :icon="formatIcon" class="text-[0.7rem]" />
        {{ formatLabel }}
      </span>
    </div>

    <!-- Informations -->
    <div class="flex flex-col flex-1 p-5">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-xs">
        <button
          v-if="item.category && !preview"
          type="button"
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80"
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
        {{ item.title }}
      </h3>

      <p v-if="item.authorName" class="mt-1 text-xs text-gray-600 dark:text-gray-300 truncate" :title="item.authorName">
        <font-awesome-icon icon="user" class="mr-1 text-gray-400" />
        {{ item.authorName }}
      </p>

      <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
        {{ item.description || 'Téléchargez ce rapport pour le consulter.' }}
      </p>

      <div class="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-700">
        <div v-if="item.files.length" class="flex flex-wrap items-center gap-1">
          <span class="sr-only">Langues disponibles :</span>
          <span
            v-for="file in item.files"
            :key="file.id || file.languageCode"
            class="px-1.5 py-0.5 rounded text-[0.65rem] font-bold bg-ti-blue/10 text-ti-blue dark:text-blue-300"
            :title="file.languageLabel"
          >
            {{ file.languageCode || '?' }}
          </span>
        </div>
        <span
          v-if="preview"
          class="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ti-blue text-white text-xs font-semibold"
        >
          <font-awesome-icon icon="download" />
          Télécharger
        </span>
        <ResourceDownloadMenu
          v-else
          class="ml-auto"
          :resource-id="item.id"
          :title="item.title"
          :files="item.files"
        />
      </div>
    </div>
  </article>
</template>
