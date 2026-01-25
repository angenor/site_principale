<script setup lang="ts">
// Metadonnees de la page
useHead({
  title: 'A propos - Observatoire des Mines de Madagascar',
  meta: [
    {
      name: 'description',
      content: 'Decouvrez l\'Observatoire des Mines de Madagascar (MOM), une initiative de Transparency International Madagascar pour promouvoir la transparence dans le secteur minier.'
    }
  ]
})

// Types
interface AboutSection {
  id: string
  title: string
  content: string
  image?: string | null
  sortOrder: number
}

// Fetch donnees dynamiques
const { data: sections } = await useFetch<AboutSection[]>('/api/about')
const { data: siteConfig } = await useFetch<Record<string, string>>('/api/config')

// Contact par defaut
const defaultContact = {
  address: 'Lot IVG 167 Ter, Ambatoroka\nAntananarivo 101\nMadagascar',
  email: 'vramaherison@transparency.mg',
  phone: '+261 20 22 309 71'
}

// Contact (dynamique ou fallback)
const contact = computed(() => ({
  address: siteConfig.value?.contact_address || defaultContact.address,
  email: siteConfig.value?.contact_email || defaultContact.email,
  phone: siteConfig.value?.contact_phone || defaultContact.phone
}))

// Icones alternees pour les sections
const sectionIcons = ['bullseye', 'eye', 'leaf', 'users', 'handshake', 'chart-line']
const sectionColors = ['ti-blue', 'ti-lime', 'ti-orange', 'green-500', 'purple-500', 'indigo-500']

function getIconForIndex(index: number): string {
  return sectionIcons[index % sectionIcons.length]
}

