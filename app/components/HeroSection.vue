<script setup lang="ts">
const emit = defineEmits<{
  search: [communeId: string, annee: number]
}>()

const { isDark } = useDarkMode()

// Logo dynamique basé sur le thème
const logoSrc = computed(() => {
  return isDark.value
    ? '/images/logos/logo_fond_noire_texte_blanc.jpeg'
    : '/images/logos/logo_fond_noire_texte_bleu.jpeg'
})

// États
const selectedProvince = ref<string>('')
const selectedRegion = ref<string>('')
const selectedCommune = ref<string>('')
const selectedAnnee = ref<number>(2024)


// Années disponibles
const annees = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
})

</script>

<template>
  <section class="relative min-h-[600px] pt-20 lg:min-h-[700px] flex items-center overflow-hidden">
    <!-- Logo en haut à gauche -->
    <div class="absolute top-6 left-6 z-30">
      <div class="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
        <img
          :src="logoSrc"
          :key="logoSrc"
          alt="TI Madagascar"
          class="h-12 lg:h-16 w-auto object-contain transition-opacity duration-300"
        />
      </div>
    </div>

    <!-- Bouton de changement de thème en haut à droite -->
    <div class="absolute top-6 right-6 z-30">
      <ThemeToggle />
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
      <svg class="w-6 h-6 text-white opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
</template>

<style scoped>
/* Animations personnalisées */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out 0.2s both;
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out 0.4s both;
}

.animate-slide-up-delayed {
  animation: slide-up 1s ease-out 0.6s both;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Effet glassmorphism amélioré */
select {
  backdrop-filter: blur(10px);
}

/* Print styles */
@media print {
  section {
    min-height: auto;
    page-break-inside: avoid;
  }

  .animate-bounce {
    display: none;
  }
}

/* Rainbow animated border */
.rainbow-border-wrapper {
  position: relative;
  border-radius: 1rem;
}

.rainbow-border-wrapper::before,
.rainbow-border-wrapper::after {
  content: '';
  position: absolute;
  inset: -3px;
  z-index: -1;
  border-radius: 1.1rem;
  background: linear-gradient(
    45deg,
    #fb0094,
    #0000ff,
    #00ff00,
    #ffff00,
    #ff0000,
    #fb0094,
    #0000ff,
    #00ff00,
    #ffff00,
    #ff0000
  );
  background-size: 400%;
  animation: steam 45s linear infinite;
}

.rainbow-border-wrapper::after {
  filter: blur(10px);
}

@keyframes steam {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
