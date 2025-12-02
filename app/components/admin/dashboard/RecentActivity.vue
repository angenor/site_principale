<template>
  <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
        Activité Récente
      </h2>
      <NuxtLink
        to="/admin/statistiques/audit"
        class="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-700)] transition-colors"
      >
        Voir tout
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="flex items-start gap-4">
        <UiSkeleton variant="circular" width="40" height="40" />
        <div class="flex-1">
          <UiSkeleton width="80%" class="mb-2" />
          <UiSkeleton width="40%" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <UiEmptyState
      v-else-if="!activities.length"
      :icon="['fas', 'clock-rotate-left']"
      title="Aucune activité"
      description="Aucune activité récente à afficher."
      size="sm"
    />

    <!-- Activity list -->
    <div v-else class="space-y-4">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start gap-4 pb-4 border-b border-[var(--border-light)] last:border-0 last:pb-0"
      >
        <!-- Icon -->
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
            getIconBg(activity.action)
          ]"
        >
          <font-awesome-icon :icon="getIcon(activity.action)" :class="getIconColor(activity.action)" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-[var(--text-primary)]">
            {{ formatDescription(activity) }}
          </p>
          <p class="text-xs text-[var(--text-muted)] mt-1">
            <span v-if="activity.user_name">{{ activity.user_name }} • </span>
            {{ formatTime(activity.created_at) }}
          </p>
        </div>

        <!-- Action button -->
        <NuxtLink
          v-if="activity.record_id && activity.table_name"
          :to="getDetailLink(activity)"
          class="text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'arrow-right']" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Activity {
  id: string
  action: string
  table_name?: string
  record_id?: string
  user_name?: string
  user_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  created_at: string
}

interface Props {
  activities: Activity[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

// Get icon based on action
const getIcon = (action: string): string[] => {
  const icons: Record<string, string[]> = {
    create: ['fas', 'plus'],
    insert: ['fas', 'plus'],
    update: ['fas', 'pen'],
    delete: ['fas', 'trash'],
    publish: ['fas', 'check'],
    archive: ['fas', 'box-archive'],
    login: ['fas', 'right-to-bracket'],
    logout: ['fas', 'right-from-bracket'],
    import: ['fas', 'file-import'],
    export: ['fas', 'file-export'],
    upload: ['fas', 'cloud-arrow-up'],
  }
  return icons[action.toLowerCase()] || ['fas', 'circle']
}

// Get icon background color
const getIconBg = (action: string): string => {
  const colors: Record<string, string> = {
    create: 'bg-[var(--color-success-light)]',
    insert: 'bg-[var(--color-success-light)]',
    update: 'bg-[var(--color-primary-50)]',
    delete: 'bg-[var(--color-error-light)]',
    publish: 'bg-[var(--color-success-light)]',
    archive: 'bg-[var(--color-warning-light)]',
    login: 'bg-[var(--color-info-light)]',
    logout: 'bg-[var(--color-info-light)]',
    import: 'bg-[var(--color-primary-50)]',
    export: 'bg-[var(--color-primary-50)]',
    upload: 'bg-[var(--color-info-light)]',
  }
  return colors[action.toLowerCase()] || 'bg-[var(--text-muted)]/10'
}

// Get icon color
const getIconColor = (action: string): string => {
  const colors: Record<string, string> = {
    create: 'text-[var(--color-success)]',
    insert: 'text-[var(--color-success)]',
    update: 'text-[var(--color-primary)]',
    delete: 'text-[var(--color-error)]',
    publish: 'text-[var(--color-success)]',
    archive: 'text-[var(--color-warning)]',
    login: 'text-[var(--color-info)]',
    logout: 'text-[var(--color-info)]',
    import: 'text-[var(--color-primary)]',
    export: 'text-[var(--color-primary)]',
    upload: 'text-[var(--color-info)]',
  }
  return colors[action.toLowerCase()] || 'text-[var(--text-muted)]'
}

// Format activity description
const formatDescription = (activity: Activity): string => {
  const tableLabels: Record<string, string> = {
    comptes_administratifs: 'compte administratif',
    communes: 'commune',
    regions: 'région',
    districts: 'district',
    projets_miniers: 'projet minier',
    revenus_miniers: 'revenu minier',
    utilisateurs: 'utilisateur',
    documents: 'document',
    cms_pages: 'page CMS',
    cms_sections: 'section CMS',
    newsletter_subscribers: 'abonné newsletter',
  }

  const actionLabels: Record<string, string> = {
    create: 'Création',
    insert: 'Ajout',
    update: 'Modification',
    delete: 'Suppression',
    publish: 'Publication',
    archive: 'Archivage',
    login: 'Connexion',
    logout: 'Déconnexion',
    import: 'Import',
    export: 'Export',
    upload: 'Upload',
  }

  const action = actionLabels[activity.action.toLowerCase()] || activity.action
  const table = activity.table_name ? tableLabels[activity.table_name] || activity.table_name : ''

  if (activity.new_values?.nom || activity.new_values?.titre) {
    const name = activity.new_values.nom || activity.new_values.titre
    return `${action} ${table ? `d'un ${table}` : ''}: ${name}`
  }

  return `${action}${table ? ` d'un ${table}` : ''}`
}

// Format time ago
const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours} h`
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

// Get detail link for activity
const getDetailLink = (activity: Activity): string => {
  const routes: Record<string, string> = {
    comptes_administratifs: '/admin/comptes-administratifs',
    communes: '/admin/geo/communes',
    regions: '/admin/geo/regions',
    districts: '/admin/geo/districts',
    projets_miniers: '/admin/projets',
    revenus_miniers: '/admin/revenus',
    utilisateurs: '/admin/utilisateurs',
    documents: '/admin/documents',
    cms_pages: '/admin/cms/pages',
  }

  const baseRoute = routes[activity.table_name || '']
  if (baseRoute && activity.record_id) {
    return `${baseRoute}/${activity.record_id}`
  }
  return '#'
}
</script>
