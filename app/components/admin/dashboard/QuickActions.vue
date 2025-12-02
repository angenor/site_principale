<template>
  <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6 shadow-sm">
    <h2 class="font-heading text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide mb-4">
      Actions Rapides
    </h2>

    <div class="space-y-3">
      <NuxtLink
        v-for="action in actions"
        :key="action.to"
        :to="action.to"
        class="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-light)] hover:border-[var(--color-primary)] hover:bg-[var(--interactive-hover)] transition-all group"
      >
        <div
          :class="[
            'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
            action.iconBg || 'bg-[var(--color-primary-50)]',
            'group-hover:bg-[var(--color-primary)] group-hover:text-white'
          ]"
        >
          <font-awesome-icon
            :icon="action.icon"
            :class="[action.iconColor || 'text-[var(--color-primary)]', 'group-hover:text-white']"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-[var(--text-primary)]">
            {{ action.label }}
          </p>
          <p class="text-xs text-[var(--text-muted)] truncate">
            {{ action.description }}
          </p>
        </div>
        <font-awesome-icon
          :icon="['fas', 'chevron-right']"
          class="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
interface QuickAction {
  to: string
  label: string
  description: string
  icon: string[]
  iconBg?: string
  iconColor?: string
}

interface Props {
  actions?: QuickAction[]
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [
    {
      to: '/admin/import',
      label: 'Importer des données',
      description: 'Fichier Excel ou CSV',
      icon: ['fas', 'file-import'],
    },
    {
      to: '/admin/comptes-administratifs',
      label: 'Comptes administratifs',
      description: 'Gérer les comptes',
      icon: ['fas', 'file-invoice-dollar'],
    },
    {
      to: '/admin/utilisateurs',
      label: 'Utilisateurs',
      description: 'Gérer les accès',
      icon: ['fas', 'users'],
    },
    {
      to: '/admin/geo/communes',
      label: 'Communes',
      description: 'Données géographiques',
      icon: ['fas', 'map-location-dot'],
    },
  ],
})
</script>
