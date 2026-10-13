import assert from 'node:assert/strict'
import test from 'node:test'

import { homepageSectionOptions, homepageSectionRowTitle, homepageSectionsField } from './homepageSections'

test('homepage section editor names the robot practice section directly', () => {
  assert.equal(homepageSectionOptions.find(({ value }) => value === 'methodist-banner')?.label, 'Тренировка с робопушкой')
})

test('collapsed homepage rows show their section name and hidden status', () => {
  assert.equal(homepageSectionRowTitle({ section: 'methodist-banner', visible: true }, 6), 'Тренировка с робопушкой')
  assert.equal(homepageSectionRowTitle({ section: 'methodist-banner', visible: false }, 6), 'Тренировка с робопушкой · скрыта')
  assert.equal(homepageSectionRowTitle({}, 0), 'Секция 01')
})

test('homepage structure array has a named row label and specific section-row copy', () => {
  assert.deepEqual(homepageSectionsField.labels, { singular: 'Секция главной', plural: 'Секции главной' })
  assert.equal(homepageSectionsField.admin?.components?.RowLabel, '/components/admin/DefaultCollapsedAccordion#HomepageSectionRowLabel')
})
