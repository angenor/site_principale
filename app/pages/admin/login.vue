<script setup lang="ts">
definePageMeta({
  layout: false
})

const { login, isAuthenticated, isLoading } = useAuth()

// Rediriger si déjà connecté
if (isAuthenticated.value) {
  navigateTo('/admin')
}

const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

async function handleSubmit() {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  const result = await login({
    email: email.value,
    password: password.value
  })

  if (result.success) {
    navigateTo('/admin')
  } else {
    error.value = result.error || 'Erreur de connexion'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-ti-blue to-blue-900 dark:from-gray-900 dark:to-gray-800 px-4">
    <div class="w-full max-w-md">
      <!-- Logo et titre -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <img
            src="/images/logos/MOM_White_300x-8_avec_text.png"
            alt="MOM Logo"
            class="h-24 max-w-[280px] mx-auto object-contain"
          />
        </NuxtLink>
        <h1 class="mt-6 text-3xl font-heading font-bold text-white uppercase">
          Administration
        </h1>
        <p class="mt-2 text-blue-200 dark:text-gray-400">
          Observatoire des Mines de Madagascar
        </p>
      </div>

      <!-- Formulaire de connexion -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Connexion
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Message d'erreur -->
          <div
            v-if="error"
            class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <font-awesome-icon icon="circle-exclamation" class="w-5 h-5" />
            <span>{{ error }}</span>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <font-awesome-icon icon="envelope" class="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                :disabled="isLoading"
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                placeholder="admin@mom.mg"
              />
            </div>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <font-awesome-icon icon="lock" class="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                :disabled="isLoading"
                class="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-ti-blue focus:border-ti-blue transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                <font-awesome-icon
                  :icon="showPassword ? 'eye-slash' : 'eye'"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                />
              </button>
            </div>
          </div>

          <!-- Bouton de connexion -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-ti-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ti-blue dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
          >
            <font-awesome-icon
              v-if="isLoading"
              icon="spinner"
              class="animate-spin"
            />
            <font-awesome-icon
              v-else
              icon="right-to-bracket"
            />
            <span>{{ isLoading ? 'Connexion...' : 'Se connecter' }}</span>
          </button>
        </form>

        <!-- Lien vers le site -->
        <div class="mt-6 text-center">
          <NuxtLink
            to="/"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-ti-blue transition-colors inline-flex items-center gap-1"
          >
            <font-awesome-icon icon="arrow-left" class="w-3 h-3" />
            Retour au site
          </NuxtLink>
        </div>
      </div>

      <!-- Copyright -->
      <p class="mt-8 text-center text-sm text-blue-200 dark:text-gray-500">
        &copy; {{ new Date().getFullYear() }} Transparency International Madagascar
      </p>
    </div>
  </div>
</template>
