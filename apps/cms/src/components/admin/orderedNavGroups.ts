export type OrderedNavGroup = { label: string; entities: unknown[] }

const groupOrder = ['Обращения', 'Страницы / разделы', 'Услуги и цены', 'Турниры', 'Публикации', 'Медиатека', 'Настройки']

export function orderPayloadNavGroups<T extends OrderedNavGroup>(groups: T[]): T[] {
  const rank = (label: string) => {
    const index = groupOrder.indexOf(label)
    return index < 0 ? groupOrder.length : index
  }
  return [...groups]
    .map((group, index) => ({ group, index }))
    .sort((a, b) => rank(a.group.label) - rank(b.group.label) || a.index - b.index)
    .map(({ group }) => group)
}
