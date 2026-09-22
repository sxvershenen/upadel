export function createRetryableRuntimeLoader<T>(
  importRuntime: () => Promise<T>,
  acceptRuntime: (runtime: T) => void,
) {
  let runtime: T | null = null
  let pending: Promise<boolean> | null = null

  return () => {
    if (runtime) return Promise.resolve(true)
    if (pending) return pending

    pending = importRuntime()
      .then((nextRuntime) => {
        runtime = nextRuntime
        acceptRuntime(nextRuntime)
        return true
      })
      .catch(() => false)
      .finally(() => { pending = null })
    return pending
  }
}

export async function loadRuntimeForNavigation(options: {
  load: () => Promise<boolean>
  href: string
  isReady: () => boolean
  assign: (href: string) => void
}) {
  const loaded = await options.load()
  if (!loaded && !options.isReady()) {
    options.assign(options.href)
    return false
  }
  return true
}
