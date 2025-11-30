<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { isAdmin, user: currentUser } = useAuth()

// Redirect if not admin
if (!isAdmin.value) {
  navigateTo('/admin')
}

type UserRole = 'ADMIN' | 'EDITOR'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

const { data: users, refresh } = await useFetch<User[]>('/api/admin/users')

const showForm = ref(false)
const editingUser = ref<User | null>(null)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'EDITOR' as UserRole,
  isActive: true
})

function openNewForm() {
  editingUser.value = null
  form.value = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'EDITOR',
    isActive: true
  }
  showForm.value = true
}

function editUser(user: User) {
  editingUser.value = user
  form.value = {
    email: user.email,
    password: '',
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingUser.value = null
  error.value = ''
}

async function saveUser() {
  error.value = ''
  success.value = ''

  if (!form.value.email.trim()) {
    error.value = 'L\'email est requis'
    return
  }

  if (!editingUser.value && !form.value.password.trim()) {
    error.value = 'Le mot de passe est requis pour un nouvel utilisateur'
    return
  }

  if (!form.value.firstName.trim() || !form.value.lastName.trim()) {
    error.value = 'Le prénom et le nom sont requis'
    return
  }

  isSaving.value = true

  try {
    const payload: Record<string, unknown> = {
      email: form.value.email,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      role: form.value.role,
      isActive: form.value.isActive
    }

    if (form.value.password.trim()) {
      payload.password = form.value.password
    }

    if (editingUser.value) {
      await $fetch(`/api/admin/users/${editingUser.value.id}`, {
        method: 'PUT',
        body: payload
      })
      success.value = 'Utilisateur mis à jour'
    } else {
      payload.password = form.value.password
      await $fetch('/api/admin/users', {
        method: 'POST',
        body: payload
      })
      success.value = 'Utilisateur créé'
    }

    closeForm()
    refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage || 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

async function deleteUser(user: User) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} ?`)) return

  try {
    await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    success.value = 'Utilisateur supprimé'
    refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage || 'Erreur lors de la suppression'
  }
}

async function toggleActive(user: User) {
  try {
    await $fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      body: { isActive: !user.isActive }
    })
    success.value = user.isActive ? 'Utilisateur désactivé' : 'Utilisateur activé'
    refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err.data?.statusMessage || 'Erreur lors de la mise à jour'
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Jamais'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Utilisateurs</h2>
        <p class="text-gray-600 dark:text-gray-400">Gérer les comptes administrateurs</p>
      </div>
      <button
        @click="openNewForm"
        class="inline-flex items-center gap-2 px-4 py-2 bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
      >
        <font-awesome-icon icon="plus" />
        Nouvel utilisateur
      </button>
    </div>

    <!-- Messages -->
    <div v-if="error && !showForm" class="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="circle-exclamation" />
      {{ error }}
    </div>
    <div v-if="success" class="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="check-circle" />
      {{ success }}
    </div>

    <!-- User Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
          </h3>
          <button @click="closeForm" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div v-if="error" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
            {{ error }}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom *</label>
              <input v-model="form.firstName" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
              <input v-model="form.lastName" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
            <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe {{ editingUser ? '(laisser vide pour ne pas changer)' : '*' }}
            </label>
            <input v-model="form.password" type="password" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
            <select v-model="form.role" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="EDITOR">Éditeur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <input v-model="form.isActive" type="checkbox" id="userActive" class="w-4 h-4 text-ti-blue border-gray-300 rounded cursor-pointer" />
            <label for="userActive" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Compte actif</label>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button @click="closeForm" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
            Annuler
          </button>
          <button @click="saveUser" :disabled="isSaving" class="px-4 py-2 bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
            <font-awesome-icon v-if="isSaving" icon="spinner" class="animate-spin mr-2" />
            {{ editingUser ? 'Mettre à jour' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Users list -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div v-if="users && users.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Utilisateur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rôle
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Dernière connexion
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-ti-blue flex items-center justify-center text-white font-medium">
                    {{ user.firstName[0] }}{{ user.lastName[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ user.firstName }} {{ user.lastName }}
                      <span v-if="user.id === currentUser?.id" class="text-xs text-ti-blue">(vous)</span>
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                  ]"
                >
                  {{ user.role === 'ADMIN' ? 'Administrateur' : 'Éditeur' }}
                </span>
              </td>
              <td class="px-6 py-4 hidden md:table-cell">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(user.lastLoginAt) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <button
                  @click="toggleActive(user)"
                  :disabled="user.id === currentUser?.id"
                  :class="[
                    user.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer disabled:cursor-not-allowed transition-colors'
                  ]"
                >
                  {{ user.isActive ? 'Actif' : 'Inactif' }}
                </button>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editUser(user)"
                    class="p-2 text-gray-400 hover:text-ti-blue transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <font-awesome-icon icon="edit" />
                  </button>
                  <button
                    v-if="user.id !== currentUser?.id"
                    @click="deleteUser(user)"
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <font-awesome-icon icon="trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="p-8 text-center">
        <font-awesome-icon icon="users" class="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
        <p class="text-gray-600 dark:text-gray-400">Aucun utilisateur</p>
      </div>
    </div>
  </div>
</template>
