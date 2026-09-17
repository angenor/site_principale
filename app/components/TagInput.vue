<script setup lang="ts">
interface Props {
  modelValue: string[]
  placeholder?: string
  suggestions?: string[]
  inputId?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Saisir puis appuyer sur Entrée',
  suggestions: () => [],
  inputId: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const draft = ref('')
const showSuggestions = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const filteredSuggestions = computed(() => {
  const query = draft.value.trim().toLowerCase()
  const selected = new Set(props.modelValue.map(v => v.toLowerCase()))
  return props.suggestions
    .filter(s => !selected.has(s.toLowerCase()))
    .filter(s => !query || s.toLowerCase().includes(query))
    .slice(0, 8)
})

function addValue(raw: string) {
  const value = raw.trim().replace(/\s+/g, ' ')
  if (!value) return
  const exists = props.modelValue.some(v => v.toLowerCase() === value.toLowerCase())
  if (!exists) {
    emit('update:modelValue', [...props.modelValue, value])
  }
}

function commitDraft() {
  // Permet de coller plusieurs valeurs séparées par des virgules ou points-virgules
  draft.value.split(/[,;]/).forEach(addValue)
  draft.value = ''
}

function addFromButton() {
  commitDraft()
  // Garder le curseur dans le champ pour enchaîner les saisies
  inputRef.value?.focus()
}

function removeAt(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',' || event.key === ';') {
    event.preventDefault()
    commitDraft()
  } else if (event.key === 'Backspace' && !draft.value && props.modelValue.length > 0) {
    removeAt(props.modelValue.length - 1)
  }
}

function selectSuggestion(value: string) {
  addValue(value)
  draft.value = ''
}

function onBlur() {
  // Laisser le temps au clic sur une suggestion d'être pris en compte
  setTimeout(() => {
    showSuggestions.value = false
    commitDraft()
  }, 150)
}
</script>

<template>
  <div class="relative">
    <div
      class="flex items-center gap-2 w-full pl-3 pr-1.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500"
    >
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0 py-0.5">
        <span
          v-for="(item, index) in modelValue"
          :key="`${item}-${index}`"
          class="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
        >
          {{ item }}
          <button
            type="button"
            class="w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer"
            :aria-label="`Retirer ${item}`"
            @click="removeAt(index)"
          >
            <font-awesome-icon icon="xmark" class="text-xs" />
          </button>
        </span>
        <input
          :id="inputId"
          ref="inputRef"
          v-model="draft"
          type="text"
          autocomplete="off"
          class="flex-1 min-w-[6rem] py-1 bg-transparent border-0 p-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 focus:outline-none"
          :placeholder="modelValue.length ? '' : placeholder"
          @keydown="onKeydown"
          @focus="showSuggestions = true"
          @blur="onBlur"
        />
      </div>
      <!-- mousedown.prevent : le champ garde le focus, le blur ne valide pas en doublon -->
      <button
        type="button"
        class="shrink-0 self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-600 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
        :disabled="!draft.trim()"
        @mousedown.prevent
        @click="addFromButton"
      >
        <font-awesome-icon icon="plus" class="text-xs" />
        Ajouter
      </button>
    </div>
    <ul
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg"
    >
      <li v-for="suggestion in filteredSuggestions" :key="suggestion">
        <button
          type="button"
          class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
          @mousedown.prevent="selectSuggestion(suggestion)"
        >
          {{ suggestion }}
        </button>
      </li>
    </ul>
  </div>
</template>
