<template>
  <div class="space-y-4">
    <p class="text-sm text-[var(--text-muted)]">
      Liste de liens utiles avec descriptions et icônes.
    </p>

    <!-- Add link -->
    <div class="flex items-center gap-4">
      <UiButton variant="primary" size="sm" @click="addLink" :icon="['fas', 'plus']">
        Ajouter un lien
      </UiButton>
    </div>

    <!-- Links list -->
    <div v-if="localValue.liens.length === 0" class="p-8 bg-[var(--bg-secondary)] rounded-lg text-center">
      <font-awesome-icon :icon="['fas', 'link']" class="text-3xl text-[var(--text-muted)] mb-2" />
      <p class="text-[var(--text-muted)]">Aucun lien. Cliquez sur "Ajouter un lien" pour commencer.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(link, index) in localValue.liens"
        :key="index"
        class="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-default)]"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-[var(--text-primary)]">Lien {{ index + 1 }}</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="moveLink(index, -1)"
              :disabled="index === 0"
              class="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
            >
              <font-awesome-icon :icon="['fas', 'chevron-up']" />
            </button>
            <button
              type="button"
              @click="moveLink(index, 1)"
              :disabled="index === localValue.liens.length - 1"
              class="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
            >
              <font-awesome-icon :icon="['fas', 'chevron-down']" />
            </button>
            <button
              type="button"
              @click="removeLink(index)"
              class="p-1 text-red-500 hover:text-red-600"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormInput
            v-model="link.titre"
            label="Titre"
            placeholder="Titre du lien"
            required
          />

          <UiFormInput
            v-model="link.url"
            label="URL"
            placeholder="https://..."
            required
          />

          <UiFormInput
            v-model="link.description"
            label="Description (optionnel)"
            placeholder="Description courte"
          />

          <UiFormInput
            v-model="link.icone"
            label="Icône FontAwesome (optionnel)"
            placeholder="Ex: external-link-alt, file-pdf"
          />
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="localValue.liens.length > 0" class="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
      <p class="text-sm font-medium text-[var(--text-muted)] mb-3">Aperçu :</p>
      <ul class="space-y-2">
        <li
          v-for="(link, index) in localValue.liens"
          :key="index"
          class="flex items-start gap-3"
        >
          <font-awesome-icon
            :icon="['fas', link.icone || 'link']"
            class="text-[var(--color-primary)] mt-1"
          />
          <div>
            <a
              :href="link.url || '#'"
              target="_blank"
              rel="noopener"
              class="text-[var(--color-primary)] hover:underline font-medium"
            >
              {{ link.titre || 'Titre du lien' }}
            </a>
            <p v-if="link.description" class="text-sm text-[var(--text-muted)]">
              {{ link.description }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LinkItem {
  titre: string
  url: string
  description?: string
  icone?: string
}

interface LiensUtilesContent {
  liens: LinkItem[]
}

const props = defineProps<{
  modelValue: LiensUtilesContent
}>()

const emit = defineEmits<{
  'update:modelValue': [value: LiensUtilesContent]
}>()

const localValue = ref<LiensUtilesContent>({
  liens: props.modelValue?.liens || [],
})

const addLink = () => {
  localValue.value.liens.push({
    titre: '',
    url: '',
    description: '',
    icone: '',
  })
}

const removeLink = (index: number) => {
  localValue.value.liens.splice(index, 1)
}

const moveLink = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= localValue.value.liens.length) return

  const temp = localValue.value.liens[index]
  localValue.value.liens[index] = localValue.value.liens[newIndex]
  localValue.value.liens[newIndex] = temp
}

watch(localValue, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })
</script>
