<template>
  <div class="space-y-6">
    <!-- Section title -->
    <UiFormInput
      v-model="localSection.titre"
      label="Titre de la section"
      placeholder="Titre affiché (optionnel)"
    />

    <!-- Visibility toggle -->
    <div class="flex items-center gap-3">
      <UiFormSwitch
        v-model="localSection.est_visible"
        label="Section visible"
      />
      <span class="text-sm text-[var(--text-muted)]">
        {{ localSection.est_visible ? 'La section sera affichée sur la page' : 'La section sera masquée' }}
      </span>
    </div>

    <hr class="border-[var(--border-default)]" />

    <!-- Content editor based on type -->
    <div class="min-h-[200px]">
      <!-- EditorJS / Texte riche -->
      <template v-if="localSection.type === 'editorjs'">
        <AdminCmsEditorJSBlock v-model="localSection.contenu" />
      </template>

      <!-- Bloc image gauche/droite -->
      <template v-else-if="localSection.type === 'bloc_image_gauche' || localSection.type === 'bloc_image_droite'">
        <AdminCmsImageTextBlock
          v-model="localSection.contenu"
          :image-position="localSection.type === 'bloc_image_gauche' ? 'left' : 'right'"
        />
      </template>

      <!-- Carte avec fond -->
      <template v-else-if="localSection.type === 'carte_fond_image'">
        <AdminCmsCardBackgroundEditor v-model="localSection.contenu" />
      </template>

      <!-- Grille de cartes -->
      <template v-else-if="localSection.type === 'grille_cartes'">
        <AdminCmsCardsGridEditor v-model="localSection.contenu" />
      </template>

      <!-- Galerie photos -->
      <template v-else-if="localSection.type === 'galerie_photos'">
        <AdminCmsGalleryEditor v-model="localSection.contenu" />
      </template>

      <!-- Liens utiles -->
      <template v-else-if="localSection.type === 'liens_utiles'">
        <AdminCmsLinksEditor v-model="localSection.contenu" />
      </template>

      <!-- Note informative -->
      <template v-else-if="localSection.type === 'note_informative'">
        <AdminCmsNoteEditor v-model="localSection.contenu" />
      </template>

      <!-- Tableau financier -->
      <template v-else-if="localSection.type === 'tableau_financier'">
        <AdminCmsFinancialTableEditor v-model="localSection.contenu" />
      </template>

      <!-- Graphiques -->
      <template v-else-if="localSection.type === 'graphiques_analytiques'">
        <AdminCmsChartEditor v-model="localSection.contenu" />
      </template>

      <!-- Fallback -->
      <template v-else>
        <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p class="text-amber-800 dark:text-amber-200">
            Type de section non pris en charge : {{ localSection.type }}
          </p>
        </div>
      </template>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
      <UiButton variant="outline" @click="$emit('cancel')">
        Annuler
      </UiButton>
      <UiButton variant="primary" @click="save" :icon="['fas', 'save']">
        Enregistrer
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SectionCMS } from '~/services/cms.service'

interface Props {
  section: SectionCMS
}

const props = defineProps<Props>()
const emit = defineEmits<{
  save: [section: Partial<SectionCMS>]
  cancel: []
}>()

// Local copy of section to edit
const localSection = ref({
  ...props.section,
  contenu: { ...props.section.contenu },
})

const save = () => {
  emit('save', {
    titre: localSection.value.titre,
    contenu: localSection.value.contenu,
    est_visible: localSection.value.est_visible,
  })
}
</script>
