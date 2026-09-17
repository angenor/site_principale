<script setup lang="ts">
// Icône facultative d'une catégorie : nom d'icône FontAwesome ou URL d'image personnalisée
const props = defineProps<{
  icon?: string | null
}>()

const isImage = computed(() => !!props.icon && (props.icon.startsWith('/') || props.icon.startsWith('http')))
</script>

<template>
  <img
    v-if="icon && isImage"
    :src="icon"
    alt=""
    class="inline-block w-[1.1em] h-[1.1em] object-contain align-[-0.15em]"
  />
  <font-awesome-icon v-else-if="icon" :icon="icon" />
</template>
