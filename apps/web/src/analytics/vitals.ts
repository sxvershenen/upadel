export type InteractionTiming = { interactionId: number; duration: number }

/** Mirrors the web-vitals INP candidate rule: the worst interaction for fewer
 * than 50 interactions, then excludes one additional worst interaction per 50. */
export function calculateINP(entries: Iterable<InteractionTiming>, interactionCount: number): number | null {
  const byInteraction = new Map<number, number>()
  for (const entry of entries) if (entry.interactionId > 0 && Number.isFinite(entry.duration)) byInteraction.set(entry.interactionId, Math.max(byInteraction.get(entry.interactionId) ?? 0, entry.duration))
  const descending = [...byInteraction.values()].sort((a, b) => b - a)
  if (!descending.length) return null
  return descending[Math.min(descending.length - 1, Math.floor(Math.max(interactionCount, descending.length) / 50))]
}

