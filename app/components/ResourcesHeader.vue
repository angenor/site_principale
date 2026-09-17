<script setup lang="ts">
// En-tête de la rubrique Ressources et navigation entre ses sous-sections

defineProps<{
  subtitle: string
}>()

const sections = [
  { label: 'Rapports', to: '/ressources', icon: 'file-alt' },
  { label: 'Audios/Vidéos', to: '/ressources/audios-videos', icon: 'play' }
]

const route = useRoute()
</script>

<template>
  <section class="relative bg-gradient-to-br from-ti-blue via-ti-blue-600 to-ti-blue-800 text-white pt-16 lg:pt-24">
    <div class="absolute inset-0 bg-black/20" />
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-4xl lg:text-5xl font-bold mb-4">
          Ressources
        </h1>
        <p class="text-xl text-white/90 max-w-2xl mx-auto">
          {{ subtitle }}
        </p>
      </div>

      <nav aria-label="Sous-sections des ressources" class="mt-10 lg:mt-14 flex justify-center gap-2">
        <NuxtLink
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          :aria-current="route.path === section.to ? 'page' : undefined"
          :class="[
            'inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-t-xl font-heading font-semibold uppercase tracking-wide text-sm transition-colors',
            route.path === section.to
              ? 'bg-white text-ti-blue dark:bg-gray-800 dark:text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          ]"
        >
          <font-awesome-icon :icon="section.icon" />
          {{ section.label }}
        </NuxtLink>
      </nav>
    </div>
  </section>
</template>
