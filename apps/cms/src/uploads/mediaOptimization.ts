import path from 'node:path'

import { type CollectionBeforeOperationHook } from 'payload'
import sharp from 'sharp'

import { validateMediaUploadBeforeOperation } from './mediaPolicy'

export const optimizeMediaUploadBeforeOperation: CollectionBeforeOperationHook<'media'> = async (input) => {
  await validateMediaUploadBeforeOperation(input)
  const { req, operation } = input
  if ((operation !== 'create' && operation !== 'update' && operation !== 'updateByID') || !req.file) return input.args

  const file = req.file as unknown as { data: Buffer; mimetype?: string; name: string; size: number; tempFilePath?: string; type?: string }
  const mimeType = file.type || file.mimetype || ''
  if (!mimeType.startsWith('image/') || mimeType === 'image/svg+xml' || mimeType === 'image/gif') return input.args

  const inputImage = file.tempFilePath ? sharp(file.tempFilePath) : sharp(file.data)
  const data = await inputImage.webp({ quality: 80 }).toBuffer()
  file.data = data
  file.mimetype = 'image/webp'
  file.type = 'image/webp'
  file.name = `${path.parse(file.name).name}.webp`
  file.size = data.length
  file.tempFilePath = undefined
  return input.args
}
