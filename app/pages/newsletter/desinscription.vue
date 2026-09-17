<script setup lang="ts">
useHead({
  title: 'Désinscription des newsletters - Observatoire des Mines de Madagascar',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref('')
const email = ref('')

// La désinscription se fait sur action explicite (évite les désinscriptions par les antivirus qui visitent les liens)
async function unsubscribe() {
  if (!token.value || status.value === 'loading') return
  status.value = 'loading'
  try {
    const response = await $fetch<{ email: string }>('/api/newsletter/unsubscribe', {
      method: 'POST',
      body: { token: token.value }
    })
    email.value = response.email
    status.value = 'success'
  } catch (error: unknown) {
    const fetchError = error as { data?: { statusMessage?: string } }
    message.value = fetchError.data?.statusMessage || 'Une erreur est survenue. Veuillez réessayer.'
    status.value = 'error'
  }
}
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">
      <font-awesome-icon
        :icon="status === 'success' ? 'check-circle' : status === 'error' || !token ? 'circle-exclamation' : 'envelope'"
        :class="status === 'success' ? 'text-green-500' : status === 'error' || !token ? 'text-red-500' : 'text-ti-blue'"
        class="text-4xl mb-4"
      />

      <template v-if="!token">
        <h1 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">Lien invalide</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Ce lien de désinscription est incomplet. Utilisez le lien présent en bas de nos e-mails.
        </p>
      </template>

      <template v-else-if="status === 'success'">
        <h1 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">Désinscription confirmée</h1>
        <p class="text-gray-600 dark:text-gray-400">
          L’adresse <strong class="text-gray-900 dark:text-white">{{ email }}</strong> ne recevra plus les newsletters de l’Observatoire.
          Vous pouvez vous réabonner à tout moment depuis le pied de page du site.
        </p>
      </template>

      <template v-else-if="status === 'error'">
        <h1 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">Désinscription impossible</h1>
        <p class="text-gray-600 dark:text-gray-400">{{ message }}</p>
      </template>

      <template v-else>
        <h1 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">Se désinscrire des newsletters</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Vous ne recevrez plus les nouvelles actualités et études de cas de l’Observatoire par e-mail.
        </p>
        <button
          type="button"
          :disabled="status === 'loading'"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          @click="unsubscribe"
        >
          <font-awesome-icon v-if="status === 'loading'" icon="spinner" class="animate-spin" />
          Confirmer la désinscription
        </button>
      </template>

      <div class="mt-8">
        <NuxtLink to="/" class="text-sm text-ti-blue hover:text-ti-blue-600 dark:text-ti-blue-400">
          Retour à l’accueil
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
