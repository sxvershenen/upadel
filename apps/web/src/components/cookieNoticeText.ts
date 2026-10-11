export function cookieNoticeParts(text: string) {
  const start = text.indexOf('*')
  const end = text.indexOf('*', start + 1)
  if (start < 0 || end < 0) return { before: text, linked: '', after: '' }
  return {
    before: text.slice(0, start),
    linked: text.slice(start + 1, end),
    after: text.slice(end + 1),
  }
}
