<template>
  <div class="space-y-4">
    <p class="text-sm text-[var(--text-muted)]">
      Grille de cartes informatives personnalisables.
    </p>

    <!-- Grid settings -->
    <div class="flex items-center gap-4">
      <UiFormSelect
        v-model="localValue.colonnes"
        label="Nombre de colonnes"
        :options="colonnesOptions"
        class="w-48"
      />
      <UiButton variant="primary" size="sm" @click="addCard" :icon="['fas', 'plus']">
        Ajouter une carte
      </UiButton>
    </div>

    <!-- Cards list -->
    <div v-if="localValue.cartes.length === 0" class="p-8 bg-[var(--bg-secondary)] rounded-lg text-center">
      <font-awesome-icon :icon="['fas', 'th-large']" class="text-3xl text-[var(--text-muted)] mb-2" />
      <p class="text-[var(--text-muted)]">Aucune carte. Cliquez sur "Ajouter une carte" pour commencer.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(card, index) in localValue.cartes"
        :key="index"
        class="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-default)]"
      >
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-[var(--text-primary)]">Carte {{ index + 1 }}</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="moveCard(index, -1)"
              :disabled="index === 0"
              class="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
            >
              <font-awesome-icon :icon="['fas', 'chevron-up']" />
            </button>
            <button
              type="button"
              @click="moveCard(index, 1)"
              :disabled="index === localValue.cartes.length - 1"
              class="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
            >
              <font-awesome-icon :icon="['fas', 'chevron-down']" />
            </button>
            <button
              type="button"
              @click="removeCard(index)"
              class="p-1 text-red-500 hover:text-red-600"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormInput
            v-model="card.titre"
            label="Titre"
            placeholder="Titre de la carte"
          />

          <UiFormInput
            v-model="card.icone"
            label="Icône FontAwesome"
            placeholder="Ex: chart-bar, users, building"
          />

          <div class="md:col-span-2">
            <UiFormTextarea
              v-model="card.description"
              label="Description"
              placeholder="Description de la carte"
              :rows="2"
            />
          </div>

          <UiFormInput
            v-model="card.lien"
            label="Lien (optionnel)"
            placeholder="https://..."
          />

          <UiFormInput
            v-model="card.image_url"
            label="Image URL (optionnel)"
            placeholder="URL de l'image"
          />
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="localValue.cartes.length > 0" class="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
      <p class="text-sm font-medium text-[var(--text-muted)] mb-3">Aperçu :</p>
      <div
        class="grid gap-4"
        :style="{ gridTemplateColumns: `repeat(${localValue.colonnes}, 1fr)` }"
      >
        <div
          v-for="(card, index) in localValue.cartes"
          :key="index"
          class="p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)]"
        >
          <div v-if="card.icone" class="mb-2">
            <font-awesome-icon :icon="['fas', card.icone]" class="text-xl text-[var(--color-primary)]" />
          </div>
          <h4 class="font-semibold text-[var(--text-primary)]">{{ card.titre || 'Titre' }}</h4>
          <p v-if="card.description" class="text-sm text-[var(--text-muted)] mt-1">
            {{ card.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CardContent {
  titre: string
  description?: string
  icone?: string
  lien?: string
  image_url?: string
}

interface GrilleCartesContent {
  cartes: CardContent[]
  colonnes: number
}

const props = defineProps<{
  modelValue: GrilleCartesContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GrilleCartesContent]
}>()

const localValue = ref<GrilleCartesContent>({
  cartes: props.modelValue?.cartes || [],
  colonnes: props.modelValue?.colonnes || 3,
})

const colonnesOptions = [
  { value: 2, label: '2 colonnes' },
  { value: 3, label: '3 colonnes' },
  { value: 4, label: '4 colonnes' },
]

const addCard = () => {
  localValue.value.cartes.push({
    titre: '',
    description: '',
    icone: '',
    lien: '',
    image_url: '',
  })
}

const removeCard = (index: number) => {
  localValue.value.cartes.splice(index, 1)
}

const moveCard = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= localValue.value.cartes.length) return

  const temp = localValue.value.cartes[index]
  localValue.value.cartes[index] = localValue.value.cartes[newIndex]
  localValue.value.cartes[newIndex] = temp
}

watch(localValue, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })
</script>
