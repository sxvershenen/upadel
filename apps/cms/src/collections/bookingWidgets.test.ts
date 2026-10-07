import assert from 'node:assert/strict'
import test from 'node:test'
import { createActionField } from '../fields/action'
import { createWidgetURLField } from '../fields/widget'
import { actionDTO } from '../content/normalize'

const scriptURL = 'https://supadb.vivacrm.ru/storage/v1/object/public/widgets/3ffc4681-890e-4d27-9676-1a5a7c246b17.js'

test('individual embed fields are available only on opted-in actions', () => {
  assert.equal(createActionField('action', 'Действие').fields.some(field => 'name' in field && field.name === 'widgetURL'), false)
  assert.equal(createActionField('action', 'Действие', true).fields.some(field => 'name' in field && field.name === 'widgetURL'), true)
})

test('CMS widget fields validate active configuration and reduce installation snippets to URLs', async () => {
  const field = createWidgetURLField('Виджет', 'vivacrm-widget', 'vivacrm-script')
  const validate = field.validate as (value: unknown, options: any) => unknown
  const normalize = field.hooks!.beforeValidate![0] as (options: any) => unknown
  const siblingData = { mode: 'vivacrm-widget' }
  assert.equal(validate(`<script src="${scriptURL}"></script>`, { siblingData }), true)
  assert.notEqual(validate('https://evil.example/script.js', { siblingData }), true)
  assert.notEqual(validate('', { siblingData }), true)
  assert.equal(validate('', { siblingData: { mode: 'disabled' } }), true)
  assert.equal(await normalize({ value: `<script src="${scriptURL}"></script>`, siblingData }), scriptURL)
})

test('public actions expose safe iframe/script URLs and discard unsafe draft markup', () => {
  assert.equal(actionDTO({ mode: 'embed-widget', widgetKind: 'iframe', widgetURL: '<iframe src="https://booking.example/coach" onload="evil()"></iframe>' }).widgetURL, 'https://booking.example/coach')
  assert.equal(actionDTO({ mode: 'embed-widget', widgetKind: 'vivacrm-script', widgetURL: 'https://evil.example/script.js' }).widgetURL, null)
  assert.equal(actionDTO({ mode: 'booking', widgetKind: 'iframe', widgetURL: 'https://booking.example' }).widgetURL, undefined)
})
