<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
</script>

<template>
  <AdminCategoryManager
    endpoint="/api/admin/report-categories"
    draft-key="report-categories"
    title="Catégories de signalement"
    subtitle="Catégories proposées aux dénonciateurs dans le formulaire « Signaler un cas »"
    count-key="reportCount"
    count-column-label="Signalements"
    count-unit-label="signalement(s)"
    name-placeholder="Ex: Impact environnemental, Corruption"
  />
</template>
