import { createHash } from 'node:crypto'

/**
 * Mergeable HyperLogLog sketch used for browser and session uniques.
 * p=14 => 16,384 registers and theoretical relative standard error
 * 1.04 / sqrt(2^14) = 0.8125%. Registers are serialized as base64 bytes.
 */
export const HLL_PRECISION = 14 as const
export const HLL_REGISTERS = 1 << HLL_PRECISION
export const HLL_RELATIVE_ERROR = 1.04 / Math.sqrt(HLL_REGISTERS)

export type HLLSketch = { precision: typeof HLL_PRECISION; registers: Uint8Array }

export function createHLL(): HLLSketch {
  return { precision: HLL_PRECISION, registers: new Uint8Array(HLL_REGISTERS) }
}

export function addHLL(sketch: HLLSketch, value: string): void {
  const digest = createHash('sha256').update(value).digest()
  const index = ((digest[0] << 8) | digest[1]) >>> (16 - HLL_PRECISION)
  let rank = 1
  let bit = HLL_PRECISION
  while (bit < 256) {
    const byte = digest[bit >>> 3]
    if ((byte & (1 << (7 - (bit & 7)))) !== 0) break
    rank += 1
    bit += 1
  }
  if (rank > sketch.registers[index]) sketch.registers[index] = rank
}

export function mergeHLL(target: HLLSketch, source: HLLSketch): HLLSketch {
  if (target.precision !== source.precision) throw new Error('Cannot merge HLL sketches with different precision.')
  for (let index = 0; index < target.registers.length; index += 1) {
    if (source.registers[index] > target.registers[index]) target.registers[index] = source.registers[index]
  }
  return target
}

export function estimateHLL(sketch: HLLSketch): number {
  const m = sketch.registers.length
  let reciprocalSum = 0
  let zeroes = 0
  for (const register of sketch.registers) {
    reciprocalSum += 2 ** -register
    if (register === 0) zeroes += 1
  }
  const alpha = 0.7213 / (1 + 1.079 / m)
  const raw = alpha * m * m / reciprocalSum
  const corrected = raw <= 2.5 * m && zeroes > 0 ? m * Math.log(m / zeroes) : raw
  return Math.max(0, Math.round(corrected))
}

export function serializeHLL(sketch: HLLSketch): string {
  return `hll-v1-p${sketch.precision}:${Buffer.from(sketch.registers).toString('base64')}`
}

export function deserializeHLL(value: string | null | undefined): HLLSketch {
  if (!value) return createHLL()
  const prefix = `hll-v1-p${HLL_PRECISION}:`
  if (!value.startsWith(prefix)) throw new Error('Unsupported HLL sketch format.')
  const registers = new Uint8Array(Buffer.from(value.slice(prefix.length), 'base64'))
  if (registers.length !== HLL_REGISTERS) throw new Error('Invalid HLL register count.')
  return { precision: HLL_PRECISION, registers }
}

