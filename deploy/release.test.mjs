import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, mkdir, readFile, writeFile, chmod, symlink, readlink, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const repository = resolve(import.meta.dirname, '..')

async function fixture(first) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'unlim-release-test-')))
  const app = join(root, 'app'); const fresh = join(app, 'releases', 'new'); const old = join(app, 'releases', 'old'); const shared = join(app, 'shared'); const bin = join(root, 'bin')
  for (const path of [join(fresh, 'apps/cms'), join(fresh, 'deploy'), join(old, 'apps/cms'), shared, bin]) await mkdir(path, { recursive: true })
  await writeFile(join(fresh, 'package-lock.json'), '{}')
  await writeFile(join(fresh, 'deploy/release.sh'), await readFile(join(repository, 'deploy/release.sh')))
  let env = await readFile(join(repository, 'deploy/env.production.example'), 'utf8')
  env = env.replaceAll('/srv/unlim', app).replaceAll('/srv/backups/unlim', join(root, 'backups')).replaceAll('example.com', 'test.invalid').replaceAll('replace-with', 'fixture-value')
  await writeFile(join(shared, '.env.production'), env)
  await writeFile(join(bin, 'npm'), '#!/bin/sh\nprintf "%s | %s\\n" "$PWD" "$*" >> "$AUDIT_LOG"\n[ "${FAIL_BUILD:-0}" != "1" ] || [ "$*" != "run build" ]\n')
  await chmod(join(bin, 'npm'), 0o700)
  if (!first) await symlink(old, join(app, 'current'))
  const environment = { ...process.env, APP_ROOT: app, ENV_FILE: join(shared, '.env.production'), FIRST_DEPLOY: first ? '1' : '0', RUN_BACKUP: '0', AUDIT_LOG: join(root, 'commands'), PATH: `${bin}:${process.env.PATH}` }
  return { root, app, fresh, old, environment, run: (extra = {}) => execFileSync('bash', [join(fresh, 'deploy/release.sh')], { env: { ...environment, ...extra }, stdio: 'pipe' }) }
}

for (const first of [true, false]) test(`release activates actual new directory despite backup RELEASE_DIR (${first ? 'first' : 'later'})`, async () => {
  const f = await fixture(first)
  try {
    f.run()
    assert.equal(await readlink(join(f.app, 'current')), f.fresh)
    assert.equal(await realpath(join(f.app, 'current')), await realpath(f.fresh))
    const calls = await readFile(f.environment.AUDIT_LOG, 'utf8')
    assert.ok(calls.split('\n').filter(Boolean).every((call) => call.startsWith(f.fresh + ' | ')))
    assert.ok(calls.indexOf('run payload --workspace @unlim/cms -- migrate') < calls.indexOf('run media:responsive --workspace @unlim/cms'))
    if (first) assert.ok(calls.indexOf('run seed:cms') < calls.indexOf('run media:responsive --workspace @unlim/cms'))
  } finally { await rm(f.root, { recursive: true, force: true }) }
})
test('failed build preserves previous activation and skips migration/backfill', async () => {
  const f = await fixture(false)
  try {
    assert.throws(() => f.run({ FAIL_BUILD: '1' }))
    assert.equal(await readlink(join(f.app, 'current')), f.old)
    assert.doesNotMatch(await readFile(f.environment.AUDIT_LOG, 'utf8'), /migrate|media:responsive/)
  } finally { await rm(f.root, { recursive: true, force: true }) }
})
