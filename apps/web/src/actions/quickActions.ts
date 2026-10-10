/** Shared between independently hydrated page cards and persistent navigation. */
export const quickActionsEvent = 'unlim:quick-actions'

export function openMobileQuickActions(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia('(max-width: 767px)').matches) return false
  document.dispatchEvent(new Event(quickActionsEvent))
  return true
}
