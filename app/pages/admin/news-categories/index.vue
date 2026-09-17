<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
</script>

<template>
  <AdminCategoryManager
    endpoint="/api/admin/news-categories"
    draft-key="news-categories"
    title="Catégories d'actualités"
    subtitle="Créez autant de catégories que nécessaire (actualités, blogs, opinions, annonces…) pour classer les actualités"
    count-key="newsCount"
    count-column-label="Actualités"
    count-unit-label="actualité(s)"
    name-placeholder="Ex: Blog, Opinion, Annonce"
  />
</template>
