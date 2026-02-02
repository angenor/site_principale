<script setup lang="ts">
// Utiliser la config partagée
const { getConfig } = useAppSettings()

const introText = computed(() => getConfig('report_case_intro', 'Vous avez connaissance d\'un cas de mauvaise gouvernance ou d\'impact négatif lié à l\'exploitation minière ? Partagez l\'information de manière sécurisée.'))

// Métadonnées de la page
useHead({
  title: 'Signaler un cas - Observatoire des Mines de Madagascar',
  meta: [
    {
      name: 'description',
      content: 'Signalez un cas de mauvaise gouvernance ou d\'impact négatif lié à l\'exploitation minière à Madagascar de manière sécurisée.'
    }
  ]
})

// État du formulaire
const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  isAnonymous: false
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

// Catégories de signalement
const categories = [
  'Impact environnemental',
  'Impact sur les communautés',
  'Non-respect des engagements',
  'Transparence des revenus',
  'Conditions de travail',
  'Corruption',
  'Autre'
]

// Soumission du formulaire
const submitForm = async () => {
  // Validation
  if (!form.subject) {
    submitError.value = 'Veuillez sélectionner une catégorie'
    return
  }
  if (!form.message || form.message.length < 50) {
    submitError.value = 'Votre message doit contenir au moins 50 caractères'
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.isAnonymous ? null : form.name,
        email: form.isAnonymous ? null : form.email,
        phone: form.isAnonymous ? null : form.phone,
        subject: form.subject,
        message: form.message,
        isAnonymous: form.isAnonymous
      }
    })

    submitSuccess.value = true

    // Réinitialiser le formulaire
    form.name = ''
    form.email = ''
    form.phone = ''
    form.subject = ''
    form.message = ''
    form.isAnonymous = false
  } catch (error: any) {
    submitError.value = error.data?.statusMessage || 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isSubmitting.value = false
  }
}

// Réinitialiser le message de succès
const resetForm = () => {
  submitSuccess.value = false
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-ti-blue-600 to-ti-blue-800 py-16 lg:py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
          <font-awesome-icon icon="bullhorn" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl lg:text-4xl font-heading font-bold uppercase text-white mb-4">
          Signaler un cas
        </h1>
        <p class="text-lg text-blue-100 max-w-2xl mx-auto">
          {{ introText }}
        </p>
      </div>
    </section>

    <!-- Contenu principal -->
    <section class="py-12 lg:py-16 bg-white dark:bg-gray-900">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Message de succès -->
        <div v-if="submitSuccess" class="text-center py-12">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <font-awesome-icon icon="check" class="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            Signalement envoyé !
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            Merci pour votre contribution. Votre signalement sera examiné par notre équipe
            dans les plus brefs délais.
          </p>
          <button @click="resetForm" class="btn-ti">
            Faire un autre signalement
          </button>
        </div>

        <!-- Formulaire -->
        <form v-else @submit.prevent="submitForm" class="space-y-8">
          <!-- Avertissement confidentialité -->
          <div class="bg-ti-blue-50 dark:bg-ti-blue-900/20 border border-ti-blue-200 dark:border-ti-blue-800 rounded-xl p-6">
            <div class="flex">
              <font-awesome-icon icon="shield-halved" class="w-6 h-6 text-ti-blue flex-shrink-0 mt-0.5" />
              <div class="ml-4">
                <h3 class="font-semibold text-ti-blue-800 dark:text-ti-blue-200">
                  Confidentialité garantie
                </h3>
                <p class="text-sm text-ti-blue-700 dark:text-ti-blue-300 mt-1">
                  Vos informations sont traitées de manière confidentielle. Vous pouvez choisir
                  de rester anonyme. Aucune donnée personnelle ne sera partagée sans votre consentement.
                </p>
              </div>
            </div>
          </div>

          <!-- Option anonyme -->
          <div class="flex items-center">
            <input
              id="anonymous"
              v-model="form.isAnonymous"
              type="checkbox"
              class="w-5 h-5 rounded border-gray-300 text-ti-blue focus:ring-ti-blue cursor-pointer"
            />
            <label for="anonymous" class="ml-3 text-gray-700 dark:text-gray-300 cursor-pointer">
              <span class="font-medium">Rester anonyme</span>
              <span class="text-sm text-gray-500 dark:text-gray-400 block">
                Vos coordonnées ne seront pas enregistrées
              </span>
            </label>
          </div>

          <!-- Informations de contact (si non anonyme) -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="!form.isAnonymous" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom (optionnel)
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Votre nom"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (optionnel)
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="votre@email.com"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="+261 XX XX XXX XX"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </Transition>

          <!-- Catégorie -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie du signalement <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.subject"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="" disabled>Sélectionnez une catégorie</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <!-- Message -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description du cas <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.message"
              rows="8"
              required
              minlength="50"
              placeholder="Décrivez le cas que vous souhaitez signaler. Soyez aussi précis que possible : lieu, date, acteurs impliqués, impacts observés..."
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-ti-blue focus:border-transparent transition-colors resize-none"
            />
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Minimum 50 caractères. {{ form.message.length }}/50
            </p>
          </div>

          <!-- Message d'erreur -->
          <div v-if="submitError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex">
              <font-awesome-icon icon="circle-exclamation" class="w-5 h-5 text-red-600 dark:text-red-400" />
              <p class="ml-3 text-sm text-red-700 dark:text-red-300">{{ submitError }}</p>
            </div>
          </div>

          <!-- Bouton de soumission -->
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn-ti px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <font-awesome-icon
                v-if="isSubmitting"
                icon="spinner"
                class="w-4 h-4 mr-2 animate-spin"
              />
              <font-awesome-icon v-else icon="paper-plane" class="w-4 h-4 mr-2" />
              {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le signalement' }}
            </button>
          </div>
        </form>

        <!-- Informations supplémentaires -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">
            Autres moyens de nous contacter
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div class="flex items-start">
              <font-awesome-icon icon="envelope" class="w-5 h-5 text-ti-blue mt-0.5" />
              <div class="ml-3">
                <p class="font-medium text-gray-900 dark:text-white">Email</p>
                <a href="mailto:vramaherison@transparency.mg" class="text-ti-blue hover:text-ti-blue-700">
                  vramaherison@transparency.mg
                </a>
              </div>
            </div>
            <div class="flex items-start">
              <font-awesome-icon icon="phone" class="w-5 h-5 text-ti-blue mt-0.5" />
              <div class="ml-3">
                <p class="font-medium text-gray-900 dark:text-white">Téléphone</p>
                <a href="tel:+261202230971" class="text-ti-blue hover:text-ti-blue-700">
                  +261 20 22 309 71
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
