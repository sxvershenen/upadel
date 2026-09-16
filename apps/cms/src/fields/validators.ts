export function validateUniqueRowsByKey(
  value: null | undefined | unknown[],
  key: string,
  message = 'Значения в списке не должны повторяться.',
): string | true {
  if (!Array.isArray(value)) return true

  const selected = value.flatMap((row) => {
    if (typeof row !== 'object' || row === null) return []
    const fieldValue = (row as Record<string, unknown>)[key]
    return typeof fieldValue === 'string' ? [fieldValue] : []
  })
  return new Set(selected).size === selected.length ? true : message
}
