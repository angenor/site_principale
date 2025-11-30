// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css',
    'animate.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // Configuration des transitions de pages
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  modules: [
    '@nuxt/image',
    '@nuxt/content',
    '@nuxt/test-utils',
    '@nuxt/ui',
    // '@nuxtjs/supabase' // Désactivé - on utilise FastAPI directement
  ],

  // Configuration des variables d'environnement
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    }
  }
})