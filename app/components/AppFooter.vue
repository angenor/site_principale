<script setup lang="ts">
interface Partner {
  id: string
  name: string
  logo: string
  websiteUrl: string | null
  description: string | null
}

const currentYear = new Date().getFullYear()

// Utiliser la config partagée
const { siteConfig, getConfig } = useAppSettings()

// Charger les partenaires
const { data: partners } = await useFetch<Partner[]>('/api/partners')

// Partenaires pour le footer (limité à 3)
const footerPartners = computed(() => {
  return (partners.value || []).slice(0, 3)
})

// Liens rapides
const quickLinks = [
  { name: 'Accueil', path: '/' },
  { name: 'Études de cas', path: '/cas' },
  { name: 'À propos', path: '/a-propos' },
  { name: 'Signaler un cas', path: '/signaler' }
]

// Contact dynamique
const contactEmail = computed(() => getConfig('contact_email', 'vramaherison@transparency.mg'))
const contactPhone = computed(() => getConfig('contact_phone', '+261 20 22 309 71'))
const contactAddress = computed(() => getConfig('contact_address', 'Lot IVG 167 Ter, Ambatoroka\nAntananarivo 101, Madagascar'))

// Configuration des réseaux sociaux
const socialConfig = [
  { key: 'social_facebook', name: 'Facebook', icon: ['fab', 'facebook-f'] },
  { key: 'social_twitter', name: 'X', icon: ['fab', 'x-twitter'] },
  { key: 'social_youtube', name: 'YouTube', icon: ['fab', 'youtube'] },
  { key: 'social_linkedin', name: 'LinkedIn', icon: ['fab', 'linkedin-in'] }
]

// Réseaux sociaux dynamiques (seulement ceux avec une URL configurée)
const socialLinks = computed(() => {
  return socialConfig
    .filter(social => siteConfig.value?.[social.key])
    .map(social => ({
      name: social.name,
      icon: social.icon,
      url: siteConfig.value?.[social.key] || ''
    }))
})

// Abonnement aux newsletters
const newsletterForm = reactive({ name: '', email: '', website: '' })
const newsletterStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const newsletterMessage = ref('')

async function subscribeNewsletter() {
  if (newsletterStatus.value === 'loading') return
  newsletterStatus.value = 'loading'
  newsletterMessage.value = ''

  try {
    const response = await $fetch<{ message: string }>('/api/newsletter/subscribe', {
      method: 'POST',
      body: { ...newsletterForm }
    })
    newsletterStatus.value = 'success'
    newsletterMessage.value = response.message
    newsletterForm.name = ''
    newsletterForm.email = ''
  } catch (error: unknown) {
    const fetchError = error as { data?: { statusMessage?: string } }
    newsletterStatus.value = 'error'
    newsletterMessage.value = fetchError.data?.statusMessage || 'Une erreur est survenue. Veuillez réessayer.'
  }
}
</script>

