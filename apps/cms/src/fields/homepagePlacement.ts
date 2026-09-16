import type { CollectionBeforeValidateHook, NumberField } from 'payload'

type HomepagePlacement = {
  homepageOrder?: null | number
  showOnHomepage?: boolean
}

export function createHomepageOrderField(max: number): NumberField {
  return {
    name: 'homepageOrder',
    type: 'number',
    label: 'Порядок на главной',
    min: 1,
    max,
    unique: true,
    admin: {
      condition: (_, siblingData: HomepagePlacement) => Boolean(siblingData.showOnHomepage),
      description: `Уникальный номер от 1 до ${max}; меньшие значения выводятся раньше.`,
      position: 'sidebar',
      step: 1,
    },
    validate: (value, { siblingData }) => {
      const placement = siblingData as HomepagePlacement
      if (!placement.showOnHomepage) return true

      return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= max
        ? true
        : `Для показа на главной задайте целый номер от 1 до ${max}.`
    },
  }
}

export const clearHiddenHomepageOrder: CollectionBeforeValidateHook<HomepagePlacement & { id: number | string }> = ({
  data,
  originalDoc,
}) => {
  if (!data) return data

  const showOnHomepage = data.showOnHomepage ?? originalDoc?.showOnHomepage ?? false
  if (!showOnHomepage) data.homepageOrder = null

  return data
}
