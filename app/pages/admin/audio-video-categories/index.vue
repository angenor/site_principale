<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
</script>

<template>
  <AdminCategoryManager
    endpoint="/api/admin/audio-video-categories"
    draft-key="audio-video-categories"
    title="Catégories d'audios/vidéos"
    subtitle="Créez autant de catégories que nécessaire (éducation, face-à-face, podcast…) ; elles sont indiquées sur chaque audio/vidéo"
    count-key="itemCount"
    count-column-label="Audios/vidéos"
    count-unit-label="audio(s)/vidéo(s)"
    name-placeholder="Ex: Éducation, Face-à-face, Podcast"
  />
</template>
