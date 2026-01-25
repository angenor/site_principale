<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

type TabType = 'axes' | 'partners' | 'gallery'

interface StrategicAxis {
  id: string
  title: string
  description: string
  icon: string | null
  color: string | null
  backgroundImage: string | null
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
}

interface Partner {
  id: string
  name: string
  logo: string
  websiteUrl: string | null
  description: string | null
  sortOrder: number
  isActive: boolean
}

interface GalleryImage {
  id: string
  title: string | null
  description: string | null
  imageUrl: string
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
}

const activeTab = ref<TabType>('axes')

// Strategic axes
const { data: axes, refresh: refreshAxes } = await useFetch<StrategicAxis[]>('/api/admin/strategic-axes')
const editingAxis = ref<StrategicAxis | null>(null)
const newAxis = ref({
  title: '',
  description: '',
  icon: '',
  color: '#3695d8',
  backgroundImage: '',
  linkUrl: '',
  isActive: true
})

// Partners
const { data: partners, refresh: refreshPartners } = await useFetch<Partner[]>('/api/admin/partners')
const editingPartner = ref<Partner | null>(null)
const newPartner = ref({
  name: '',
  logo: '',
  websiteUrl: '',
  description: '',
  isActive: true
})

// Gallery
const { data: gallery, refresh: refreshGallery } = await useFetch<GalleryImage[]>('/api/admin/gallery')
const editingImage = ref<GalleryImage | null>(null)
const newImage = ref({
  title: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  isActive: true
})

const isSaving = ref(false)
const error = ref('')
const success = ref('')

// Tab configuration
const tabs = [
  { id: 'axes' as const, label: 'Axes stratégiques', icon: 'bullseye' },
  { id: 'partners' as const, label: 'Partenaires', icon: 'building' },
  { id: 'gallery' as const, label: 'Slider accueil', icon: 'image' }
]

