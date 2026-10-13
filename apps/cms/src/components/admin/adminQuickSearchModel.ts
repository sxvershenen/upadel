export type AdminQuickSearchTarget = {
  href: string
  label: string
  group: string
  keywords?: string
  record?: boolean
}

function normalize(value: string): string {
  return value.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е').trim()
}

export function buildRecordSearchWhere(fields: readonly string[], query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!terms.length || !fields.length) return null
  return {
    and: terms.map((term) => ({
      or: fields.map((field) => ({ [field]: { contains: term } })),
    })),
  }
}

export function filterAdminQuickSearch(targets: AdminQuickSearchTarget[], query: string): AdminQuickSearchTarget[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return []

  return targets
    .map((target) => ({
      target,
      text: normalize(`${target.label} ${target.group} ${target.keywords ?? ''} ${target.href}`),
    }))
    .filter(({ text }) => terms.every((term) => text.includes(term)))
    .sort((left, right) => {
      const leftExact = normalize(left.target.label).startsWith(terms[0]) ? 0 : 1
      const rightExact = normalize(right.target.label).startsWith(terms[0]) ? 0 : 1
      return leftExact - rightExact || left.target.label.localeCompare(right.target.label, 'ru-RU')
    })
    .slice(0, 7)
    .map(({ target }) => target)
}
