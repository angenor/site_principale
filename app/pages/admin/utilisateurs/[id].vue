<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/admin/utilisateurs"
          class="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="text-[var(--text-muted)]" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">
            {{ isEditing ? 'Modifier l\'utilisateur' : 'Détails de l\'utilisateur' }}
          </h1>
          <p class="text-[var(--text-muted)]">
            {{ isEditing ? 'Modifiez les informations de l\'utilisateur' : 'Consultez les détails et gérez les sessions' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <template v-if="!isEditing">
          <button
            v-if="user?.actif"
            @click="toggleStatus"
            class="px-4 py-2 rounded-lg border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <font-awesome-icon :icon="['fas', 'user-slash']" />
            Désactiver
          </button>
          <button
            v-else
            @click="toggleStatus"
            class="px-4 py-2 rounded-lg border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <font-awesome-icon :icon="['fas', 'user-check']" />
            Activer
          </button>
          <button
            @click="isEditing = true"
            class="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2"
          >
            <font-awesome-icon :icon="['fas', 'pen']" />
            Modifier
          </button>
        </template>
        <template v-else>
          <button
            @click="cancelEdit"
            class="px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Annuler
          </button>
          <button
            @click="saveUser"
            :disabled="isSaving"
            class="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <font-awesome-icon :icon="['fas', isSaving ? 'spinner' : 'check']" :class="{ 'animate-spin': isSaving }" />
            {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </template>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiLoadingSpinner size="lg" />
    </div>

    <!-- Content -->
    <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- User info card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
          <!-- Profile header -->
          <div class="p-6 bg-[var(--bg-secondary)] flex items-center gap-4">
            <div
              class="w-20 h-20 rounded-full flex items-center justify-center text-2xl text-white font-bold"
              :class="getAvatarColor(user.role.code)"
            >
              {{ getInitials(user) }}
            </div>
            <div>
              <h2 class="text-xl font-semibold text-[var(--text-primary)]">
                {{ user.nom }} {{ user.prenom || '' }}
              </h2>
              <p class="text-[var(--text-muted)]">{{ user.email }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="getRoleBadgeClass(user.role.code)"
                >
                  {{ user.role.nom }}
                </span>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="user.actif
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="user.actif ? 'bg-emerald-500' : 'bg-red-500'" />
                  {{ user.actif ? 'Actif' : 'Inactif' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Form content -->
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nom -->
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Nom *
                </label>
                <input
                  v-if="isEditing"
                  v-model="editForm.nom"
                  type="text"
                  class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                  placeholder="Nom de famille"
                />
                <p v-else class="text-[var(--text-primary)] py-2">{{ user.nom }}</p>
              </div>

              <!-- Prénom -->
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Prénom
                </label>
                <input
                  v-if="isEditing"
                  v-model="editForm.prenom"
                  type="text"
                  class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                  placeholder="Prénom"
                />
                <p v-else class="text-[var(--text-primary)] py-2">{{ user.prenom || '-' }}</p>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Email *
                </label>
                <input
                  v-if="isEditing"
                  v-model="editForm.email"
                  type="email"
                  class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
                  placeholder="email@example.com"
                />
                <p v-else class="text-[var(--text-primary)] py-2">{{ user.email }}</p>
              </div>

              <!-- Rôle -->
              <div>
                <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Rôle *
                </label>
                <select
                  v-if="isEditing"
                  v-model="editForm.role_id"
                  class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                >
                  <option v-for="role in roles" :key="role.id" :value="role.id">
                    {{ role.nom }}
                  </option>
                </select>
                <p v-else class="text-[var(--text-primary)] py-2">{{ user.role.nom }}</p>
              </div>
            </div>

            <!-- Password section (edit mode only) -->
            <div v-if="isEditing" class="pt-4 border-t border-[var(--border-default)]">
              <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Mot de passe</h3>
              <div class="flex items-center gap-4">
                <button
                  @click="resetPassword"
                  class="px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2"
                >
                  <font-awesome-icon :icon="['fas', 'envelope']" />
                  Envoyer un email de réinitialisation
                </button>
                <button
                  @click="showSetPasswordModal = true"
                  class="px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2"
                >
                  <font-awesome-icon :icon="['fas', 'key']" />
                  Définir un mot de passe
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sessions card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
          <div class="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h3 class="font-semibold text-[var(--text-primary)]">Sessions actives</h3>
            <button
              v-if="sessions.length > 0"
              @click="revokeAllSessions"
              class="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Révoquer toutes
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
                title="Révoquer"
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
        <!-- Stats card -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h3 class="font-semibold text-[var(--text-primary)] mb-4">Statistiques</h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Connexions totales</span>
              <span class="font-semibold text-[var(--text-primary)]">
                {{ user.nombre_connexions || 0 }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Dernière connexion</span>
              <span class="text-[var(--text-primary)]">
                {{ user.derniere_connexion ? formatDate(user.derniere_connexion) : 'Jamais' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Email vérifié</span>
              <span :class="user.email_verifie ? 'text-emerald-500' : 'text-amber-500'">
                {{ user.email_verifie ? 'Oui' : 'Non' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--text-muted)]">Créé le</span>
              <span class="text-[var(--text-primary)]">
                {{ formatDateFull(user.created_at) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Connection history -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
          <h3 class="font-semibold text-[var(--text-primary)] mb-4">Historique récent</h3>

          <div class="space-y-3">
            <div v-for="(log, index) in connectionHistory" :key="index" class="flex items-start gap-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                :class="log.success ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30' : 'bg-red-100 text-red-500 dark:bg-red-900/30'"
              >
                <font-awesome-icon :icon="['fas', log.success ? 'check' : 'times']" class="text-sm" />
              </div>
              <div>
                <p class="text-sm text-[var(--text-primary)]">
                  {{ log.success ? 'Connexion réussie' : 'Échec de connexion' }}
                </p>
                <p class="text-xs text-[var(--text-muted)]">{{ log.date }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger zone -->
        <div class="bg-[var(--bg-card)] rounded-xl border border-red-500/30 p-6">
          <h3 class="font-semibold text-red-500 mb-4">Zone de danger</h3>
          <p class="text-sm text-[var(--text-muted)] mb-4">
            La suppression d'un utilisateur est irréversible.
          </p>
          <button
            @click="showDeleteModal = true"
            class="w-full px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <font-awesome-icon :icon="['fas', 'trash']" />
            Supprimer l'utilisateur
          </button>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="text-center py-20">
      <font-awesome-icon :icon="['fas', 'user-slash']" class="text-6xl text-[var(--text-muted)] mb-4" />
      <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-2">Utilisateur non trouvé</h2>
      <p class="text-[var(--text-muted)] mb-6">L'utilisateur demandé n'existe pas ou a été supprimé.</p>
      <NuxtLink
        to="/admin/utilisateurs"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        Retour à la liste
      </NuxtLink>
    </div>

    <!-- Delete confirmation modal -->
    <UiModal
      v-model="showDeleteModal"
      title="Supprimer l'utilisateur"
      confirm-text="Supprimer"
      confirm-variant="danger"
      @confirm="deleteUser"
    >
      <p class="text-[var(--text-secondary)]">
        Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ user?.nom }} {{ user?.prenom || '' }}</strong> ?
        Cette action est irréversible.
      </p>
    </UiModal>

    <!-- Set password modal -->
    <UiModal
      v-model="showSetPasswordModal"
      title="Définir un mot de passe"
      confirm-text="Définir"
      @confirm="setPassword"
    >
      <div class="space-y-4">
        <p class="text-sm text-[var(--text-muted)]">
          Définissez un nouveau mot de passe pour cet utilisateur.
        </p>
        <div>
          <label class="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Nouveau mot de passe
          </label>
          <input
            v-model="newPassword"
            type="password"
            class="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
            placeholder="Minimum 8 caractères"
          />
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { User, Role, Session } from '~/types/auth'
import type { UserWithStats, UserFormData } from '~/services/utilisateurs.service'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const utilisateursService = useUtilisateursService()

const userId = computed(() => route.params.id as string)

const isLoading = ref(true)
const isEditing = ref(false)
const isSaving = ref(false)
const showDeleteModal = ref(false)
const showSetPasswordModal = ref(false)
const newPassword = ref('')

const user = ref<UserWithStats | null>(null)
const roles = ref<Role[]>([])
const sessions = ref<Session[]>([])

const editForm = ref<Partial<UserFormData>>({
  email: '',
  nom: '',
  prenom: '',
  role_id: '',
})

// Mock connection history
const connectionHistory = ref([
  { success: true, date: 'Aujourd\'hui à 09:30' },
  { success: true, date: 'Hier à 14:15' },
  { success: false, date: 'Il y a 3 jours' },
  { success: true, date: 'Il y a 5 jours' },
])

const getInitials = (user: User) => {
  const first = user.nom?.charAt(0) || ''
  const last = user.prenom?.charAt(0) || ''
  return (first + last).toUpperCase() || '?'
}

const getAvatarColor = (roleCode: string) => {
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

const getRoleBadgeClass = (roleCode: string) => {
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

const cancelEdit = () => {
  if (user.value) {
    editForm.value = {
      email: user.value.email,
      nom: user.value.nom,
      prenom: user.value.prenom || '',
      role_id: user.value.role.id,
    }
  }
  isEditing.value = false
}

const saveUser = async () => {
  if (!user.value) return

  isSaving.value = true
  try {
    const updated = await utilisateursService.updateUtilisateur(userId.value, editForm.value)
    user.value = { ...user.value, ...updated }
    isEditing.value = false
  } catch (error) {
    console.error('Error saving user:', error)
  } finally {
    isSaving.value = false
  }
}

const toggleStatus = async () => {
  if (!user.value) return

  try {
    if (user.value.actif) {
      await utilisateursService.desactiverUtilisateur(userId.value)
    } else {
      await utilisateursService.activerUtilisateur(userId.value)
    }
    user.value.actif = !user.value.actif
  } catch (error) {
    console.error('Error toggling user status:', error)
  }
}

const resetPassword = async () => {
  try {
    await utilisateursService.resetPassword(userId.value)
    // Show success toast
  } catch (error) {
    console.error('Error resetting password:', error)
  }
}

const setPassword = async () => {
  if (!newPassword.value || newPassword.value.length < 8) return

  try {
    await utilisateursService.setPassword(userId.value, newPassword.value)
    showSetPasswordModal.value = false
    newPassword.value = ''
  } catch (error) {
    console.error('Error setting password:', error)
  }
}

const revokeSession = async (sessionId: string) => {
  try {
    await utilisateursService.revokeSession(userId.value, sessionId)
    sessions.value = sessions.value.filter(s => s.id !== sessionId)
  } catch (error) {
    console.error('Error revoking session:', error)
  }
}

const revokeAllSessions = async () => {
  try {
    await utilisateursService.revokeAllSessions(userId.value)
    sessions.value = []
  } catch (error) {
    console.error('Error revoking all sessions:', error)
  }
}

const deleteUser = async () => {
  if (!user.value) return

  try {
    await utilisateursService.deleteUtilisateur(userId.value)
    router.push('/admin/utilisateurs')
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

const loadUser = async () => {
  isLoading.value = true
  try {
    const data = await utilisateursService.getUtilisateur(userId.value)
    user.value = data as UserWithStats
    editForm.value = {
      email: data.email,
      nom: data.nom,
      prenom: data.prenom || '',
      role_id: data.role.id,
    }
  } catch (error) {
    console.error('Error loading user:', error)
    // Mock data
    user.value = {
      id: userId.value,
      email: 'admin@ti-madagascar.org',
      nom: 'Razafindrakoto',
      prenom: 'Jean',
      role: { id: '1', code: 'admin', nom: 'Administrateur', actif: true },
      actif: true,
      email_verifie: true,
      derniere_connexion: new Date().toISOString(),
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-02-20T14:00:00Z',
      nombre_connexions: 156,
    }
    editForm.value = {
      email: user.value.email,
      nom: user.value.nom,
      prenom: user.value.prenom || '',
      role_id: user.value.role.id,
    }
  } finally {
    isLoading.value = false
  }
}

const loadRoles = async () => {
  try {
    roles.value = await utilisateursService.getRoles()
  } catch (error) {
    roles.value = [
      { id: '1', code: 'admin', nom: 'Administrateur', actif: true },
      { id: '2', code: 'editeur', nom: 'Éditeur', actif: true },
      { id: '3', code: 'lecteur', nom: 'Lecteur', actif: true },
      { id: '4', code: 'commune', nom: 'Commune', actif: true },
    ]
  }
}

const loadSessions = async () => {
  try {
    sessions.value = await utilisateursService.getSessions(userId.value)
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
  loadRoles()
  loadUser()
  loadSessions()
})
</script>
