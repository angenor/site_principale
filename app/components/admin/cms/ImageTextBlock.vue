<template>
  <div class="space-y-4">
    <p class="text-sm text-[var(--text-muted)]">
      Bloc avec image {{ imagePosition === 'left' ? 'à gauche' : 'à droite' }} et texte.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Image upload -->
      <div :class="{ 'md:order-2': imagePosition === 'right' }">
        <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Image
        </label>
        <div
          class="border-2 border-dashed border-[var(--border-default)] rounded-lg p-4 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />

          <div v-if="localValue.image_url" class="relative">
            <img
              :src="localValue.image_url"
              :alt="localValue.image_alt || 'Image'"
              class="max-h-48 mx-auto rounded"
            />
            <button
              type="button"
              @click.stop="removeImage"
              class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="w-3 h-3" />
            </button>
          </div>

          <div v-else class="py-8">
            <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" class="text-3xl text-[var(--text-muted)] mb-2" />
            <p class="text-sm text-[var(--text-muted)]">
              Cliquez ou déposez une image ici
            </p>
          </div>
        </div>

        <UiFormInput
          v-model="localValue.image_url"
          label=""
          placeholder="Ou entrez l'URL de l'image"
          class="mt-2"
        />

        <UiFormInput
          v-model="localValue.image_alt"
          label="Texte alternatif"
          placeholder="Description de l'image"
          class="mt-2"
        />
      </div>

      <!-- Text content -->
      <div>
        <UiFormInput
          v-model="localValue.titre"
          label="Titre (optionnel)"
          placeholder="Titre du bloc"
          class="mb-4"
        />

        <UiFormTextarea
          v-model="localValue.texte"
          label="Texte"
          placeholder="Contenu du bloc..."
          :rows="8"
        />
      </div>
    </div>

    <!-- Preview -->
    <div v-if="localValue.image_url || localValue.texte" class="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
      <p class="text-sm font-medium text-[var(--text-muted)] mb-3">Aperçu :</p>
      <div class="flex gap-4" :class="{ 'flex-row-reverse': imagePosition === 'right' }">
        <div v-if="localValue.image_url" class="w-1/3 flex-shrink-0">
          <img
            :src="localValue.image_url"
            :alt="localValue.image_alt || 'Image'"
            class="w-full rounded"
          />
        </div>
        <div class="flex-1">
          <h3 v-if="localValue.titre" class="font-semibold text-[var(--text-primary)] mb-2">
            {{ localValue.titre }}
          </h3>
          <p class="text-[var(--text-secondary)] whitespace-pre-wrap">{{ localValue.texte }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ImageTextContent {
  image_url: string
  image_alt?: string
  titre?: string
  texte: string
}

const props = defineProps<{
  modelValue: ImageTextContent
  imagePosition: 'left' | 'right'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ImageTextContent]
}>()

const fileInput = ref<HTMLInputElement>()

const localValue = ref<ImageTextContent>({
  image_url: props.modelValue?.image_url || '',
  image_alt: props.modelValue?.image_alt || '',
  titre: props.modelValue?.titre || '',
  texte: props.modelValue?.texte || '',
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    handleFile(input.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file?.type.startsWith('image/')) {
    handleFile(file)
  }
}

const handleFile = (file: File) => {
  // In production, this would upload to server
  // For now, create a data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    localValue.value.image_url = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  localValue.value.image_url = ''
  localValue.value.image_alt = ''
}

watch(localValue, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })
</script>
