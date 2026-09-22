type IdleHandle = number

type SceneLoaderOptions<T> = {
  load: () => Promise<T>
  accept: (scene: T) => void
  isReducedMotion: () => boolean
  scheduleIdle: (callback: () => void) => IdleHandle
  cancelIdle: (handle: IdleHandle) => void
}

export function createPostNavigationSceneLoader<T>(options: SceneLoaderOptions<T>) {
  let completedVisits = 0
  let visitActive = false
  let destinationReady = false
  let idleHandle: IdleHandle | null = null
  let loading = false
  let loaded = false
  let stagedScene: T | null = null
  let disposed = false

  const schedule = () => {
    if (disposed || loaded || idleHandle !== null || completedVisits < 1 || visitActive || !destinationReady || options.isReducedMotion()) return
    idleHandle = options.scheduleIdle(() => {
      idleHandle = null
      if (disposed || loaded || visitActive || !destinationReady || options.isReducedMotion()) return
      if (stagedScene) {
        loaded = true
        options.accept(stagedScene)
        stagedScene = null
        return
      }
      if (loading) return
      loading = true
      void options.load().then((scene) => {
        if (disposed) return
        stagedScene = scene
      }).catch(() => {
        // A missing visual enhancement never delays or fails navigation.
      }).finally(() => {
        loading = false
        schedule()
      })
    })
  }

  return {
    visitStarted() {
      visitActive = true
      destinationReady = false
      if (idleHandle !== null) options.cancelIdle(idleHandle)
      idleHandle = null
    },
    destinationBecameReady() { destinationReady = true; schedule() },
    visitCompleted() { visitActive = false; completedVisits += 1; schedule() },
    visitSettled() { visitActive = false },
    motionPreferenceChanged() { schedule() },
    dispose() {
      disposed = true
      if (idleHandle !== null) options.cancelIdle(idleHandle)
      idleHandle = null
    },
  }
}

export function scheduleBrowserIdle(callback: () => void): IdleHandle {
  if (typeof window.requestIdleCallback === 'function') return window.requestIdleCallback(callback, { timeout: 1_500 })
  return window.setTimeout(callback, 500)
}

export function cancelBrowserIdle(handle: IdleHandle) {
  if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(handle)
  else window.clearTimeout(handle)
}
