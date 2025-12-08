<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">Utilisateurs</h1>
        <p class="text-[var(--text-muted)]">Gérez les comptes utilisateurs de la plateforme</p>
      </div>
      <NuxtLink
        to="/admin/utilisateurs/create"
        class="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2"
      >
        <font-awesome-icon :icon="['fas', 'user-plus']" />
        Nouvel utilisateur
      </NuxtLink>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'users']" class="text-[var(--color-primary)]" />
          </div>
          <div>
            <p class="text-2xl font-bold text-[var(--text-primary)]">{{ stats.total }}</p>
            <p class="text-sm text-[var(--text-muted)]">Total utilisateurs</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'user-check']" class="text-emerald-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-[var(--text-primary)]">{{ stats.actifs }}</p>
            <p class="text-sm text-[var(--text-muted)]">Actifs</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'user-clock']" class="text-amber-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-[var(--text-primary)]">{{ stats.inactifs }}</p>
            <p class="text-sm text-[var(--text-muted)]">Inactifs</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'user-shield']" class="text-purple-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-[var(--text-primary)]">{{ stats.admins }}</p>
            <p class="text-sm text-[var(--text-muted)]">Administrateurs</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <div class="relative">
            <font-awesome-icon
              :icon="['fas', 'search']"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Rechercher par nom ou email..."
              class="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-colors"
            />
          </div>
        </div>

        <!-- Role filter -->
        <div>
          <select
            v-model="filters.role"
            class="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
          >
            <option value="">Tous les rôles</option>
            <option v-for="role in roles" :key="role.id" :value="role.code">
              {{ role.nom }}
            </option>
          </select>
        </div>

        <!-- Status filter -->
        <div>
          <select
            v-model="filters.actif"
            class="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users table -->
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
      <!-- Loading state -->
      <div v-if="isLoading" class="p-8 flex items-center justify-center">
        <UiLoadingSpinner size="lg" />
      </div>

      <!-- Error state -->
      <div v-else-if="loadError" class="p-8 text-center">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-5xl text-[var(--color-error)] mb-4" />
        <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">Erreur de chargement</h3>
        <p class="text-[var(--text-muted)] mb-4">{{ loadError }}</p>
        <button
          @click="loadUsers"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'refresh']" />
          Réessayer
        </button>
      </div>

      <!-- Table -->
      <div v-else-if="users.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[var(--bg-secondary)]">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Utilisateur</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Rôle</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Statut</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Dernière connexion</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">Connexions</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border-default)]">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-[var(--bg-secondary)]/50 transition-colors"
            >
              <!-- User info -->
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    :class="getAvatarColor(user.role.code)"
                  >
                    {{ getInitials(user) }}
                  </div>
                  <div>
                    <p class="font-medium text-[var(--text-primary)]">
                      {{ user.nom }} {{ user.prenom || '' }}
                    </p>
                    <p class="text-sm text-[var(--text-muted)]">{{ user.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="px-4 py-4">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="getRoleBadgeClass(user.role.code)"
                >
                  {{ user.role.nom }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="user.actif
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="user.actif ? 'bg-emerald-500' : 'bg-red-500'" />
                  {{ user.actif ? 'Actif' : 'Inactif' }}
                </span>
              </td>

              <!-- Last connection -->
              <td class="px-4 py-4 text-sm text-[var(--text-secondary)]">
                {{ user.derniere_connexion ? formatDate(user.derniere_connexion) : 'Jamais' }}
              </td>

              <!-- Connections count -->
              <td class="px-4 py-4 text-sm text-[var(--text-secondary)]">
                {{ user.nombre_connexions || 0 }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-4">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/admin/utilisateurs/${user.id}`"
                    class="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors"
                    title="Voir les détails"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                  </NuxtLink>

                  <button
                    v-if="user.actif"
                    @click="toggleUserStatus(user)"
                    class="p-2 rounded-lg hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500 transition-colors"
                    title="Désactiver"
                  >
                    <font-awesome-icon :icon="['fas', 'user-slash']" />
                  </button>
                  <button
                    v-else
                    @click="toggleUserStatus(user)"
                    class="p-2 rounded-lg hover:bg-emerald-500/10 text-[var(--text-muted)] hover:text-emerald-500 transition-colors"
                    title="Activer"
                  >
                    <font-awesome-icon :icon="['fas', 'user-check']" />
                  </button>

                  <button
                    @click="confirmDelete(user)"
                    class="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-else class="p-12 text-center">
        <font-awesome-icon :icon="['fas', 'users-slash']" class="text-5xl text-[var(--text-muted)] mb-4" />
        <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">Aucun utilisateur trouvé</h3>
        <p class="text-[var(--text-muted)] mb-4">
          {{ hasFilters ? 'Essayez de modifier vos filtres de recherche.' : 'Commencez par créer un utilisateur.' }}
        </p>
        <NuxtLink
          v-if="!hasFilters"
          to="/admin/utilisateurs/create"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'user-plus']" />
          Créer un utilisateur
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="users.length > 0" class="px-4 py-3 border-t border-[var(--border-default)] flex items-center justify-between">
        <p class="text-sm text-[var(--text-muted)]">
          Affichage de {{ (pagination.page - 1) * pagination.limit + 1 }} à {{ Math.min(pagination.page * pagination.limit, pagination.total) }} sur {{ pagination.total }} utilisateurs
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="pagination.page--"
            :disabled="pagination.page === 1"
            class="px-3 py-1.5 rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" />
          </button>
          <span class="px-3 py-1.5 text-sm text-[var(--text-primary)]">
            Page {{ pagination.page }} / {{ Math.ceil(pagination.total / pagination.limit) }}
          </span>
          <button
            @click="pagination.page++"
            :disabled="pagination.page >= Math.ceil(pagination.total / pagination.limit)"
            class="px-3 py-1.5 rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </div>
      </div>
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
        Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete?.nom }} {{ userToDelete?.prenom || '' }}</strong> ?
        Cette action est irréversible.
      </p>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import type { User, Role } from '~/types/auth'
import type { UserWithStats } from '~/services/utilisateurs.service'

definePageMeta({
  layout: 'admin',
})

const utilisateursService = useUtilisateursService()

const isLoading = ref(true)
const loadError = ref<string | null>(null)
const users = ref<UserWithStats[]>([])
const roles = ref<Role[]>([])
const showDeleteModal = ref(false)
const userToDelete = ref<UserWithStats | null>(null)

const filters = ref({
  search: '',
  role: '',
  actif: '',
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
})

const stats = computed(() => {
  return {
    total: pagination.value.total,
    actifs: users.value.filter(u => u.actif).length,
    inactifs: users.value.filter(u => !u.actif).length,
    admins: users.value.filter(u => u.role.code === 'admin').length,
  }
})

const hasFilters = computed(() => {
  return filters.value.search || filters.value.role || filters.value.actif
})

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

const toggleUserStatus = async (user: UserWithStats) => {
  try {
    if (user.actif) {
      await utilisateursService.desactiverUtilisateur(user.id)
    } else {
      await utilisateursService.activerUtilisateur(user.id)
    }
    user.actif = !user.actif
  } catch (error) {
    console.error('Error toggling user status:', error)
  }
}

const confirmDelete = (user: UserWithStats) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  try {
    await utilisateursService.deleteUtilisateur(userToDelete.value.id)
    users.value = users.value.filter(u => u.id !== userToDelete.value!.id)
    pagination.value.total--
    showDeleteModal.value = false
    userToDelete.value = null
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

const loadUsers = async () => {
  isLoading.value = true
  loadError.value = null
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.role) params.role_code = filters.value.role
    if (filters.value.actif !== '') params.actif = filters.value.actif === 'true'

    const response = await utilisateursService.getUtilisateurs(params)
    users.value = response.items
    pagination.value.total = response.total
  } catch (error: any) {
    console.error('Error loading users:', error)
    loadError.value = error?.message || 'Impossible de charger les utilisateurs'
    users.value = []
    pagination.value.total = 0
  } finally {
    isLoading.value = false
  }
}

const loadRoles = () => {
  // Roles are defined as an enum in the backend, not a dynamic table
  roles.value = [
    { id: '1', code: 'admin', nom: 'Administrateur', actif: true },
    { id: '2', code: 'editeur', nom: 'Éditeur', actif: true },
    { id: '3', code: 'lecteur', nom: 'Lecteur', actif: true },
    { id: '4', code: 'commune', nom: 'Commune', actif: true },
  ]
}

// Watch filters
watch(filters, () => {
  pagination.value.page = 1
  loadUsers()
}, { deep: true })

// Watch pagination
watch(() => pagination.value.page, () => {
  loadUsers()
})

onMounted(() => {
  loadRoles()
  loadUsers()
})
</script>
