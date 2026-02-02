/**
 * Composable pour partager la configuration du site entre tous les composants
 * Utilise useFetch avec une clé unique pour partager les données et gérer le cache
 */

// Clé unique pour le cache de la config
const CONFIG_KEY = 'site-config-data'

export function useAppSettings() {
  // Utiliser useState pour stocker les données de façon réactive et partagée
  const siteConfig = useState<Record<string, string>>(CONFIG_KEY, () => ({}))

  /**
   * Charger la configuration depuis l'API
   * Cette fonction doit être appelée une fois au démarrage de l'app
   */
  async function loadConfig() {
    try {
      const data = await $fetch<Record<string, string>>('/api/config')
      if (data) {
        siteConfig.value = data
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error)
    }
  }

  /**
   * Rafraîchir la configuration (utile après une modification dans le back office)
   */
  async function refreshConfig() {
    await loadConfig()
  }

  /**
   * Obtenir une valeur de configuration avec fallback
   * @param key - Clé de configuration
   * @param fallback - Valeur par défaut si la clé n'existe pas
   */
  function getConfig(key: string, fallback: string = ''): string {
    return siteConfig.value?.[key] || fallback
  }

  return {
    siteConfig,
    loadConfig,
    refreshConfig,
    getConfig
  }
}
