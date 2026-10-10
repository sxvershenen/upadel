import assert from 'node:assert/strict'
import test from 'node:test'

import { Memberships } from './Memberships'

test('membership list explains when its public tab appears and how to restore it', () => {
  const description = String(Memberships.admin?.description ?? '')
  assert.ok(description)
  assert.match(description, /опубликованный активный абонемент/)
  assert.match(description, /скроется весь переключатель — не только раздел «Абонементы»/)
  assert.match(description, /включите и опубликуйте абонемент/)
  assert.match(description, /записи и их данные сохраняются/)
  assert.match(description, /Показывать на главной.*допустимый порядок/)
  assert.match(description, /останутся «Аренда» и «Тренировки»/)

  const isActive = Memberships.fields.find((field) => 'name' in field && field.name === 'isActive')
  assert.equal(isActive?.type, 'checkbox')
  if (isActive?.type !== 'checkbox') throw new Error('Expected an active-state checkbox.')
  assert.match(String(isActive.admin?.description), /опубликованный активный абонемент/)
})
