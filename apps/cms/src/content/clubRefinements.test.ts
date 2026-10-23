import assert from 'node:assert/strict'
import test from 'node:test'
import { documentRichText } from './clubContentUpdate'
import { refineCancellationContent, withoutSameDayException } from './clubRefinements'

test('refinement removes only the same-day exception and keeps the 12-hour rule', () => {
  const content = documentRichText(['Отмена — не позднее чем за 12 часов.', 'Отмена бронирования, созданного в день визита, возврат при отмене не менее чем за 3 часа.', 'Другие условия без изменений.'])
  const refined = refineCancellationContent(content)
  assert.deepEqual(refined.root.children.map((node: any) => node.children[0].text), ['Отмена — не позднее чем за 12 часов.', 'Другие условия без изменений.'])
  assert.deepEqual(refineCancellationContent(refined), refined)
  const summary = 'Отмена — за 12 часов. Для брони, созданной в день визита, — не менее чем за 3 часа. Запрос письменно.'
  assert.equal(withoutSameDayException(summary), 'Отмена — за 12 часов. Запрос письменно.')
  assert.equal(refineCancellationContent(documentRichText([summary])).root.children[0].children[0].text, 'Отмена — за 12 часов. Запрос письменно.')
})
