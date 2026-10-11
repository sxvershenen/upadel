import type { Field } from 'payload'

const collapsibleLabel = '/components/admin/DefaultCollapsedAccordion#DefaultCollapsedFieldLabel'
const arrayRowLabel = '/components/admin/DefaultCollapsedAccordion#DefaultCollapsedArrayRowLabel'

/** Add the one-time editor-open reset while retaining Payload's native accordion controls. */
export function applyDefaultCollapsedAccordions(fields: Field[]): Field[] {
  return fields.map((field) => {
    const next: Record<string, any> = { ...field }
    if (field.type === 'collapsible') {
      next.admin = {
        ...field.admin,
        initCollapsed: true,
        components: { ...field.admin?.components, Label: field.admin?.components?.Label ?? collapsibleLabel },
      }
      next.fields = applyDefaultCollapsedAccordions(field.fields)
    } else if (field.type === 'array') {
      // Payload's default row label reads labels.singular even when RowLabel is customized.
      // Some legacy arrays omit labels, so provide a neutral fallback without replacing copy.
      next.labels = field.labels ?? { singular: 'Элемент', plural: 'Элементы' }
      next.admin = {
        ...field.admin,
        initCollapsed: true,
        components: { ...field.admin?.components, RowLabel: field.admin?.components?.RowLabel ?? arrayRowLabel },
      }
      next.fields = applyDefaultCollapsedAccordions(field.fields)
    } else if ('fields' in field && Array.isArray(field.fields)) {
      next.fields = applyDefaultCollapsedAccordions(field.fields)
    } else if (field.type === 'tabs') {
      next.tabs = field.tabs.map((tab) => ({ ...tab, fields: applyDefaultCollapsedAccordions(tab.fields) }))
    } else if (field.type === 'blocks') {
      next.blocks = field.blocks.map((block) => ({ ...block, fields: applyDefaultCollapsedAccordions(block.fields) }))
    }
    return next as Field
  })
}
