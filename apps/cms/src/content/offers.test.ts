import assert from 'node:assert/strict'
import test from 'node:test'
import { projectOffers } from './homepageProjection'
import { clubFields } from '../fields/homepageContent'
import { applyOpeningEventRefinements, applyOpeningRefinements, applyOpeningVisualRefinements } from './openingRefinements'
import { applyOpeningContent } from './openingContent'

const cards = [{ id: 'a', enabled: true, title: 'Включена' }, { id: 'b', enabled: false, title: 'Секретная выключенная карточка' }]
test('offer projection omits disabled content and handles empty optional fields and missing enabled flag', () => {
  const projected = projectOffers(cards as never, 'https://cms.test')
  assert.equal(projected.length, 1)
  assert.equal(projected[0].title, 'Включена')
  assert.doesNotMatch(JSON.stringify(projected), /Секретная|enabled/)
  assert.equal(projectOffers([{ enabled: false }] as never, '').length, 0)
  const empty = projectOffers([{}] as never, '')[0]
  assert.equal(empty.title, '')
  assert.equal(empty.image, null)
  assert.equal(empty.action.mode, 'none')
  assert.equal(empty.meshTone, 'deep-blue')
})

test('offer admin fields including the action are optional', () => {
  const section = clubFields.find((field) => 'name' in field && field.name === 'offersSection') as any
  const fields = section.fields[0].fields
  const all = fields.flatMap((field: any) => field.fields ?? [field])
  assert.ok(all.every((field: any) => !field.required))
  assert.equal(fields.find((field: any) => field.name === 'enabled').defaultValue, true)
  assert.equal(fields.find((field: any) => field.name === 'overlay'), undefined)
})

test('event update combines only one offer, keeps the second editable, and preserves later editor changes', async () => {
  const home: any = { openingContentVersion: 'opening-november-2026-v3', offersSection: { cards: [{ id: 'a', variant: 'tournament-venue', title: 'Турнир', action: { mode: 'lead-form' } }, { id: 'b', variant: 'event', title: 'События' }] }, methodistBanner: { title: 'Не менять' } }
  let writes = 0
  const payload = { findGlobal: async () => structuredClone(home), find: async () => ({ docs: [{ id: 44 }] }), updateGlobal: async ({ data }: any) => { writes++; Object.assign(home, data) } }
  assert.equal(await applyOpeningEventRefinements(payload as never), true)
  assert.equal(home.offersSection.cards[0].id, 'a')
  assert.equal(home.offersSection.cards[0].title, 'Ваше мероприятие')
  assert.equal(home.offersSection.cards[0].image, 44)
  assert.equal(home.offersSection.cards[0].enabled, true)
  assert.equal(home.offersSection.cards[0].action.mode, 'none')
  assert.equal(home.offersSection.cards[1].enabled, false)
  assert.equal(home.offersSection.cards[1].title, 'События')
  assert.equal(home.methodistBanner.title, 'Не менять')
  home.offersSection.cards[0].enabled = false
  home.offersSection.cards[1].title = 'Редактор изменил'
  const before = writes
  assert.equal(await applyOpeningContent(payload as never), false)
  assert.equal(await applyOpeningRefinements(payload as never), false)
  assert.equal(await applyOpeningVisualRefinements(payload as never), false)
  assert.equal(await applyOpeningEventRefinements(payload as never), false)
  assert.equal(writes, before)
  assert.equal(home.offersSection.cards[0].enabled, false)
  assert.equal(home.offersSection.cards[1].title, 'Редактор изменил')
})
