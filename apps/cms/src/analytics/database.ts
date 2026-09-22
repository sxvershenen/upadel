import type { Payload } from 'payload'
import type {} from '@payloadcms/db-postgres'
import type { PoolClient } from 'pg'

export type AnalyticsClient = PoolClient
export type AnalyticsRow = Record<string, string | number | boolean | null>

/** Only code-defined columns reach this helper; values always use PostgreSQL parameters. */
export function insertValues(rows: AnalyticsRow[]): { columns: string; placeholders: string; values: unknown[] } {
  if (!rows.length || rows.length > 100) throw new Error('Analytics writes require 1–100 rows.')
  const columns = Object.keys(rows[0])
  if (columns.some((column) => !/^[a-z][a-z0-9_]*$/.test(column))) throw new Error('Invalid analytics column.')
  const values: unknown[] = []
  const placeholders = rows.map((row) => `(${columns.map((column) => { values.push(row[column] ?? null); return `$${values.length}` }).join(',')})`).join(',')
  return { columns: columns.map((column) => `"${column}"`).join(','), placeholders, values }
}

export function databaseRow(data: Record<string, unknown>): AnalyticsRow {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), value ?? null])) as AnalyticsRow
}

/** A session lock is acquired before REPEATABLE READ takes its first snapshot. */
export async function analyticsTransaction<T>(payload: Payload, run: (client: AnalyticsClient) => Promise<T>, lock?: string): Promise<T> {
  const client = await payload.db.pool.connect()
  let locked = false
  let discard = false
  try {
    if (lock) { await client.query('SELECT pg_advisory_lock(hashtext($1))', [lock]); locked = true }
    await client.query(lock ? 'BEGIN ISOLATION LEVEL REPEATABLE READ' : 'BEGIN')
    try {
      const result = await run(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK').catch(() => { discard = true })
      throw error
    }
  } finally {
    if (locked) {
      try { await client.query('SELECT pg_advisory_unlock(hashtext($1))', [lock]) }
      catch { discard = true }
    }
    client.release(discard)
  }
}
