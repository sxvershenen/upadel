import { getPayload } from 'payload'

import config from '../payload.config'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!email || !password) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.')
}

const payload = await getPayload({ config })

try {
  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } },
  })

  if (existing.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: { email, password },
      overrideAccess: true,
    })
    payload.logger.info(`Created local admin ${email}.`)
  } else {
    payload.logger.info(`Local admin ${email} already exists; password was not changed.`)
  }
} finally {
  await payload.destroy()
}
