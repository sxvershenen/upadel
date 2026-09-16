export const validateMetricaCounterID = (value: unknown): true | string =>
  !value || typeof value === 'string' && /^\d{1,20}$/.test(value)
    ? true : 'ID Метрики должен содержать только цифры.'

export const validateGA4MeasurementID = (value: unknown): true | string =>
  !value || typeof value === 'string' && /^G-[A-Z0-9]{4,20}$/.test(value)
    ? true : 'Measurement ID должен быть в формате G-XXXXXXXX.'

export const validateWebmasterVerification = (value: unknown): true | string =>
  !value || typeof value === 'string' && /^[A-Za-z0-9_-]{4,160}$/.test(value)
    ? true : 'Используйте только выданное Яндексом значение без HTML.'

export type BookingConfig = {
  credentialEnvironmentVariable?: unknown
  externalURL?: unknown
  mode?: unknown
  providerAccountID?: unknown
  providerAdapter?: unknown
}

export function bookingReadiness(config: BookingConfig, env: Record<string, string | undefined> = process.env) {
  if (config.mode === 'disabled' || !config.mode) return { ready: false, status: 'disabled' as const }
  if (config.mode === 'external-link') return typeof config.externalURL === 'string' && /^https:\/\//.test(config.externalURL)
    ? { ready: true, status: 'ready-external' as const }
    : { ready: false, status: 'missing-config' as const }
  const envName = typeof config.credentialEnvironmentVariable === 'string' ? config.credentialEnvironmentVariable : ''
  if (!config.providerAdapter || !config.providerAccountID || !envName || !env[envName]) return { ready: false, status: 'missing-config' as const }
  return { ready: false, status: 'integration-not-implemented' as const }
}

export const validateBookingAdapter = (value: unknown, siblingData: BookingConfig): true | string =>
  siblingData.mode !== 'provider-adapter' || value && siblingData.providerAccountID
    ? true : 'Выберите адаптер и укажите ID аккаунта/клуба.'

export const validateBookingCredentialEnv = (value: unknown, siblingData: BookingConfig, env: Record<string, string | undefined> = process.env): true | string => {
  if (siblingData.mode === 'provider-adapter' && !value) return 'Для provider adapter укажите environment variable с секретом.'
  if (value && (typeof value !== 'string' || !/^[A-Z][A-Z0-9_]*$/.test(value))) return 'Используйте имя environment variable в формате BOOKING_API_TOKEN.'
  if (siblingData.mode === 'provider-adapter' && typeof value === 'string' && !env[value]) return 'Указанная environment variable не найдена в текущем окружении.'
  return true
}
