<script setup lang="ts">
// Champs communs d'une catégorie (actualités, audios/vidéos) : page de gestion et création rapide
withDefaults(defineProps<{
  /** Replie la description derrière un lien (formulaire de création rapide) */
  compactDescription?: boolean
  nameInputId?: string
  namePlaceholder?: string
}>(), {
  compactDescription: false,
  nameInputId: undefined,
  namePlaceholder: 'Nom de la catégorie'
})

const name = defineModel<string>('name', { required: true })
const description = defineModel<string>('description', { required: true })
const color = defineModel<string>('color', { required: true })
const icon = defineModel<string | null>('icon', { default: null })

const showDescription = ref(false)

const inputClass = 'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
</script>

<template>
  <div class="space-y-4">
    <!-- Nom -->
    <div>
      <label :for="nameInputId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Nom *
      </label>
      <input
        :id="nameInputId"
        v-model="name"
        type="text"
        :class="inputClass"
        :placeholder="namePlaceholder"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Icône -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Icône <span class="text-xs font-normal text-gray-500 dark:text-gray-400">(facultative)</span>
        </label>
        <IconPicker v-model="icon" placeholder="Rechercher une icône..." />
      </div>

      <!-- Couleur -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model="color"
            type="color"
            class="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            v-model="color"
            type="text"
            class="flex-1 min-w-0 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="#3B82F6"
          />
        </div>
      </div>
    </div>

    <!-- Description -->
    <button
      v-if="compactDescription && !showDescription && !description"
      type="button"
      class="text-sm text-green-600 dark:text-green-400 hover:underline cursor-pointer"
      @click="showDescription = true"
    >
      <font-awesome-icon icon="plus" class="mr-1 text-xs" />
      Ajouter une description
    </button>
    <div v-else>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <textarea
        v-model="description"
        rows="2"
        :class="inputClass"
        placeholder="Description de la catégorie..."
      />
    </div>
  </div>
</template>
