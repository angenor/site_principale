<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
      <p class="text-sm text-[var(--text-muted)] mb-1">Total Recettes</p>
      <p class="text-xl font-bold text-[var(--color-success)] font-mono">
        {{ formatMontant(recettes) }}
      </p>
    </div>
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
      <p class="text-sm text-[var(--text-muted)] mb-1">Total Dépenses</p>
      <p class="text-xl font-bold text-[var(--color-error)] font-mono">
        {{ formatMontant(depenses) }}
      </p>
    </div>
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
      <p class="text-sm text-[var(--text-muted)] mb-1">Solde</p>
      <p
        :class="[
          'text-xl font-bold font-mono',
          solde >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
        ]"
      >
        {{ formatMontant(solde) }}
      </p>
    </div>
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-4">
      <p class="text-sm text-[var(--text-muted)] mb-1">Lignes saisies</p>
      <p class="text-xl font-bold text-[var(--text-primary)] font-mono">
        {{ lignesCount }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  recettes: number
  depenses: number
  solde: number
  lignesCount: number
}

defineProps<Props>()

const formatMontant = (value: number): string => {
  if (value === null || value === undefined) return '0 Ar'
  return new Intl.NumberFormat('fr-FR').format(value) + ' Ar'
}
</script>
