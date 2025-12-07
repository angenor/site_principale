<template>
  <div class="space-y-4">
    <p class="text-sm text-[var(--text-muted)]">
      Carte avec image de fond et texte en superposition.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Title -->
      <UiFormInput
        v-model="localValue.titre"
        label="Titre"
        placeholder="Titre principal"
      />

      <!-- Subtitle -->
      <UiFormInput
        v-model="localValue.sous_titre"
        label="Sous-titre (optionnel)"
        placeholder="Sous-titre"
      />

      <!-- Description -->
      <div class="md:col-span-2">
        <UiFormTextarea
          v-model="localValue.description"
          label="Description"
          placeholder="Description affichée sur la carte"
          :rows="3"
        />
      </div>

      <!-- Image URL -->
      <UiFormInput
        v-model="localValue.image_url"
        label="URL de l'image de fond"
        placeholder="https://..."
      />

      <!-- Link -->
      <UiFormInput
        v-model="localValue.lien"
        label="Lien (optionnel)"
        placeholder="https://..."
      />

      <!-- Overlay options -->
      <div>
        <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Couleur de l'overlay
        </label>
        <div class="flex items-center gap-2">
          <input
            type="color"
            v-model="localValue.overlay_color"
            class="w-10 h-10 rounded border border-[var(--border-default)] cursor-pointer"
          />
          <input
            v-model="localValue.overlay_color"
            type="text"
            class="flex-1 px-3 py-2 border border-[var(--border-default)] rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)]"
            placeholder="#000000"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Opacité de l'overlay
        </label>
        <div class="flex items-center gap-3">
          <input
            type="range"
            v-model.number="localValue.overlay_opacity"
            min="0"
            max="100"
            class="flex-1"
          />
          <span class="text-sm text-[var(--text-secondary)] w-12">{{ localValue.overlay_opacity }}%</span>
        </div>
      </div>

      <!-- Text position -->
      <div>
        <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Position du texte
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="pos in positionOptions"
            :key="pos.value"
            type="button"
            @click="localValue.text_position = pos.value"
            :class="[
              'p-2 rounded border transition-colors text-sm',
              localValue.text_position === pos.value
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                : 'border-[var(--border-default)] hover:border-[var(--color-primary)]/50'
            ]"
          >
            {{ pos.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div class="mt-6">
      <p class="text-sm font-medium text-[var(--text-muted)] mb-3">Aperçu :</p>
      <div
        class="relative h-64 rounded-xl overflow-hidden"
        :style="{ backgroundImage: localValue.image_url ? `url(${localValue.image_url})` : 'none' }"
        :class="{ 'bg-gray-300 dark:bg-gray-700': !localValue.image_url }"
      >
        <!-- Overlay -->
        <div
          class="absolute inset-0"
          :style="{
            backgroundColor: localValue.overlay_color || '#000000',
            opacity: (localValue.overlay_opacity || 50) / 100
          }"
        />

        <!-- Content -->
        <div
          class="absolute inset-0 p-6 flex flex-col text-white"
          :class="getPositionClasses(localValue.text_position)"
        >
          <h3 class="text-2xl font-bold">{{ localValue.titre || 'Titre' }}</h3>
          <p v-if="localValue.sous_titre" class="text-lg opacity-80 mt-1">
            {{ localValue.sous_titre }}
          </p>
          <p v-if="localValue.description" class="mt-2 opacity-90">
            {{ localValue.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CardBackgroundContent {
  titre: string
  sous_titre?: string
  description?: string
  image_url: string
  lien?: string
  overlay_color?: string
  overlay_opacity?: number
  text_position?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

const props = defineProps<{
  modelValue: CardBackgroundContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CardBackgroundContent]
}>()

const localValue = ref<CardBackgroundContent>({
  titre: props.modelValue?.titre || '',
  sous_titre: props.modelValue?.sous_titre || '',
  description: props.modelValue?.description || '',
  image_url: props.modelValue?.image_url || '',
  lien: props.modelValue?.lien || '',
  overlay_color: props.modelValue?.overlay_color || '#000000',
  overlay_opacity: props.modelValue?.overlay_opacity ?? 50,
  text_position: props.modelValue?.text_position || 'bottom-left',
})

const positionOptions = [
  { value: 'top-left' as const, label: '↖ Haut gauche' },
  { value: 'top-center' as const, label: '↑ Haut centre' },
  { value: 'top-right' as const, label: '↗ Haut droite' },
  { value: 'center-left' as const, label: '← Centre gauche' },
  { value: 'center' as const, label: '• Centre' },
  { value: 'center-right' as const, label: '→ Centre droite' },
  { value: 'bottom-left' as const, label: '↙ Bas gauche' },
  { value: 'bottom-center' as const, label: '↓ Bas centre' },
  { value: 'bottom-right' as const, label: '↘ Bas droite' },
]

const getPositionClasses = (position: string | undefined) => {
  switch (position) {
    case 'top-left': return 'justify-start items-start'
    case 'top-center': return 'justify-start items-center text-center'
    case 'top-right': return 'justify-start items-end text-right'
    case 'center-left': return 'justify-center items-start'
    case 'center': return 'justify-center items-center text-center'
    case 'center-right': return 'justify-center items-end text-right'
    case 'bottom-left': return 'justify-end items-start'
    case 'bottom-center': return 'justify-end items-center text-center'
    case 'bottom-right': return 'justify-end items-end text-right'
    default: return 'justify-end items-start'
  }
}

watch(localValue, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })
</script>
