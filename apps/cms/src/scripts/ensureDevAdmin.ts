import { getPayload } from 'payload'

import config from '../payload.config'

const username = process.env.ADMIN_USERNAME
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const updatePassword = process.env.ADMIN_UPDATE_PASSWORD === 'true'

if (!username || !email || !password) {
  throw new Error('ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD are required.')
}

const payload = await getPayload({ config })

try {
  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { or: [{ email: { equals: email } }, { username: { equals: username } }] },
  })

  if (existing.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: { email, password, username },
      overrideAccess: true,
    })
    payload.logger.info(`Created local admin ${username}.`)
  } else {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: {
        email,
        username,
        ...(updatePassword ? { password } : {}),
      },
      overrideAccess: true,
    })
    payload.logger.info(`Updated local admin ${username}; password changed: ${updatePassword}.`)
  }
} finally {
  await payload.destroy()
}
