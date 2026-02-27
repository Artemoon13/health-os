/**
 * Lightweight analytics — replace with Mixpanel/Amplitude/etc. when ready.
 */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', event, props ?? '')
  }
  // Future: window.analytics?.track(event, props)
}
