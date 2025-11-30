export function useTracking() {
  const trackPageVisit = async () => {
    if (import.meta.server) return

    try {
      await $fetch('/api/track/visit', {
        method: 'POST',
        body: {
          path: window.location.pathname,
          referrer: document.referrer || null
        }
      })
    } catch {
      // Silently fail
    }
  }

  const trackDownload = async (mediaId: string) => {
    if (import.meta.server) return

    try {
      await $fetch('/api/track/download', {
        method: 'POST',
        body: { mediaId }
      })
    } catch {
      // Silently fail
    }
  }

  return {
    trackPageVisit,
    trackDownload
  }
}
