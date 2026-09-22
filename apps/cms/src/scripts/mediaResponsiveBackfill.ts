import path from 'node:path'
import { access, rename, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'

/** Fill only missing derivatives. Original files, record IDs and editor fields stay intact. */
export async function backfillResponsiveMedia(payload: Payload) {
  const upload = payload.collections.media.config.upload
  if (!upload || upload.disableLocalStorage || !upload.staticDir) throw new Error('Responsive backfill requires local Payload media storage.')
  const directory = path.resolve(upload.staticDir)
  let afterID = 0
  let created = 0
  let skipped = 0
  for (;;) {
    const result = await payload.find({ collection: 'media', depth: 0, limit: 50, pagination: false, sort: 'id', overrideAccess: true, where: { and: [{ id: { greater_than: afterID } }, { mimeType: { in: ['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'image/tiff'] } }] } })
    if (!result.docs.length) break
    for (const media of result.docs) {
      afterID = Number(media.id)
      if (!media.filename || path.basename(media.filename) !== media.filename || !media.width || media.width <= 640) { skipped++; continue }
      const sizes = media.sizes as typeof media.sizes & { small?: { filename?: string | null } }
      if (sizes?.small?.filename) {
        try { await access(path.join(directory, path.basename(sizes.small.filename))); skipped++; continue } catch { /* repair missing derivative only */ }
      }
      const source = path.join(directory, media.filename)
      const hash = createHash('sha256').update(`${media.id}:${media.filename}:small-640-v1`).digest('hex').slice(0, 12)
      const filename = `responsive-${hash}-640.webp`
      const temporary = path.join(directory, `.${filename}.${process.pid}.tmp`)
      try {
        const info = await sharp(source).autoOrient().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 80 }).toFile(temporary)
        await rename(temporary, path.join(directory, filename))
        await payload.update({ collection: 'media', id: media.id, depth: 0, overrideAccess: true, data: { sizes: { ...media.sizes, small: { url: `/api/media/file/${filename}`, filename, width: info.width, height: info.height, mimeType: 'image/webp', filesize: info.size } } } as never })
        created++
      } finally { await rm(temporary, { force: true }) }
    }
  }
  return { created, skipped }
}

const payload = await getPayload({ config })
try { payload.logger.info(await backfillResponsiveMedia(payload)) }
finally { await payload.destroy() }

process.exit(0)
