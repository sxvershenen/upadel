import assert from 'node:assert/strict'
import test from 'node:test'

import sharp from 'sharp'

import { optimizeMediaUploadBeforeOperation, optimizeRasterImage } from './mediaOptimization'

test('normalizes EXIF orientation before encoding raster uploads as WebP', async () => {
  const phonePhoto = await sharp({
    create: { width: 2, height: 3, channels: 3, background: { r: 20, g: 40, b: 60 } },
  }).jpeg().withMetadata({ orientation: 6 }).toBuffer()

  const optimized = await optimizeRasterImage(phonePhoto)
  const metadata = await sharp(optimized).metadata()
  assert.equal(metadata.format, 'webp')
  assert.equal(metadata.width, 3)
  assert.equal(metadata.height, 2)
  assert.ok(metadata.orientation === undefined || metadata.orientation === 1)
})

test('keeps SVG and GIF uploads out of the raster WebP transform', async () => {
  for (const mimeType of ['image/svg+xml', 'image/gif']) {
    const file = { data: Buffer.from('unchanged'), mimetype: mimeType, name: `image.${mimeType === 'image/gif' ? 'gif' : 'svg'}`, size: 9, type: mimeType }
    const input = { args: {}, operation: 'create', req: { file } }
    await optimizeMediaUploadBeforeOperation(input as never)
    assert.equal(file.type, mimeType)
    assert.equal(file.name.endsWith('.webp'), false)
    assert.equal(file.data.toString(), 'unchanged')
  }
})
