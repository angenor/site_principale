<script setup lang="ts">
// Téléchargement d'un rapport : lien direct s'il n'existe qu'une version, sinon choix de la langue

const props = defineProps<{
  resourceId: string
  title: string
  files: ResourceFileVersion[]
}>()

const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)

const single = computed(() => props.files.length === 1 ? props.files[0] : null)

function href(file: ResourceFileVersion): string {
  return file.externalUrl || file.fileUrl || '#'
}

function describe(file: ResourceFileVersion): string {
  if (file.externalUrl) return `Site source · ${getUrlHost(file.externalUrl)}`
  return [getFileExtension(file.filename), formatFileSize(file.fileSize)].filter(Boolean).join(' · ')
}

// Comptage sans bloquer l'ouverture du lien
function track() {
  isOpen.value = false
  $fetch('/api/track/download', {
    method: 'POST',
    body: { resourceId: props.resourceId }
  }).catch(() => {})
}

function onDocumentClick(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) isOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') isOpen.value = false
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="relative flex justify-end items-center gap-3">
    <!-- Une seule version -->
    <template v-if="single">
      <a
        v-if="single.fileUrl"
        :href="single.fileUrl"
        target="_blank"
        rel="noopener"
        class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="Voir le document"
      >
        <font-awesome-icon icon="eye" />
        <span class="sr-only">Voir le document {{ title }}</span>
      </a>
      <a
        :href="href(single)"
        target="_blank"
        :rel="single.externalUrl ? 'noopener noreferrer' : 'noopener'"
        :download="single.fileUrl ? (single.filename || '') : undefined"
        class="flex items-center uppercase text-blue-800 dark:text-blue-400 font-semibold text-xs hover:underline"
        :title="`${single.languageLabel} – ${describe(single)}`"
        @click="track"
      >
        <span class="mr-3 block w-8 h-0.5 bg-blue-800 dark:bg-blue-400" />
        télécharger
        <span class="ml-1.5 normal-case font-bold">({{ single.languageCode }})</span>
        <font-awesome-icon v-if="single.externalUrl" icon="external-link-alt" class="ml-1.5 text-[0.6rem]" />
      </a>
    </template>

    <!-- Plusieurs langues -->
    <template v-else-if="files.length > 1">
      <button
        type="button"
        class="flex items-center uppercase text-blue-800 dark:text-blue-400 font-semibold text-xs hover:underline cursor-pointer"
        :aria-expanded="isOpen"
        aria-haspopup="true"
        @click="isOpen = !isOpen"
      >
        <span class="mr-3 block w-8 h-0.5 bg-blue-800 dark:bg-blue-400" />
        télécharger
        <font-awesome-icon :icon="isOpen ? 'chevron-up' : 'chevron-down'" class="ml-1.5 text-[0.6rem]" />
      </button>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        leave-active-class="transition duration-100 ease-in"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isOpen"
          class="absolute bottom-full right-0 mb-2 w-64 z-30 rounded-lg bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black/10 dark:ring-white/10 py-1"
        >
          <p class="px-3 py-2 text-[0.7rem] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Choisir la langue
          </p>
          <a
            v-for="file in files"
            :key="file.id || file.languageCode"
            :href="href(file)"
            target="_blank"
            :rel="file.externalUrl ? 'noopener noreferrer' : 'noopener'"
            :download="file.fileUrl ? (file.filename || '') : undefined"
            class="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
            @click="track"
          >
            <span class="w-9 shrink-0 text-center text-xs font-bold py-1 rounded bg-ti-blue/10 text-ti-blue dark:text-blue-300">
              {{ file.languageCode }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium text-gray-900 dark:text-white">{{ file.languageLabel }}</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400 truncate">{{ describe(file) }}</span>
            </span>
            <font-awesome-icon
              :icon="file.externalUrl ? 'external-link-alt' : 'download'"
              class="text-xs text-gray-400"
            />
          </a>
        </div>
      </Transition>
    </template>
  </div>
</template>
