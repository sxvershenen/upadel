import assert from 'node:assert/strict'
import test from 'node:test'

import { servicesFields } from './homepageContent'

type FieldNode = {
  name?: string
  type?: string
  label?: unknown
  fields?: FieldNode[]
}

function findNamedField(fields: FieldNode[], name: string): FieldNode | undefined {
  for (const field of fields) {
    if (field.name === name) return field
    const nested = findNamedField(field.fields ?? [], name)
    if (nested) return nested
  }
}

test('homepage services keep persisted group paths inside labeled collapsibles', () => {
  for (const name of ['pricingSection', 'membershipOffer', 'rentalStandards', 'methodistBanner', 'price']) {
    assert.ok(findNamedField(servicesFields, name), `Missing CMS field ${name}`)
  }

  assert.ok(servicesFields.every((field) => field.type === 'collapsible'))
  assert.deepEqual(servicesFields.map((field) => field.label), ['Цены и абонементы', 'Тренировочная робопушка'])
  assert.ok(findNamedField(servicesFields, 'membershipOffer')?.type === 'group')
  assert.ok(findNamedField(servicesFields, 'rentalStandards')?.type === 'group')
})
