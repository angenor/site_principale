<script setup lang="ts">
// Axes stratégiques (à terme, chargés depuis la base de données)
const axes = ref([
  {
    id: 1,
    title: 'Transparence',
    description: 'Promouvoir la divulgation des informations sur les activités minières et les flux financiers.',
    icon: 'eye',
    color: '#3695d8' // ti-blue
  },
  {
    id: 2,
    title: 'Redevabilité',
    description: 'Assurer que les acteurs du secteur minier rendent compte de leurs actions et engagements.',
    icon: 'scale-balanced',
    color: '#22c55e' // success
  },
  {
    id: 3,
    title: 'Durabilité',
    description: 'Encourager des pratiques minières respectueuses de l\'environnement et des générations futures.',
    icon: 'leaf',
    color: '#c4d600' // ti-lime
  },
  {
    id: 4,
    title: 'Inclusion',
    description: 'Garantir la participation des communautés locales dans les décisions affectant leurs territoires.',
    icon: 'users',
    color: '#ffb81c' // ti-orange
  }
])
</script>

<template>
  <section class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Titre de section -->
      <div class="text-center mb-12">
        <h2 class="text-3xl lg:text-4xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-4">
          Nos Axes Stratégiques
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Quatre piliers fondamentaux pour une gouvernance minière responsable à Madagascar
        </p>
      </div>

      <!-- Grille des axes -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <article
          v-for="axe in axes"
          :key="axe.id"
          class="group bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Icône -->
          <div
            class="w-16 h-16 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
            :style="{ backgroundColor: axe.color + '20' }"
          >
            <font-awesome-icon
              :icon="axe.icon"
              class="w-8 h-8"
              :style="{ color: axe.color }"
            />
          </div>

          <!-- Contenu -->
          <h3 class="text-xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-3">
            {{ axe.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {{ axe.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
