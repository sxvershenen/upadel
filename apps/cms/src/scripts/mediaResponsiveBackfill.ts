import path from 'node:path'
import { access, rename, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'

const responsiveSizes: Array<{ name: string; width: number; minSourceWidth?: number; quality?: number }> = [
  { name: 'compact', width: 320, quality: 65 },
  { name: 'mobile', width: 480, quality: 65 },
  { name: 'small', width: 640, quality: 65 },
  { name: 'medium', width: 800, quality: 65 },
  { name: 'dense', width: 1120, minSourceWidth: 800, quality: 75 },
] as const

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
      if (!media.filename || path.basename(media.filename) !== media.filename || !media.width) { skipped++; continue }
      const source = path.join(directory, media.filename)
      const sizes = { ...(media.sizes ?? {}) } as Record<string, unknown>
      let changed = false
      const obsoleteFiles: string[] = []
      for (const size of responsiveSizes) {
        if (media.width <= (size.minSourceWidth ?? size.width)) continue
        const existing = sizes[size.name] as { filename?: string | null } | undefined
        if (existing?.filename) {
          try {
            await access(path.join(directory, path.basename(existing.filename)))
            if (!existing.filename.startsWith('responsive-') || existing.filename.endsWith(`-q${size.quality ?? 65}.webp`)) continue
            obsoleteFiles.push(path.basename(existing.filename))
          } catch { /* repair missing derivative only */ }
        }
        const quality = size.quality ?? 65
        const hash = createHash('sha256').update(`${media.id}:${media.filename}:${size.name}-${size.width}-q${quality}-v2`).digest('hex').slice(0, 12)
        const filename = `responsive-${hash}-${size.width}-q${quality}.webp`
        const temporary = path.join(directory, `.${filename}.${process.pid}.tmp`)
        try {
          const info = await sharp(source).autoOrient().resize({ width: size.width, withoutEnlargement: true }).webp({ quality }).toFile(temporary)
          await rename(temporary, path.join(directory, filename))
          sizes[size.name] = { url: `/api/media/file/${filename}`, filename, width: info.width, height: info.height, mimeType: 'image/webp', filesize: info.size }
          created++
          changed = true
        } finally { await rm(temporary, { force: true }) }
      }
      if (changed) {
        await payload.update({ collection: 'media', id: media.id, depth: 0, overrideAccess: true, data: { sizes } as never })
        for (const filename of new Set(obsoleteFiles)) await rm(path.join(directory, filename), { force: true })
      }
      else skipped++
    }
  }
  return { created, skipped }
}

const payload = await getPayload({ config })
try { payload.logger.info(await backfillResponsiveMedia(payload)) }
finally { await payload.destroy() }

process.exit(0)
