import assert from 'node:assert/strict'
import test from 'node:test'

import { defaultEditorFeatures } from '@payloadcms/richtext-lexical'

import { articleEditorFeatures, getArticlePreviewURL } from './Articles'

test('article editor exposes only H2, H3 and H4 and limits uploads to Media', () => {
  assert.equal(typeof articleEditorFeatures, 'function')
  if (typeof articleEditorFeatures !== 'function') return

  const features = articleEditorFeatures({ defaultFeatures: defaultEditorFeatures, rootFeatures: [] })
  assert.equal(features.filter(({ key }) => key === 'heading').length, 1)
  assert.deepEqual(features.find(({ key }) => key === 'heading')?.serverFeatureProps, {
    enabledHeadingSizes: ['h2', 'h3', 'h4'],
  })
  assert.deepEqual(features.find(({ key }) => key === 'upload')?.serverFeatureProps, {
    enabledCollections: ['media'],
  })
  assert.deepEqual(features.find(({ key }) => key === 'link')?.serverFeatureProps, {
    enabledCollections: [],
  })
  assert.equal(features.some(({ key }) => key === 'align' || key === 'indent' || key === 'relationship'), false)
  assert.equal(features.filter(({ key }) => key === 'toolbarFixed').length, 1)
})

test('article preview URL requires configured public URL, secret and slug', () => {
  const previousWebURL = process.env.PUBLIC_WEB_URL
  const previousSecret = process.env.PREVIEW_SECRET
  process.env.PUBLIC_WEB_URL = 'https://example.test'
  process.env.PREVIEW_SECRET = 'preview secret'
  try {
    assert.equal(
      getArticlePreviewURL('news-item'),
      'https://example.test/preview/article?slug=news-item&secret=preview+secret',
    )
    assert.equal(getArticlePreviewURL(''), undefined)
  } finally {
    if (previousWebURL === undefined) delete process.env.PUBLIC_WEB_URL
    else process.env.PUBLIC_WEB_URL = previousWebURL
    if (previousSecret === undefined) delete process.env.PREVIEW_SECRET
    else process.env.PREVIEW_SECRET = previousSecret
  }
})
