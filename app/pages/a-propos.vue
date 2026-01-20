<script setup lang="ts">
// Métadonnées de la page
useHead({
  title: 'À propos - Observatoire des Mines de Madagascar',
  meta: [
    {
      name: 'description',
      content: 'Découvrez l\'Observatoire des Mines de Madagascar (MOM), une initiative de Transparency International Madagascar et PCQVP pour promouvoir la transparence dans le secteur minier.'
    }
  ]
})

// Types
interface AboutSection {
  title: string
  content: string
  image?: string
}

interface TimelineEvent {
  id: string
  year: string
  title: string
  description: string
  image?: string | null
}

// Fetch données dynamiques
const { data: aboutContent } = await useFetch<Record<string, AboutSection>>('/api/about')
const { data: timelineData } = await useFetch<TimelineEvent[]>('/api/timeline')
const { data: siteConfig } = await useFetch<Record<string, string>>('/api/config')

// Timeline par défaut (fallback)
const defaultTimeline = [
  {
    id: '1',
    year: '2000',
    title: 'Création de TI Madagascar',
    description: 'Transparency International - Initiative Madagascar est fondée pour lutter contre la corruption.'
  },
  {
    id: '2',
    year: '2006',
    title: 'Adhésion à EITI',
    description: 'Madagascar adhère à l\'Initiative pour la Transparence dans les Industries Extractives.'
  },
  {
    id: '3',
    year: '2015',
    title: 'Coalition PCQVP',
    description: 'Renforcement de la coalition Publiez Ce Que Vous Payez à Madagascar.'
  },
  {
    id: '4',
    year: '2025',
    title: 'Lancement du MOM',
    description: 'L\'Observatoire des Mines de Madagascar est lancé pour centraliser le suivi du secteur minier.'
  }
]

// Timeline finale (dynamique ou fallback)
const timeline = computed(() =>
  timelineData.value?.length ? timelineData.value : defaultTimeline
)

// Contact par défaut
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

// Contenu par défaut pour les sections
const defaultMission = `<p class="mb-4">L'Observatoire des Mines de Madagascar (MOM) a pour mission de promouvoir la transparence, la redevabilité et la bonne gouvernance dans le secteur minier malgache.</p>
<p>Nous documentons les activités minières, analysons leurs impacts sur les communautés et l'environnement, et œuvrons pour une gestion plus équitable des ressources naturelles du pays.</p>`

const defaultVision = `<p class="mb-4">Nous aspirons à un Madagascar où les ressources minières sont gérées de manière transparente, durable et inclusive, au bénéfice de toutes les communautés.</p>
<p>Un secteur minier où les citoyens ont accès à l'information, où les revenus sont équitablement redistribués, et où les impacts environnementaux et sociaux sont minimisés.</p>`

const defaultContext = `<p>Madagascar possède d'importantes ressources minières : saphirs, or, nickel, cobalt, ilménite, graphite, terres rares... Ces richesses représentent un potentiel économique considérable, mais leur exploitation soulève de nombreux défis.</p>
<p><strong>Les enjeux sont multiples :</strong></p>
<ul>
<li><strong>Transparence des revenus :</strong> Les flux financiers générés par l'exploitation minière restent souvent opaques, privant l'État et les communautés locales de ressources essentielles.</li>
<li><strong>Impacts environnementaux :</strong> L'extraction minière cause des dégradations significatives des écosystèmes, de la biodiversité et des ressources en eau.</li>
<li><strong>Impacts sociaux :</strong> Les communautés locales subissent souvent les conséquences négatives sans bénéficier équitablement des retombées économiques.</li>
<li><strong>Gouvernance :</strong> Le cadre réglementaire et son application restent des défis majeurs pour encadrer le secteur de manière efficace.</li>
</ul>
<p>Face à ces enjeux, l'Observatoire des Mines de Madagascar se positionne comme un outil de veille citoyenne, de documentation et de plaidoyer pour une gouvernance minière plus responsable.</p>`

const defaultTimg = `TI Madagascar est le chapitre national de Transparency International, le mouvement mondial de lutte contre la corruption. Depuis 2000, l'organisation œuvre pour promouvoir la transparence, l'intégrité et la redevabilité dans la gouvernance publique et privée à Madagascar.`

