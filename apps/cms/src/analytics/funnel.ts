export type FunnelInput = { occurredAt: string; sessionId: string; objectKey: string; step: string }

/** Counts each ordered funnel step once for a session/object pair. Later steps are
 * accepted only after every preceding step occurred, preventing retries and
 * out-of-order events from inflating the funnel. */
export function orderedFunnel(events: FunnelInput[], steps: string[]): Record<string, Set<string>> {
  const output = Object.fromEntries(steps.map((step) => [step, new Set<string>()])) as Record<string, Set<string>>
  const progress = new Map<string, number>()
  for (const event of [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))) {
    const key = `${event.sessionId}\u0000${event.objectKey}`
    const expected = progress.get(key) ?? 0
    if (event.step !== steps[expected]) continue
    output[event.step].add(key)
    progress.set(key, expected + 1)
  }
  return output
}

