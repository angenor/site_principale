<template>
  <div class="space-y-4">
    <p class="text-sm text-[var(--text-muted)]">
      Galerie d'images avec légendes optionnelles.
    </p>

    <!-- Add image -->
    <div class="flex items-center gap-4">
      <UiButton variant="primary" size="sm" @click="addImage" :icon="['fas', 'plus']">
        Ajouter une image
      </UiButton>
    </div>

    <!-- Images list -->
    <div v-if="localValue.images.length === 0" class="p-8 bg-[var(--bg-secondary)] rounded-lg text-center">
      <font-awesome-icon :icon="['fas', 'images']" class="text-3xl text-[var(--text-muted)] mb-2" />
      <p class="text-[var(--text-muted)]">Aucune image. Cliquez sur "Ajouter une image" pour commencer.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="(image, index) in localValue.images"
        :key="index"
        class="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-default)]"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-[var(--text-primary)]">Image {{ index + 1 }}</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="moveImage(index, -1)"
              :disabled="index === 0"
              class="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <button
              type="button"
              @click="moveImage(index, 1)"
              :disabled="index === localValue.images.length - 1"
              class="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
            <button
              type="button"
              @click="removeImage(index)"
              class="p-1 text-red-500 hover:text-red-600"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>

        <!-- Image preview -->
        <div
          v-if="image.url"
          class="mb-3 aspect-video bg-[var(--bg-card)] rounded overflow-hidden"
        >
          <img
            :src="image.url"
            :alt="image.alt || 'Image'"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="space-y-3">
          <UiFormInput
            v-model="image.url"
            label="URL de l'image"
            placeholder="https://..."
          />

          <UiFormInput
            v-model="image.alt"
            label="Texte alternatif"
            placeholder="Description de l'image"
          />

          <UiFormInput
            v-model="image.legende"
            label="Légende (optionnel)"
            placeholder="Légende affichée sous l'image"
          />
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="localValue.images.length > 0" class="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
      <p class="text-sm font-medium text-[var(--text-muted)] mb-3">Aperçu de la galerie :</p>
      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="(image, index) in localValue.images"
          :key="index"
          class="relative group"
        >
          <div class="aspect-square bg-[var(--bg-card)] rounded overflow-hidden">
            <img
              v-if="image.url"
              :src="image.url"
              :alt="image.alt || 'Image'"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
              <font-awesome-icon :icon="['fas', 'image']" />
            </div>
          </div>
          <p v-if="image.legende" class="text-xs text-[var(--text-muted)] mt-1 truncate">
            {{ image.legende }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GalleryImage {
  url: string
  alt?: string
  legende?: string
}

interface GaleriePhotosContent {
  images: GalleryImage[]
}

const props = defineProps<{
  modelValue: GaleriePhotosContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GaleriePhotosContent]
}>()

const localValue = ref<GaleriePhotosContent>({
  images: props.modelValue?.images || [],
})

const addImage = () => {
  localValue.value.images.push({
    url: '',
    alt: '',
    legende: '',
  })
}

const removeImage = (index: number) => {
  localValue.value.images.splice(index, 1)
}

const moveImage = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= localValue.value.images.length) return

  const temp = localValue.value.images[index]
  localValue.value.images[index] = localValue.value.images[newIndex]
  localValue.value.images[newIndex] = temp
}

watch(localValue, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })
</script>
