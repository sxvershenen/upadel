import path from 'node:path'

import { type CollectionBeforeOperationHook } from 'payload'
import sharp from 'sharp'

import { validateMediaUploadBeforeOperation } from './mediaPolicy'

export async function optimizeRasterImage(input: Buffer | string): Promise<Buffer> {
  return sharp(input).autoOrient().webp({ quality: 80 }).toBuffer()
}

export const optimizeMediaUploadBeforeOperation: CollectionBeforeOperationHook<'media'> = async (input) => {
  await validateMediaUploadBeforeOperation(input)
  const { req, operation } = input
  if ((operation !== 'create' && operation !== 'update' && operation !== 'updateByID') || !req.file) return input.args

  const file = req.file as unknown as { data: Buffer; mimetype?: string; name: string; size: number; tempFilePath?: string; type?: string }
  const mimeType = file.type || file.mimetype || ''
  if (!mimeType.startsWith('image/') || mimeType === 'image/svg+xml' || mimeType === 'image/gif') return input.args

  // Payload's multipart parser may expose `tempFilePath` as an empty string when
  // the upload lives in memory. Sharp treats that value as a path and fails with
  // `Unsupported input ''`, so only prefer an actual non-empty temporary path.
  const source = typeof file.tempFilePath === 'string' && file.tempFilePath.length > 0
    ? file.tempFilePath
    : file.data
  const data = await optimizeRasterImage(source)
  file.data = data
  file.mimetype = 'image/webp'
  file.type = 'image/webp'
  file.name = `${path.parse(file.name).name}.webp`
  file.size = data.length
  file.tempFilePath = undefined
  return input.args
}
