export const requiredPageLinks = [
  { label: 'Цены', href: '/prices' },
  { label: 'Тренировки', href: '/training' },
  { label: 'Тренеры', href: '/coaches' },
  { label: 'Турниры', href: '/tournaments' },
  { label: 'Статьи', href: '/blog' },
  { label: 'Подарить', href: '/gift' },
  { label: 'О нас', href: '/about' },
] as const

export const priceNavigationChildren = [
  { label: 'Аренда', href: '/prices' },
  { label: 'Тренировки', href: '/training' },
  { label: 'Тренеры', href: '/coaches' },
] as const

export const desktopNavigationLinks = requiredPageLinks.filter(({ href }) => href !== '/training' && href !== '/coaches')

type NavigationRow = { label: string; href: string; [key: string]: unknown }

const aliases: Record<string, string> = {
  'О клубе': 'О нас',
  'О клубе': 'О нас',
  Блог: 'Статьи',
}

export function mergeRequiredNavigation<T extends NavigationRow>(rows: T[], additions: ReadonlyArray<NavigationRow>, maxRows = 8): T[] {
  const normalized = rows.map((row) => ({ ...row, label: aliases[row.label] ?? row.label })) as T[]
  const result: T[] = []
  const consumed = new Set<number>()

  for (const required of additions) {
    const index = normalized.findIndex((row, rowIndex) => !consumed.has(rowIndex) && row.label === required.label)
    if (index >= 0) {
      consumed.add(index)
      result.push({ ...normalized[index], ...required })
    } else {
      result.push(required as T)
    }
  }

  normalized.forEach((row, index) => {
    if (!consumed.has(index) && row.label !== 'Контакты') result.push(row)
  })
  return result.slice(0, Math.max(additions.length, maxRows))
}

export function ensureDesktopNavigationChildren<T extends NavigationRow>(rows: T[]): T[] {
  return rows.map((row) => {
    if (row.href !== '/prices' || row.children != null) return row
    return { ...row, children: priceNavigationChildren.map((child) => ({ ...child })) }
  })
}

export function normalizeDesktopNavigation<T extends NavigationRow>(rows: T[]): T[] {
  const groupedHrefs = new Set<string>(priceNavigationChildren.map(({ href }) => href).filter((href) => href !== '/prices'))
  const withoutGroupedTopLevel = rows.filter((row) => !groupedHrefs.has(row.href))
  return ensureDesktopNavigationChildren(mergeRequiredNavigation(withoutGroupedTopLevel, desktopNavigationLinks))
}

export function navigationChanged<T extends NavigationRow>(before: T[], after: T[]): boolean {
  return before.length !== after.length || after.some((row, index) => row.label !== before[index]?.label || row.href !== before[index]?.href || row.column !== before[index]?.column || JSON.stringify(row.children ?? null) !== JSON.stringify(before[index]?.children ?? null))
}
