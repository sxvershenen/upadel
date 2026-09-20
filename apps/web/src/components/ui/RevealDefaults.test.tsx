import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Badge } from './Badge'
import { Button, ButtonLink } from './Button'
import { Typography } from './Typography'

test('atomic UI components do not become GSAP reveal targets by default', () => {
  const html = renderToStaticMarkup(
    <>
      <Button>Кнопка</Button>
      <ButtonLink href="/about">Ссылка</ButtonLink>
      <Badge>Метка</Badge>
      <Typography>Текст</Typography>
    </>,
  )

  assert.doesNotMatch(html, /data-gsap-reveal/)
})