<template>
  <footer class="bg-gray-900 dark:bg-gray-950 text-white">
    <!-- Abonnement aux newsletters -->
    <div id="newsletter" class="border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-center">
          <div class="lg:col-span-2">
            <h3 class="font-heading font-bold text-xl uppercase tracking-wide text-ti-blue-400 flex items-center gap-3">
              <font-awesome-icon icon="envelope" class="w-5 h-5" />
              S’abonner aux newsletters de l’Observatoire
            </h3>
            <p class="mt-2 text-sm text-gray-400">
              Recevez par e-mail les nouvelles actualités et études de cas publiées par l’Observatoire.
            </p>
          </div>

          <form class="lg:col-span-3" novalidate @submit.prevent="subscribeNewsletter">
            <div class="flex flex-col sm:flex-row gap-3">
              <label class="sr-only" for="newsletter-name">Nom (personne ou organisation)</label>
              <input
                id="newsletter-name"
                v-model="newsletterForm.name"
                type="text"
                required
                maxlength="200"
                autocomplete="name"
                placeholder="Nom ou organisation"
                class="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
              />
              <label class="sr-only" for="newsletter-email">Adresse électronique</label>
              <input
                id="newsletter-email"
                v-model="newsletterForm.email"
                type="email"
                required
                maxlength="254"
                autocomplete="email"
                placeholder="Adresse électronique"
                class="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-ti-blue focus:border-ti-blue"
              />
              <!-- Champ piège anti-robots, invisible pour les visiteurs -->
              <input
                v-model="newsletterForm.website"
                type="text"
                name="website"
                tabindex="-1"
                autocomplete="off"
                aria-hidden="true"
                class="hidden"
              />
              <button
                type="submit"
                :disabled="newsletterStatus === 'loading'"
                class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-ti-blue hover:bg-ti-blue-600 text-white text-sm font-semibold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                <font-awesome-icon
                  :icon="newsletterStatus === 'loading' ? 'spinner' : 'paper-plane'"
                  :class="{ 'animate-spin': newsletterStatus === 'loading' }"
                  class="w-4 h-4"
                />
                S’abonner
              </button>
            </div>
            <p
              v-if="newsletterMessage"
              role="status"
              aria-live="polite"
              :class="newsletterStatus === 'success' ? 'text-green-400' : 'text-red-400'"
              class="mt-3 text-sm flex items-center gap-2"
            >
              <font-awesome-icon :icon="newsletterStatus === 'success' ? 'check-circle' : 'circle-exclamation'" class="w-4 h-4" />
              {{ newsletterMessage }}
            </p>
          </form>
        </div>
      </div>
    </div>

    <!-- Section principale -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        <!-- Logo -->
        <div class="lg:col-span-1">
          <div class="mb-4">
            <img
              src="/images/logos/MOM_White_300x-8_avec_text.png"
              alt="Observatoire des Mines de Madagascar"
              class="h-32 w-auto object-contain"
            />
          </div>
        </div>

        <!-- Liens rapides -->
        <div>
          <h3 class="font-heading font-bold text-lg uppercase tracking-wide mb-4 text-ti-blue-400">
            Navigation
          </h3>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.path">
              <NuxtLink
                :to="link.path"
                class="text-gray-400 hover:text-ti-blue-400 transition-colors duration-200 text-sm"
              >
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="font-heading font-bold text-lg uppercase tracking-wide mb-4 text-ti-blue-400">
            Contact
          </h3>
          <ul class="space-y-3 text-sm">
            <li class="flex items-start">
              <font-awesome-icon icon="location-dot" class="w-4 h-4 mt-1 mr-3 text-ti-blue-400" />
              <span class="text-gray-400 whitespace-pre-line">{{ contactAddress }}</span>
            </li>
            <li class="flex items-center">
              <font-awesome-icon icon="envelope" class="w-4 h-4 mr-3 text-ti-blue-400" />
              <a :href="`mailto:${contactEmail}`" class="text-gray-400 hover:text-ti-blue-400 transition-colors duration-200">
                {{ contactEmail }}
              </a>
            </li>
            <li class="flex items-center">
              <font-awesome-icon icon="phone" class="w-4 h-4 mr-3 text-ti-blue-400" />
              <a :href="`tel:${contactPhone.replace(/\s/g, '')}`" class="text-gray-400 hover:text-ti-blue-400 transition-colors duration-200">
                {{ contactPhone }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Partenaires & Réseaux sociaux -->
        <div>
          <h3 class="font-heading font-bold text-lg uppercase tracking-wide mb-4 text-ti-blue-400">
            Partenaires
          </h3>
          <div class="space-y-3">
            <div v-for="partner in footerPartners" :key="partner.id">
              <a
                v-if="partner.websiteUrl"
                :href="partner.websiteUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-white font-semibold text-sm hover:text-ti-blue-400 transition-colors duration-200"
              >
                {{ partner.name }}
              </a>
              <p v-else class="text-white font-semibold text-sm">{{ partner.name }}</p>
              <p v-if="partner.description" class="text-gray-500 text-xs">{{ partner.description }}</p>
            </div>
          </div>

          <!-- Réseaux sociaux -->
          <div v-if="socialLinks.length > 0" class="mt-6">
            <p class="text-gray-400 text-sm mb-3">Suivez-nous sur les réseaux sociaux</p>
            <div class="flex space-x-3">
              <a
                v-for="social in socialLinks"
                :key="social.name"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="social.name"
                class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-ti-blue hover:text-white transition-all duration-200 cursor-pointer"
              >
                <font-awesome-icon :icon="social.icon" class="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barre de copyright -->
    <div class="border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p class="text-gray-500 text-sm text-center md:text-left">
            &copy; {{ currentYear }} Transparency International - Initiative Madagascar. Tous droits réservés.
          </p>
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <NuxtLink to="/mentions-legales" class="hover:text-ti-blue-400 transition-colors duration-200">
              Mentions légales
            </NuxtLink>
            <span>|</span>
            <NuxtLink to="/confidentialite" class="hover:text-ti-blue-400 transition-colors duration-200">
              Confidentialité
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Signature développeur -->
    <div class="border-t border-gray-800/50 bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <p class="text-center text-gray-600 text-xs">
          Développé par
          <a
            href="https://www.linkedin.com/company/herhero-forchange/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-ti-blue-400 hover:text-ti-blue-300 transition-colors duration-200 font-medium cursor-pointer"
          >
            HerHero
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>
