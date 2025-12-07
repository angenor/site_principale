<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[var(--text-primary)]">Mon profil</h1>
      <p class="text-[var(--text-muted)]">Gérez vos informations personnelles et vos préférences</p>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiLoadingSpinner size="lg" />
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Profile card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
          <!-- Profile header -->
          <div class="p-6 bg-[var(--bg-secondary)] flex items-center gap-4">
            <div
              class="w-20 h-20 rounded-full flex items-center justify-center text-2xl text-white font-bold"
              :class="getAvatarColor(user?.role.code)"
            >
              {{ getInitials(user) }}
            </div>
            <div>
              <h2 class="text-xl font-semibold text-[var(--text-primary)]">
                {{ user?.nom }} {{ user?.prenom || '' }}
              </h2>
              <p class="text-[var(--text-muted)]">{{ user?.email }}</p>
              <span
                class="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium"
                :class="getRoleBadgeClass(user?.role.code)"
              >
                {{ user?.role.nom }}
              </span>
            </div>
          </div>

          <!-- Form content -->
          <form @submit.prevent="saveProfile" class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nom -->
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Nom *
                </label>
                <input
                  v-model="profileForm.nom"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                  placeholder="Nom de famille"
                />
              </div>

              <!-- Prénom -->
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Prénom
                </label>
                <input
                  v-model="profileForm.prenom"
                  type="text"
                  class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                  placeholder="Prénom"
                />
              </div>

              <!-- Email -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Adresse email *
                </label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="isSaving"
                class="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <font-awesome-icon
                  :icon="['fas', isSaving ? 'spinner' : 'check']"
                  :class="{ 'animate-spin': isSaving }"
                />
                {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Password card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
          <div class="p-4 border-b border-[var(--border-default)]">
            <h3 class="font-semibold text-[var(--text-primary)]">Changer le mot de passe</h3>
          </div>

          <form @submit.prevent="changePassword" class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Current password -->
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Mot de passe actuel
                </label>
                <div class="relative">
                  <input
                    v-model="passwordForm.current"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    class="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <font-awesome-icon :icon="['fas', showCurrentPassword ? 'eye-slash' : 'eye']" />
                  </button>
                </div>
              </div>

              <!-- New password -->
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Nouveau mot de passe
                </label>
                <div class="relative">
                  <input
                    v-model="passwordForm.new"
                    :type="showNewPassword ? 'text' : 'password'"
                    class="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <font-awesome-icon :icon="['fas', showNewPassword ? 'eye-slash' : 'eye']" />
                  </button>
                </div>
              </div>

              <!-- Confirm password -->
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Confirmer
                </label>
                <input
                  v-model="passwordForm.confirm"
                  :type="showNewPassword ? 'text' : 'password'"
                  class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                  placeholder="••••••••"
                  :class="{ 'border-red-500': passwordForm.confirm && passwordForm.confirm !== passwordForm.new }"
                />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="isChangingPassword || !isPasswordFormValid"
                class="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <font-awesome-icon
                  :icon="['fas', isChangingPassword ? 'spinner' : 'key']"
                  :class="{ 'animate-spin': isChangingPassword }"
                />
                {{ isChangingPassword ? 'Modification...' : 'Modifier le mot de passe' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Sessions card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
          <div class="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h3 class="font-semibold text-[var(--text-primary)]">Sessions actives</h3>
            <button
              v-if="sessions.length > 1"
              @click="revokeOtherSessions"
              class="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Déconnecter les autres
            </button>
          </div>

          <div v-if="sessions.length > 0" class="divide-y divide-[var(--border-default)]">
            <div
              v-for="session in sessions"
              :key="session.id"
              class="p-4 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                  <font-awesome-icon
                    :icon="['fas', getDeviceIcon(session.user_agent)]"
                    class="text-[var(--text-muted)]"
                  />
                </div>
                <div>
                  <p class="font-medium text-[var(--text-primary)]">
                    {{ parseUserAgent(session.user_agent) }}
                    <span v-if="session.is_current" class="ml-2 px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Session actuelle
                    </span>
                  </p>
                  <p class="text-sm text-[var(--text-muted)]">
                    {{ session.ip_address || 'IP inconnue' }} • {{ formatDate(session.created_at) }}
                  </p>
                </div>
              </div>
              <button
                v-if="!session.is_current"
                @click="revokeSession(session.id)"
                class="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                title="Déconnecter"
              >
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>
            </div>
          </div>
          <div v-else class="p-8 text-center">
            <font-awesome-icon :icon="['fas', 'desktop']" class="text-3xl text-[var(--text-muted)] mb-3" />
            <p class="text-[var(--text-muted)]">Aucune session active</p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Preferences card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h3 class="font-semibold text-[var(--text-primary)] mb-4">Préférences</h3>

          <div class="space-y-4">
            <!-- Theme -->
            <div>
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Thème
              </label>
              <div class="flex gap-2">
                <button
                  @click="setTheme('light')"
                  :class="[
                    'flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 text-sm',
                    currentTheme === 'light'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                      : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--color-primary)]/50'
                  ]"
                >
                  <font-awesome-icon :icon="['fas', 'sun']" />
                  Clair
                </button>
                <button
                  @click="setTheme('dark')"
                  :class="[
                    'flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 text-sm',
                    currentTheme === 'dark'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                      : 'border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--color-primary)]/50'
                  ]"
                >
                  <font-awesome-icon :icon="['fas', 'moon']" />
                  Sombre
                </button>
              </div>
            </div>

            <!-- Language -->
            <div>
              <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Langue
              </label>
              <select
                v-model="preferences.language"
                class="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
              >
                <option value="fr">Français</option>
                <option value="mg">Malagasy</option>
              </select>
            </div>

            <!-- Notifications -->
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="preferences.emailNotifications"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)] relative" />
                <span class="text-sm text-[var(--text-primary)]">
                  Notifications par email
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Account info card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h3 class="font-semibold text-[var(--text-primary)] mb-4">Informations du compte</h3>

          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Membre depuis</span>
              <span class="text-[var(--text-primary)]">
                {{ user?.created_at ? formatDateFull(user.created_at) : '-' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Email vérifié</span>
              <span :class="user?.email_verifie ? 'text-emerald-500' : 'text-amber-500'">
                {{ user?.email_verifie ? 'Oui' : 'Non' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Dernière connexion</span>
              <span class="text-[var(--text-primary)]">
                {{ user?.derniere_connexion ? formatDate(user.derniere_connexion) : '-' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, Session } from '~/types/auth'

definePageMeta({
  layout: 'admin',
})

const utilisateursService = useUtilisateursService()
const { isDark, toggle: toggleDarkMode } = useDarkMode()

const isLoading = ref(true)
const isSaving = ref(false)
const isChangingPassword = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

const user = ref<User | null>(null)
const sessions = ref<Session[]>([])

const profileForm = ref({
  email: '',
  nom: '',
  prenom: '',
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: '',
})

const preferences = ref({
  language: 'fr',
  emailNotifications: true,
})

const currentTheme = computed(() => isDark.value ? 'dark' : 'light')

const isPasswordFormValid = computed(() => {
  return passwordForm.value.current &&
         passwordForm.value.new &&
         passwordForm.value.new.length >= 8 &&
         passwordForm.value.new === passwordForm.value.confirm
})

const getInitials = (user: User | null) => {
  if (!user) return '?'
  const first = user.nom?.charAt(0) || ''
  const last = user.prenom?.charAt(0) || ''
  return (first + last).toUpperCase() || '?'
}

const getAvatarColor = (roleCode?: string) => {
  switch (roleCode) {
    case 'admin':
      return 'bg-purple-500'
    case 'editeur':
      return 'bg-blue-500'
    case 'lecteur':
      return 'bg-emerald-500'
    case 'commune':
      return 'bg-amber-500'
    default:
      return 'bg-gray-500'
  }
}

const getRoleBadgeClass = (roleCode?: string) => {
  switch (roleCode) {
    case 'admin':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'editeur':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'lecteur':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'commune':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getDeviceIcon = (userAgent?: string) => {
  if (!userAgent) return 'desktop'
  const ua = userAgent.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile-screen'
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet-screen-button'
  return 'desktop'
}

const parseUserAgent = (userAgent?: string) => {
  if (!userAgent) return 'Navigateur inconnu'
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Navigateur'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return "Aujourd'hui à " + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Hier'
  } else if (days < 7) {
    return `Il y a ${days} jours`
  } else {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }
}

const formatDateFull = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const setTheme = (theme: 'light' | 'dark') => {
  if ((theme === 'dark' && !isDark.value) || (theme === 'light' && isDark.value)) {
    toggleDarkMode()
  }
}

const saveProfile = async () => {
  isSaving.value = true
  try {
    const updated = await utilisateursService.updateMonProfil(profileForm.value)
    user.value = updated
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    isSaving.value = false
  }
}

const changePassword = async () => {
  if (!isPasswordFormValid.value) return

  isChangingPassword.value = true
  try {
    const { changePassword: changePasswordFn } = useAuth()
    await changePasswordFn(passwordForm.value.current, passwordForm.value.new)
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (error) {
    console.error('Error changing password:', error)
  } finally {
    isChangingPassword.value = false
  }
}

const revokeSession = async (sessionId: string) => {
  try {
    await utilisateursService.revokerMaSession(sessionId)
    sessions.value = sessions.value.filter(s => s.id !== sessionId)
  } catch (error) {
    console.error('Error revoking session:', error)
  }
}

const revokeOtherSessions = async () => {
  const otherSessions = sessions.value.filter(s => !s.is_current)
  for (const session of otherSessions) {
    await revokeSession(session.id)
  }
}

const loadProfile = async () => {
  isLoading.value = true
  try {
    user.value = await utilisateursService.getMonProfil()
    profileForm.value = {
      email: user.value.email,
      nom: user.value.nom,
      prenom: user.value.prenom || '',
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    // Mock data
    user.value = {
      id: '1',
      email: 'admin@ti-madagascar.org',
      nom: 'Razafindrakoto',
      prenom: 'Jean',
      role: { id: '1', code: 'admin', nom: 'Administrateur', actif: true },
      actif: true,
      email_verifie: true,
      derniere_connexion: new Date().toISOString(),
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-02-20T14:00:00Z',
    }
    profileForm.value = {
      email: user.value.email,
      nom: user.value.nom,
      prenom: user.value.prenom || '',
    }
  } finally {
    isLoading.value = false
  }
}

const loadSessions = async () => {
  try {
    sessions.value = await utilisateursService.getMesSessions()
  } catch (error) {
    // Mock data
    sessions.value = [
      {
        id: '1',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
        created_at: new Date().toISOString(),
        is_current: true,
      },
      {
        id: '2',
        ip_address: '10.0.0.50',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1',
        created_at: '2024-02-18T09:30:00Z',
        is_current: false,
      },
    ]
  }
}

onMounted(() => {
  loadProfile()
  loadSessions()
})
</script>
