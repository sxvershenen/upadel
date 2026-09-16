export function validateHTTPSURL(value: unknown): string | true {
  if (!value) return true
  if (typeof value !== 'string') return 'Укажите корректный URL.'

  try {
    return new URL(value).protocol === 'https:' ? true : 'Используйте https://.'
  } catch {
    return 'Укажите корректный URL.'
  }
}

export function validateInternalLink(value: unknown): string | true {
  return typeof value === 'string' && (value.startsWith('/') || value.startsWith('#'))
    ? true
    : 'Ссылка должна начинаться с / или #.'
}

export function validateHTTPSOrPlaceholder(value: unknown): string | true {
  return value === '#' ? true : validateHTTPSURL(value)
}
