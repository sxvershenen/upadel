import assert from 'node:assert/strict'
import test from 'node:test'

import { membershipAmountSource } from './MembershipCards'

test('membership lead source carries the entered amount into CRM and notifications', () => {
  assert.equal(membershipAmountSource('Подарочный сертификат', 12500), 'Подарочный сертификат — сумма 12 500 ₽')
})