// Strategic Axes CRUD
async function saveAxis() {
  error.value = ''
  success.value = ''

  if (!newAxis.value.title.trim() || !newAxis.value.description.trim()) {
    error.value = 'Le titre et la description sont requis'
    return
  }

  isSaving.value = true
  try {
    if (editingAxis.value) {
      await $fetch(`/api/admin/strategic-axes/${editingAxis.value.id}`, {
        method: 'PUT',
        body: newAxis.value
      })
      success.value = 'Axe stratégique mis à jour'
    } else {
      await $fetch('/api/admin/strategic-axes', {
        method: 'POST',
        body: newAxis.value
      })
      success.value = 'Axe stratégique créé'
    }
    resetAxisForm()
    refreshAxes()
  } catch {
    error.value = 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

function editAxis(axis: StrategicAxis) {
  editingAxis.value = axis
  newAxis.value = {
    title: axis.title,
    description: axis.description,
    icon: axis.icon || '',
    color: axis.color || '#3695d8',
    backgroundImage: axis.backgroundImage || '',
    linkUrl: axis.linkUrl || '',
    isActive: axis.isActive
  }
}

function resetAxisForm() {
  editingAxis.value = null
  newAxis.value = {
    title: '',
    description: '',
    icon: '',
    color: '#3695d8',
    backgroundImage: '',
    linkUrl: '',
    isActive: true
  }
}

async function deleteAxis(id: string) {
  if (!confirm('Supprimer cet axe stratégique ?')) return
  try {
    await $fetch(`/api/admin/strategic-axes/${id}`, { method: 'DELETE' })
    refreshAxes()
    success.value = 'Axe stratégique supprimé'
  } catch {
    error.value = 'Erreur lors de la suppression'
  }
}

// Partners CRUD
async function savePartner() {
  error.value = ''
  success.value = ''

  if (!newPartner.value.name.trim() || !newPartner.value.logo.trim()) {
    error.value = 'Le nom et le logo sont requis'
    return
  }

  isSaving.value = true
  try {
    if (editingPartner.value) {
      await $fetch(`/api/admin/partners/${editingPartner.value.id}`, {
        method: 'PUT',
        body: newPartner.value
      })
      success.value = 'Partenaire mis à jour'
    } else {
      await $fetch('/api/admin/partners', {
        method: 'POST',
        body: newPartner.value
      })
      success.value = 'Partenaire créé'
    }
    resetPartnerForm()
    refreshPartners()
  } catch {
    error.value = 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

function editPartner(partner: Partner) {
  editingPartner.value = partner
  newPartner.value = {
    name: partner.name,
    logo: partner.logo,
    websiteUrl: partner.websiteUrl || '',
    description: partner.description || '',
    isActive: partner.isActive
  }
}

function resetPartnerForm() {
  editingPartner.value = null
  newPartner.value = {
    name: '',
    logo: '',
    websiteUrl: '',
    description: '',
    isActive: true
  }
}

async function deletePartner(id: string) {
  if (!confirm('Supprimer ce partenaire ?')) return
  try {
    await $fetch(`/api/admin/partners/${id}`, { method: 'DELETE' })
    refreshPartners()
    success.value = 'Partenaire supprimé'
  } catch {
    error.value = 'Erreur lors de la suppression'
  }
}

// Gallery CRUD
async function saveImage() {
  error.value = ''
  success.value = ''

  if (!newImage.value.imageUrl.trim()) {
    error.value = 'L\'URL de l\'image est requise'
    return
  }

  isSaving.value = true
  try {
    if (editingImage.value) {
      await $fetch(`/api/admin/gallery/${editingImage.value.id}`, {
        method: 'PUT',
        body: newImage.value
      })
      success.value = 'Image mise à jour'
    } else {
      await $fetch('/api/admin/gallery', {
        method: 'POST',
        body: newImage.value
      })
      success.value = 'Image ajoutée'
    }
    resetImageForm()
    refreshGallery()
  } catch {
    error.value = 'Erreur lors de l\'enregistrement'
  } finally {
    isSaving.value = false
  }
}

function editImage(image: GalleryImage) {
  editingImage.value = image
  newImage.value = {
    title: image.title || '',
    description: image.description || '',
    imageUrl: image.imageUrl,
    linkUrl: image.linkUrl || '',
    isActive: image.isActive
  }
}

function resetImageForm() {
  editingImage.value = null
  newImage.value = {
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true
  }
}

async function deleteImage(id: string) {
  if (!confirm('Supprimer cette image ?')) return
  try {
    await $fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
    refreshGallery()
    success.value = 'Image supprimée'
  } catch {
    error.value = 'Erreur lors de la suppression'
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-heading font-bold text-gray-900 dark:text-white">Gestion du contenu</h2>
      <p class="text-gray-600 dark:text-gray-400">Gérer les éléments de la page d'accueil</p>
    </div>

    <!-- Messages -->
    <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="circle-exclamation" />
      {{ error }}
    </div>
    <div v-if="success" class="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
      <font-awesome-icon icon="check-circle" />
      {{ success }}
    </div>

    <!-- Tabs -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-ti-blue text-ti-blue'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300',
              'flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors cursor-pointer'
            ]"
          >
            <font-awesome-icon :icon="tab.icon" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Axes stratégiques -->
      <div v-if="activeTab === 'axes'" class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Form -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
              {{ editingAxis ? 'Modifier l\'axe' : 'Nouvel axe stratégique' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
                <input v-model="newAxis.title" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea v-model="newAxis.description" rows="3" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icône</label>
                  <IconPicker v-model="newAxis.icon" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur</label>
                  <input v-model="newAxis.color" type="color" class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image de fond</label>
                <ImageUpload v-model="newAxis.backgroundImage" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lien</label>
                <input v-model="newAxis.linkUrl" type="url" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div class="flex items-center gap-2">
                <input v-model="newAxis.isActive" type="checkbox" id="axisActive" class="w-4 h-4 text-ti-blue border-gray-300 rounded cursor-pointer" />
                <label for="axisActive" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Actif</label>
              </div>
              <div class="flex gap-2">
                <button @click="saveAxis" :disabled="isSaving" class="px-4 py-2 bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
                  <font-awesome-icon v-if="isSaving" icon="spinner" class="animate-spin mr-2" />
                  {{ editingAxis ? 'Mettre à jour' : 'Ajouter' }}
                </button>
                <button v-if="editingAxis" @click="resetAxisForm" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors cursor-pointer">
                  Annuler
                </button>
              </div>
            </div>
          </div>

          <!-- List -->
          <div class="space-y-3">
            <div v-for="axis in axes" :key="axis.id" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-start gap-4">
              <div v-if="axis.icon" class="w-10 h-10 rounded-lg flex items-center justify-center text-white" :style="{ backgroundColor: axis.color || '#3695d8' }">
                <font-awesome-icon :icon="axis.icon" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ axis.title }}</h4>
                  <span v-if="!axis.isActive" class="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">Inactif</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ axis.description }}</p>
              </div>
              <div class="flex gap-1">
                <button @click="editAxis(axis)" class="p-2 text-gray-400 hover:text-ti-blue transition-colors cursor-pointer">
                  <font-awesome-icon icon="edit" />
                </button>
                <button @click="deleteAxis(axis.id)" class="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                  <font-awesome-icon icon="trash" />
                </button>
              </div>
            </div>
            <p v-if="!axes?.length" class="text-center text-gray-500 dark:text-gray-400 py-8">Aucun axe stratégique</p>
          </div>
        </div>
      </div>

      <!-- Partenaires -->
      <div v-if="activeTab === 'partners'" class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Form -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
              {{ editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                <input v-model="newPartner.name" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo *</label>
                <ImageUpload v-model="newPartner.logo" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site web</label>
                <input v-model="newPartner.websiteUrl" type="url" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea v-model="newPartner.description" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none" />
              </div>
              <div class="flex items-center gap-2">
                <input v-model="newPartner.isActive" type="checkbox" id="partnerActive" class="w-4 h-4 text-ti-blue border-gray-300 rounded cursor-pointer" />
                <label for="partnerActive" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Actif</label>
              </div>
              <div class="flex gap-2">
                <button @click="savePartner" :disabled="isSaving" class="px-4 py-2 bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
                  <font-awesome-icon v-if="isSaving" icon="spinner" class="animate-spin mr-2" />
                  {{ editingPartner ? 'Mettre à jour' : 'Ajouter' }}
                </button>
                <button v-if="editingPartner" @click="resetPartnerForm" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors cursor-pointer">
                  Annuler
                </button>
              </div>
            </div>
          </div>

          <!-- List -->
          <div class="grid grid-cols-2 gap-3">
            <div v-for="partner in partners" :key="partner.id" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <img :src="partner.logo" :alt="partner.name" class="h-12 object-contain mb-2" />
              <div class="flex items-center gap-2">
                <h4 class="font-medium text-gray-900 dark:text-white text-sm">{{ partner.name }}</h4>
                <span v-if="!partner.isActive" class="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">Inactif</span>
              </div>
              <div class="flex gap-1 mt-2">
                <button @click="editPartner(partner)" class="p-1.5 text-gray-400 hover:text-ti-blue transition-colors cursor-pointer">
                  <font-awesome-icon icon="edit" class="w-3 h-3" />
                </button>
                <button @click="deletePartner(partner.id)" class="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                  <font-awesome-icon icon="trash" class="w-3 h-3" />
                </button>
              </div>
            </div>
            <p v-if="!partners?.length" class="col-span-2 text-center text-gray-500 dark:text-gray-400 py-8">Aucun partenaire</p>
          </div>
        </div>
      </div>

      <!-- Gallery -->
      <div v-if="activeTab === 'gallery'" class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Form -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
              {{ editingImage ? 'Modifier l\'image' : 'Nouvelle image' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image *</label>
                <ImageUpload v-model="newImage.imageUrl" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                <input v-model="newImage.title" type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea v-model="newImage.description" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lien au clic</label>
                <input v-model="newImage.linkUrl" type="url" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div class="flex items-center gap-2">
                <input v-model="newImage.isActive" type="checkbox" id="imageActive" class="w-4 h-4 text-ti-blue border-gray-300 rounded cursor-pointer" />
                <label for="imageActive" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Active</label>
              </div>
              <div class="flex gap-2">
                <button @click="saveImage" :disabled="isSaving" class="px-4 py-2 bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
                  <font-awesome-icon v-if="isSaving" icon="spinner" class="animate-spin mr-2" />
                  {{ editingImage ? 'Mettre à jour' : 'Ajouter' }}
                </button>
                <button v-if="editingImage" @click="resetImageForm" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors cursor-pointer">
                  Annuler
                </button>
              </div>
            </div>
          </div>

          <!-- List -->
          <div class="grid grid-cols-2 gap-3">
            <div v-for="image in gallery" :key="image.id" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden">
              <img :src="image.imageUrl" :alt="image.title || 'Image'" class="w-full h-24 object-cover" />
              <div class="p-3">
                <div class="flex items-center gap-2">
                  <h4 class="font-medium text-gray-900 dark:text-white text-sm truncate">{{ image.title || 'Sans titre' }}</h4>
                  <span v-if="!image.isActive" class="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">Inactive</span>
                </div>
                <div class="flex gap-1 mt-2">
                  <button @click="editImage(image)" class="p-1.5 text-gray-400 hover:text-ti-blue transition-colors cursor-pointer">
                    <font-awesome-icon icon="edit" class="w-3 h-3" />
                  </button>
                  <button @click="deleteImage(image.id)" class="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                    <font-awesome-icon icon="trash" class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <p v-if="!gallery?.length" class="col-span-2 text-center text-gray-500 dark:text-gray-400 py-8">Aucune image</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
