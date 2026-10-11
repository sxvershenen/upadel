import assert from 'node:assert/strict'
import test from 'node:test'

import { applyDefaultCollapsedAccordions } from './accordionDefaults'

test('default-collapsed editor fields apply recursively without replacing custom labels', () => {
  const fields = applyDefaultCollapsedAccordions([
    { type: 'collapsible', label: 'Outer', fields: [{ name: 'items', type: 'array', fields: [{ name: 'title', type: 'text', required: true }] }] },
    { type: 'tabs', tabs: [{ label: 'Details', fields: [{ type: 'collapsible', label: 'Inner', admin: { components: { Label: '/CustomLabel' } }, fields: [{ name: 'body', type: 'text' }] }] }] },
  ])
  const outer = fields[0]
  assert.equal(outer.type, 'collapsible')
  if (outer.type !== 'collapsible') return
  assert.equal(outer.admin?.initCollapsed, true)
  assert.equal(outer.admin?.components?.Label, '/components/admin/DefaultCollapsedAccordion#DefaultCollapsedFieldLabel')
  const array = outer.fields[0]
  assert.equal(array.type, 'array')
  if (array.type !== 'array') return
  assert.equal(array.admin?.initCollapsed, true)
  assert.equal(array.admin?.components?.RowLabel, '/components/admin/DefaultCollapsedAccordion#DefaultCollapsedArrayRowLabel')
  assert.deepEqual(array.labels, { singular: 'Элемент', plural: 'Элементы' })
  const requiredField = array.fields[0]
  assert.equal(requiredField.type, 'text')
  if (requiredField.type !== 'text') return
  assert.equal(requiredField.required, true)
  const tabs = fields[1]
  assert.equal(tabs.type, 'tabs')
  if (tabs.type !== 'tabs') return
  const inner = tabs.tabs[0].fields[0]
  assert.equal(inner.type, 'collapsible')
  if (inner.type !== 'collapsible') return
  assert.equal(inner.admin?.initCollapsed, true)
  assert.equal(inner.admin?.components?.Label, '/CustomLabel')
})

test('default-collapsed array preserves existing singular and plural labels', () => {
  const [array] = applyDefaultCollapsedAccordions([
    { name: 'items', type: 'array', labels: { singular: 'Карточка', plural: 'Карточки' }, fields: [{ name: 'title', type: 'text' }] },
  ])
  assert.equal(array.type, 'array')
  if (array.type !== 'array') return
  assert.deepEqual(array.labels, { singular: 'Карточка', plural: 'Карточки' })
})
