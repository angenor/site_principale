<script setup lang="ts">
// Images du slider (à terme, chargées depuis la base de données)
const slides = ref([
  {
    id: 1,
    image: '/images/hero/mining-1.jpg',
    title: 'Observatoire des Mines de Madagascar',
    subtitle: 'Promouvoir la transparence et la bonne gouvernance dans le secteur minier'
  },
  {
    id: 2,
    image: '/images/hero/mining-2.jpg',
    title: 'Transparence des revenus miniers',
    subtitle: 'Suivre l\'utilisation des revenus issus de l\'exploitation minière'
  },
  {
    id: 3,
    image: '/images/hero/community.jpg',
    title: 'Impact sur les communautés',
    subtitle: 'Documenter les effets de l\'exploitation minière sur les populations locales'
  }
])

const currentSlide = ref(0)
let slideInterval: ReturnType<typeof setInterval> | null = null

// Navigation du slider
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

const goToSlide = (index: number) => {
  currentSlide.value = index
  resetInterval()
}

// Auto-play
const startInterval = () => {
  slideInterval = setInterval(nextSlide, 6000)
}

const resetInterval = () => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
  startInterval()
}

onMounted(() => {
  startInterval()
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})
</script>

<template>
  <section class="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
    <!-- Slides -->
    <TransitionGroup name="slide">
      <div
        v-for="(slide, index) in slides"
        v-show="index === currentSlide"
        :key="slide.id"
        class="absolute inset-0"
      >
        <!-- Image de fond -->
        <div
          class="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          :style="{ backgroundImage: `url(${slide.image})` }"
        />
        <!-- Overlay gradient -->
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>
    </TransitionGroup>

    <!-- Contenu -->
    <div class="relative z-10 h-full flex items-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="max-w-2xl">
          <Transition name="fade-up" mode="out-in">
            <div :key="currentSlide">
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-heading font-bold uppercase text-white leading-tight mb-4">
                {{ slides[currentSlide].title }}
              </h1>
              <p class="text-lg md:text-xl text-gray-200 mb-8">
                {{ slides[currentSlide].subtitle }}
              </p>
            </div>
          </Transition>

          <!-- Boutons d'action -->
          <div class="flex flex-wrap gap-4">
            <NuxtLink to="/cas" class="btn-ti text-base">
              <font-awesome-icon icon="search" class="mr-2" />
              Explorer les cas
            </NuxtLink>
            <NuxtLink to="/signaler" class="btn-ti-outline text-white border-white hover:bg-white hover:text-ti-blue">
              <font-awesome-icon icon="bullhorn" class="mr-2" />
              Signaler
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation du slider -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
      <!-- Indicateurs -->
      <div class="flex gap-2">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id"
          @click="goToSlide(index)"
          :class="[
            'w-3 h-3 rounded-full transition-all duration-300 cursor-pointer',
            index === currentSlide
              ? 'bg-ti-blue w-8'
              : 'bg-white/50 hover:bg-white/75'
          ]"
          :aria-label="`Aller à la slide ${index + 1}`"
        />
      </div>
    </div>

    <!-- Flèches de navigation -->
    <button
      @click="prevSlide"
      class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-ti-blue transition-colors duration-200 cursor-pointer"
      aria-label="Slide précédente"
    >
      <font-awesome-icon icon="chevron-left" class="w-5 h-5" />
    </button>
    <button
      @click="nextSlide"
      class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-ti-blue transition-colors duration-200 cursor-pointer"
      aria-label="Slide suivante"
    >
      <font-awesome-icon icon="chevron-right" class="w-5 h-5" />
    </button>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 right-8 z-20 animate-bounce hidden md:block">
      <div class="flex flex-col items-center text-white/75 text-sm">
        <span class="mb-2">Défiler</span>
        <font-awesome-icon icon="chevron-down" class="w-4 h-4" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Transition du slider */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.7s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: scale(1.05);
}

.slide-leave-to {
  opacity: 0;
}

/* Transition du contenu texte */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.5s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
