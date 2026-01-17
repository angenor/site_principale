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

  // Configuration des transitions de pages et SEO
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    },
    head: {
      htmlAttrs: {
        lang: 'fr'
      },
      title: 'Observatoire des Mines de Madagascar',
      titleTemplate: '%s | MOM',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'L\'Observatoire des Mines de Madagascar (MOM) surveille la gouvernance, la transparence et la durabilité dans la gestion des ressources minières à Madagascar.' },
        { name: 'author', content: 'Transparency International - Initiative Madagascar' },
        { name: 'keywords', content: 'mines, Madagascar, transparence, gouvernance, EITI, ressources minières, TIMG, PCQVP' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Observatoire des Mines de Madagascar' },
        { property: 'og:locale', content: 'fr_MG' },
        { property: 'og:image', content: '/images/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@TI_Madagascar' },
        // Theme color
        { name: 'theme-color', content: '#3695d8' },
        // Robots
        { name: 'robots', content: 'index, follow' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'canonical', href: 'https://mom.transparency.mg' }
      ]
    }
  },

  modules: [
    '@nuxt/image',
    // '@nuxt/content',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    // '@nuxtjs/supabase' // Désactivé - on utilise FastAPI directement
  ],

  // Configuration du sitemap
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://mom.transparency.mg'
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/admin/**', '/admin'],
    defaults: {
      changefreq: 'weekly',
      priority: 0.8
    }
  },

  // Configuration de robots.txt
  robots: {
    allow: ['/'],
    disallow: ['/admin', '/api'],
    sitemap: '/sitemap.xml'
  },

  // Configuration des variables d'environnement
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://mom.transparency.mg'
    }
  },

  // Optimisation des images
  image: {
    quality: 80,
    format: ['webp', 'avif', 'jpeg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },

  // Configuration Nitro pour la performance
  nitro: {
    compressPublicAssets: true,
    // Prerendering desactive car les routes API necessitent la DB
    // qui n'est pas disponible pendant le build Docker
    prerender: {
      crawlLinks: false,
      routes: []
    }
  },

  // Configuration du cache pour les API publiques
  routeRules: {
    // Cache les données statiques (1 heure)
    '/api/categories': { cache: { maxAge: 3600 } },
    '/api/regions': { cache: { maxAge: 3600 } },
    '/api/strategic-axes': { cache: { maxAge: 3600 } },
    '/api/partners': { cache: { maxAge: 3600 } },
    '/api/config': { cache: { maxAge: 3600 } },
    '/api/about': { cache: { maxAge: 3600 } },
    // Cache les listes (10 minutes)
    '/api/cases': { cache: { maxAge: 600 } },
    '/api/cases/featured': { cache: { maxAge: 600 } },
    '/api/news': { cache: { maxAge: 600 } },
    '/api/gallery': { cache: { maxAge: 600 } },
    '/api/sliders': { cache: { maxAge: 600 } },
    // Cache les suggestions de recherche (5 minutes)
    '/api/search/suggestions': { cache: { maxAge: 300 } },
    // Pas de cache pour les routes admin et tracking
    '/api/admin/**': { cache: false },
    '/api/auth/**': { cache: false },
    '/api/track/**': { cache: false },
    '/api/contact': { cache: false }
  }
})