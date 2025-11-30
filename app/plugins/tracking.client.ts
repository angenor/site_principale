export default defineNuxtPlugin((nuxtApp) => {
  const { trackPageVisit } = useTracking()

  // Track initial page load
  nuxtApp.hook('app:mounted', () => {
    trackPageVisit()
  })

  // Track page navigations
  nuxtApp.hook('page:finish', () => {
    trackPageVisit()
  })
})