const defaultPcqvp = `PCQVP Madagascar fait partie de la coalition mondiale "Publish What You Pay" qui milite pour la transparence des revenus issus des industries extractives. La coalition rassemble des organisations de la société civile engagées pour une gestion responsable des ressources naturelles.`
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
          À propos de l'Observatoire
        </h1>
        <p class="text-xl text-blue-100 max-w-2xl mx-auto">
          Une initiative citoyenne pour la transparence et la bonne gouvernance
          dans le secteur minier malgache.
        </p>
      </div>
    </section>

    <!-- Mission et Vision -->
    <section class="py-16 lg:py-24 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <!-- Mission -->
          <div>
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 rounded-xl bg-ti-blue/10 flex items-center justify-center mr-4">
                <font-awesome-icon icon="bullseye" class="w-6 h-6 text-ti-blue" />
              </div>
              <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white">
                {{ aboutContent?.mission?.title || 'Notre Mission' }}
              </h2>
            </div>
            <div
              class="text-gray-600 dark:text-gray-400 leading-relaxed prose dark:prose-invert max-w-none"
              v-html="aboutContent?.mission?.content || defaultMission"
            />
          </div>

          <!-- Vision -->
          <div>
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 rounded-xl bg-ti-lime/20 flex items-center justify-center mr-4">
                <font-awesome-icon icon="eye" class="w-6 h-6 text-ti-lime-dark" />
              </div>
              <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white">
                {{ aboutContent?.vision?.title || 'Notre Vision' }}
              </h2>
            </div>
            <div
              class="text-gray-600 dark:text-gray-400 leading-relaxed prose dark:prose-invert max-w-none"
              v-html="aboutContent?.vision?.content || defaultVision"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Contexte -->
    <section class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-4">
            {{ aboutContent?.context?.title || 'Contexte' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Pourquoi un observatoire des mines à Madagascar ?
          </p>
        </div>

        <div
          class="prose prose-lg dark:prose-invert max-w-none"
          v-html="aboutContent?.context?.content || defaultContext"
        />
      </div>
    </section>

    <!-- Timeline / Historique -->
    <section class="py-16 lg:py-24 bg-white dark:bg-gray-900">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-4">
            Notre Historique
          </h2>
        </div>

        <div class="relative">
          <!-- Ligne verticale -->
          <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-ti-blue/20 transform md:-translate-x-1/2" />

          <!-- Événements -->
          <div class="space-y-12">
            <div
              v-for="(event, index) in timeline"
              :key="event.id"
              :class="[
                'relative flex items-start gap-8',
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              ]"
            >
              <!-- Point sur la ligne -->
              <div class="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-ti-blue transform -translate-x-1/2 mt-1.5 z-10" />

              <!-- Contenu -->
              <div :class="['ml-12 md:ml-0 md:w-1/2', index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12']">
                <span class="inline-block px-3 py-1 bg-ti-blue text-white text-sm font-bold rounded-full mb-3">
                  {{ event.year }}
                </span>
                <h3 class="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                  {{ event.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-3">
                  {{ event.description }}
                </p>
                <img
                  v-if="event.image"
                  :src="event.image"
                  :alt="event.title"
                  class="w-full max-w-xs rounded-lg shadow-md mt-3"
                  :class="index % 2 === 0 ? 'md:ml-auto' : ''"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Organisations partenaires -->
    <section id="partenaires" class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-4">
            Les Organisations Porteuses
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            L'Observatoire des Mines de Madagascar est une initiative conjointe de deux organisations
            engagées dans la lutte pour la transparence.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <!-- TI Madagascar -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
            <div class="flex items-center mb-6">
              <img
                :src="aboutContent?.timg?.image || '/images/logos/logo_fond_bleu_texte_blanc.jpeg'"
                alt="Transparency International Madagascar"
                class="h-16 w-auto rounded-lg mr-4"
              />
              <div>
                <h3 class="text-xl font-heading font-bold text-gray-900 dark:text-white">
                  Transparency International
                </h3>
                <p class="text-ti-blue font-medium">Initiative Madagascar</p>
              </div>
            </div>
            <div
              class="text-gray-600 dark:text-gray-400 mb-6 prose dark:prose-invert max-w-none"
              v-html="aboutContent?.timg?.content || defaultTimg"
            />
            <a
              :href="siteConfig?.org_timg_website || 'https://www.transparency.mg'"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-ti-blue hover:text-ti-blue-700 font-medium"
            >
              Visiter le site
              <font-awesome-icon icon="arrow-right" class="w-4 h-4 ml-2" />
            </a>
          </div>

          <!-- PCQVP -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
            <div class="flex items-center mb-6">
              <div class="h-16 w-16 rounded-lg bg-ti-orange/10 flex items-center justify-center mr-4">
                <font-awesome-icon icon="bullhorn" class="w-8 h-8 text-ti-orange" />
              </div>
              <div>
                <h3 class="text-xl font-heading font-bold text-gray-900 dark:text-white">
                  PCQVP Madagascar
                </h3>
                <p class="text-ti-orange font-medium">Publiez Ce Que Vous Payez</p>
              </div>
            </div>
            <div
              class="text-gray-600 dark:text-gray-400 mb-6 prose dark:prose-invert max-w-none"
              v-html="aboutContent?.pcqvp?.content || defaultPcqvp"
            />
            <a
              :href="siteConfig?.org_pcqvp_website || 'https://www.pwyp.org'"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-ti-orange hover:text-ti-orange-dark font-medium"
            >
              En savoir plus
              <font-awesome-icon icon="arrow-right" class="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="py-16 lg:py-24 bg-white dark:bg-gray-900">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl lg:text-3xl font-heading font-bold uppercase text-gray-900 dark:text-white mb-4">
            Nous Contacter
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Pour toute question ou collaboration, n'hésitez pas à nous contacter.
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

          <!-- Téléphone -->
          <div class="text-center">
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-ti-blue/10 flex items-center justify-center">
              <font-awesome-icon icon="phone" class="w-6 h-6 text-ti-blue" />
            </div>
            <h3 class="font-heading font-bold text-gray-900 dark:text-white mb-2">Téléphone</h3>
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
          Ensemble, œuvrons pour une gouvernance minière transparente et responsable à Madagascar.
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
            Explorer les études
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
