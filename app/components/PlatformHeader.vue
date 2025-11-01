<script setup lang="ts">
// Composant d'en-tête de la plateforme
</script>

<template>
  <header class="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 shadow-lg print:shadow-none">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Logo et Titre -->
        <div class="flex items-center gap-4">
          <!-- Logo TI Madagascar (placeholder) -->
          <div class="bg-white p-3 rounded-lg shadow-md">
            <svg class="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6V8.5l6-3.14V20z"/>
            </svg>
          </div>

          <!-- Titre -->
          <div class="text-center md:text-left">
            <h1 class="text-2xl md:text-3xl font-bold text-white leading-tight">
              Plateforme de Suivi des Revenus Miniers
            </h1>
            <p class="text-blue-100 text-sm md:text-base mt-1">
              Collectivités Territoriales de Madagascar
            </p>
          </div>
        </div>

        <!-- Logos organisations -->
        <div class="flex items-center gap-3 print:hidden">
          <div class="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
            <p class="text-white text-xs font-semibold">PCQVP Madagascar</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
            <p class="text-white text-xs font-semibold">TI Madagascar</p>
          </div>
        </div>
      </div>

      <!-- Description / Mission -->
      <div class="mt-4 text-center md:text-left max-w-3xl">
        <p class="text-blue-100 text-sm leading-relaxed">
          Cette plateforme permet de consulter les comptes administratifs des collectivités territoriales
          bénéficiaires des revenus miniers dans le cadre du projet
          <span class="font-semibold text-white">"Minerais critiques : justice fiscale et redistribution de revenus"</span>.
        </p>
      </div>
    </div>

    <!-- Bande informative -->
    <div class="bg-blue-900/50 border-t border-white/10 print:hidden">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex flex-wrap items-center justify-center md:justify-between gap-4 text-sm text-blue-100">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <span>Transparence • Redevabilité • Bonne Gouvernance</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            <span>Données publiques et accessibles à tous</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
@media print {
  header {
    background: #1d4ed8 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
