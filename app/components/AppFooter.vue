<script setup lang="ts">
const currentYear = new Date().getFullYear()

// Liens rapides
const quickLinks = [
  { name: 'Accueil', path: '/' },
  { name: 'Études de cas', path: '/cas' },
  { name: 'À propos', path: '/a-propos' },
  { name: 'Signaler un cas', path: '/signaler' }
]

// Réseaux sociaux
const socialLinks = [
  { name: 'Facebook', icon: ['fab', 'facebook-f'], url: 'https://www.facebook.com/transparency.mg' },
  { name: 'Twitter', icon: ['fab', 'twitter'], url: 'https://twitter.com/transparency_mg' },
  { name: 'LinkedIn', icon: ['fab', 'linkedin-in'], url: 'https://www.linkedin.com/company/transparency-international-initiative-madagascar' }
]
</script>

<template>
  <footer class="bg-gray-900 dark:bg-gray-950 text-white">
    <!-- Section principale -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        <!-- À propos -->
        <div class="lg:col-span-1">
          <div class="flex items-center mb-4">
            <img
              src="/images/logos/logo_fond_noire_texte_blanc.jpeg"
              alt="Observatoire des Mines de Madagascar"
              class="h-12 w-auto rounded"
            />
          </div>
          <p class="text-gray-400 text-sm leading-relaxed">
            L'Observatoire des Mines de Madagascar (MOM) promeut la transparence et la bonne gouvernance
            dans le secteur minier malgache.
          </p>
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
              <span class="text-gray-400">
                Lot IVG 167 Ter, Ambatoroka<br>
                Antananarivo 101, Madagascar
              </span>
            </li>
            <li class="flex items-center">
              <font-awesome-icon icon="envelope" class="w-4 h-4 mr-3 text-ti-blue-400" />
              <a href="mailto:vramaherison@transparency.mg" class="text-gray-400 hover:text-ti-blue-400 transition-colors duration-200">
                vramaherison@transparency.mg
              </a>
            </li>
            <li class="flex items-center">
              <font-awesome-icon icon="phone" class="w-4 h-4 mr-3 text-ti-blue-400" />
              <a href="tel:+261202230971" class="text-gray-400 hover:text-ti-blue-400 transition-colors duration-200">
                +261 20 22 309 71
              </a>
            </li>
          </ul>
        </div>

        <!-- Partenaires -->
        <div>
          <h3 class="font-heading font-bold text-lg uppercase tracking-wide mb-4 text-ti-blue-400">
            Partenaires
          </h3>
          <div class="space-y-4">
            <div>
              <p class="text-white font-semibold text-sm">Transparency International</p>
              <p class="text-gray-500 text-xs">Initiative Madagascar</p>
            </div>
            <div>
              <p class="text-white font-semibold text-sm">PCQVP Madagascar</p>
              <p class="text-gray-500 text-xs">Publiez Ce Que Vous Payez</p>
            </div>
          </div>

          <!-- Réseaux sociaux -->
          <div class="mt-6">
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