function getColorForIndex(index: number): string {
  return sectionColors[index % sectionColors.length]
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative py-20 lg:py-32 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-ti-blue-600 via-ti-blue-700 to-ti-blue-900" />
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: url('/images/pattern-mining.svg'); background-size: 100px;" />
      </div>

      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl lg:text-5xl font-heading font-bold uppercase text-white mb-6">
          A propos de l'Observatoire
        </h1>
        <p class="text-xl text-blue-100 max-w-2xl mx-auto">
          Une initiative citoyenne pour la transparence et la bonne gouvernance
          dans le secteur minier malgache.
        </p>
      </div>
    </section>

    <!-- Sections dynamiques -->
    <template v-if="sections && sections.length > 0">
      <section
        v-for="(section, index) in sections"
        :key="section.id"
        :class="[
          'py-16 lg:py-24',
          index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'
        ]"
      >
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div :class="[
            'flex flex-col gap-8',
            section.image ? 'lg:flex-row lg:items-start lg:gap-12' : ''
          ]">
            <!-- Contenu -->
            <div :class="section.image ? 'lg:flex-1' : 'w-full'">
              <!-- Titre avec icone -->
              <div class="flex items-center mb-6">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                  :class="`bg-${getColorForIndex(index)}/10`"
                >
                  <font-awesome-icon
                    :icon="getIconForIndex(index)"
                    class="w-6 h-6"
                    :class="`text-${getColorForIndex(index)}`"
                  />
                </div>
                <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white">
                  {{ section.title }}
                </h2>
              </div>

              <!-- Contenu HTML -->
              <div
                class="prose prose-lg dark:prose-invert max-w-none
                       prose-headings:font-heading prose-headings:uppercase
                       prose-a:text-ti-blue prose-a:no-underline hover:prose-a:underline
                       prose-img:rounded-lg prose-img:shadow-md
                       prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-700
                       prose-th:bg-gray-50 dark:prose-th:bg-gray-800 prose-th:p-3
                       prose-td:p-3 prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
                       prose-blockquote:border-l-ti-blue prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800
                       prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
                v-html="section.content"
              />
            </div>

            <!-- Image optionnelle -->
            <div v-if="section.image" class="lg:w-80 lg:flex-shrink-0">
              <img
                :src="section.image"
                :alt="section.title"
                class="w-full rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Message si aucune section -->
    <section v-else class="py-16 lg:py-24 bg-white dark:bg-gray-900">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <font-awesome-icon icon="info-circle" class="w-12 h-12 text-gray-400 mb-4" />
        <p class="text-gray-600 dark:text-gray-400">
          Le contenu de cette page est en cours de preparation.
        </p>
      </div>
    </section>

    <!-- Contact -->
    <section class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-4">
            Nous Contacter
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Pour toute question ou collaboration, n'hesitez pas a nous contacter.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Adresse -->
          <div class="text-center">
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-ti-blue/10 flex items-center justify-center">
              <font-awesome-icon icon="location-dot" class="w-6 h-6 text-ti-blue" />
            </div>
            <h3 class="font-heading font-bold text-gray-900 dark:text-white mb-2">Adresse</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
              {{ contact.address }}
            </p>
          </div>

          <!-- Email -->
          <div class="text-center">
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-ti-blue/10 flex items-center justify-center">
              <font-awesome-icon icon="envelope" class="w-6 h-6 text-ti-blue" />
            </div>
            <h3 class="font-heading font-bold text-gray-900 dark:text-white mb-2">Email</h3>
            <a
              :href="`mailto:${contact.email}`"
              class="text-ti-blue hover:text-ti-blue-700 dark:text-ti-blue-400"
            >
              {{ contact.email }}
            </a>
          </div>

          <!-- Telephone -->
          <div class="text-center">
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-ti-blue/10 flex items-center justify-center">
              <font-awesome-icon icon="phone" class="w-6 h-6 text-ti-blue" />
            </div>
            <h3 class="font-heading font-bold text-gray-900 dark:text-white mb-2">Telephone</h3>
            <a
              :href="`tel:${contact.phone.replace(/\s/g, '')}`"
              class="text-ti-blue hover:text-ti-blue-700 dark:text-ti-blue-400"
            >
              {{ contact.phone }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 lg:py-20 section-ti-blue">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-white mb-6">
          Rejoignez notre action
        </h2>
        <p class="text-blue-100 mb-8 max-w-xl mx-auto">
          Ensemble, oeuvrons pour une gouvernance miniere transparente et responsable a Madagascar.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <NuxtLink
            to="/signaler"
            class="inline-flex items-center px-6 py-3 bg-white text-ti-blue font-heading font-semibold uppercase tracking-wide rounded-lg hover:bg-gray-100 transition-colors"
          >
            <font-awesome-icon icon="bullhorn" class="mr-2" />
            Signaler un cas
          </NuxtLink>
          <NuxtLink
            to="/cas"
            class="inline-flex items-center px-6 py-3 border-2 border-white text-white font-heading font-semibold uppercase tracking-wide rounded-lg hover:bg-white/10 transition-colors"
          >
            Explorer les etudes
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Styles pour les checklists EditorJS */
:deep(.checklist) {
  list-style: none;
  padding-left: 0;
}

:deep(.checklist-item) {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

:deep(.checklist-item input[type="checkbox"]) {
  margin-top: 0.25rem;
  accent-color: #3695d8;
}

:deep(.checklist-item.checked span) {
  text-decoration: line-through;
  opacity: 0.7;
}

/* Styles pour les embeds */
:deep(.embed-responsive) {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

:deep(.embed-responsive iframe) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

:deep(.embed-responsive .caption) {
  position: relative;
  padding-top: 56.25%;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin-top: 0.5rem;
}

/* Styles pour les images */
:deep(.content-image) {
  margin: 1.5rem 0;
}

:deep(.content-image img) {
  border-radius: 0.5rem;
}

:deep(.content-image.with-border img) {
  border: 1px solid #e5e7eb;
}

:deep(.content-image.with-background) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
}

:deep(.content-image.stretched img) {
  width: 100%;
}

:deep(.content-image figcaption) {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin-top: 0.5rem;
}

.dark :deep(.content-image.with-border img) {
  border-color: #4b5563;
}

.dark :deep(.content-image.with-background) {
  background-color: #374151;
}

.dark :deep(.content-image figcaption) {
  color: #9ca3af;
}
</style>
