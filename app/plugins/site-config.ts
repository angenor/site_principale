/**
 * Plugin pour charger la configuration du site au démarrage de l'application
 * Assure que la config est disponible avant le rendu des composants
 */
export default defineNuxtPlugin(async () => {
  // Utiliser le composable
  const { loadConfig, siteConfig } = useAppSettings()

  // Charger la config seulement si elle n'est pas déjà chargée
  if (Object.keys(siteConfig.value).length === 0) {
    await loadConfig()
  }
})
