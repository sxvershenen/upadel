import { readAnalyticsPreferences } from '../analytics/consent'
import { metricaLeadContext, reachMetricaGoal } from '../analytics/metrica'

/** One native drawer per document entry; internal navigation never repeats the prompt. */
export function initializeWaitlist(element: HTMLElement | null) {
  if (!(element instanceof HTMLDialogElement) || element.dataset.initialized) return
  const dialog = element
  dialog.dataset.initialized = 'true'
  const form = dialog.querySelector<HTMLFormElement>('[data-waitlist-form]')!
  const error = dialog.querySelector<HTMLElement>('[data-waitlist-error]')!
  const success = dialog.querySelector<HTMLElement>('[data-waitlist-success]')!
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!
  const title = dialog.querySelector<HTMLElement>('#waitlist-title')!
  const description = dialog.querySelector<HTMLElement>('#waitlist-description')!
  const key = globalThis.crypto.randomUUID()
  const submitLabel = submit.textContent
  let sending = false, viewed = false, started = false, succeeded = false, successTimer = 0
  const gate = dialog.querySelector<HTMLElement>('[data-waitlist-analytics-gate]')
  const canUseForm = () => {
    if (!gate) return true
    try { return readAnalyticsPreferences(localStorage)?.yandexMetrica === true } catch { return false }
  }
  const updateGate = () => {
    if (!gate || succeeded) return
    const allowed = canUseForm()
    gate.hidden = allowed; form.hidden = !allowed
  }
  updateGate()
  const track = (name: string) => window.unlimAnalytics?.track({ name, formType: 'consultation', objectType: 'form', objectId: 'Лист ожидания' })
  const view = () => { if (!viewed && dialog.open && !form.hidden && window.unlimAnalytics) { viewed = true; track('form_view') } }
  view()
  window.addEventListener('unlim:analytics-consent', () => { updateGate(); view() })
  window.addEventListener('unlim:analytics-ready', view)
  const close = () => {
    if (dialog.hasAttribute('data-closing') || !dialog.open) return
    window.clearTimeout(successTimer)
    dialog.setAttribute('data-closing', '')
    const finish = () => { dialog.close(); dialog.removeAttribute('data-closing'); document.documentElement.removeAttribute('data-waitlist-open') }
    dialog.addEventListener('animationend', finish, { once: true })
    window.setTimeout(() => { if (dialog.open && dialog.hasAttribute('data-closing')) finish() }, 260)
  }
  dialog.querySelector('[data-waitlist-decline]')?.addEventListener('click', close)
  dialog.addEventListener('cancel', (event) => event.preventDefault())
  dialog.addEventListener('close', () => document.documentElement.removeAttribute('data-waitlist-open'))
  document.querySelectorAll<HTMLButtonElement>('[data-waitlist-reopen]').forEach((button) => button.addEventListener('click', () => {
    if (dialog.open) return
    updateGate()
    dialog.showModal()
    document.documentElement.setAttribute('data-waitlist-open', '')
    view()
  }))
  dialog.querySelector('[data-waitlist-close-form]')?.addEventListener('submit', (event) => { event.preventDefault(); close() })
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog || !window.matchMedia('(max-width: 767px)').matches) return
    const rect = dialog.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
  })
  form.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement | null
    if (!canUseForm() || !input || !['name', 'phone'].includes(input.name) || !input.value.trim()) return
    view(); if (!started) { started = true; track('form_start'); reachMetricaGoal('waitlist_form_start', true) }
  })
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (sending || succeeded || !canUseForm()) return
    error.hidden = true
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim(), phone = String(data.get('phone') ?? '').trim()
    const fail = (message: string) => { error.textContent = message; error.hidden = false; track('form_error') }
    if (name.length < 2) { fail('Укажите имя — минимум 2 символа.'); form.querySelector<HTMLInputElement>('[name="name"]')?.focus(); return }
    if (!/^[+\d\s()-]{6,40}$/.test(phone) || phone.replace(/\D/g, '').length < 10 || phone.replace(/\D/g, '').length > 15) { fail('Проверьте номер телефона.'); form.querySelector<HTMLInputElement>('[name="phone"]')?.focus(); return }
    if (data.get('consent') !== 'on') { fail('Для отправки необходимо согласие на обработку персональных данных.'); form.querySelector<HTMLInputElement>('[name="consent"]')?.focus(); return }
    track('form_submit_attempt')
    sending = true; submit.disabled = true; submit.setAttribute('aria-busy', 'true'); submit.textContent = 'Отправляем…'
    const controller = new AbortController(), timeout = window.setTimeout(() => controller.abort(), 12_000)
    try {
      const response = await fetch(dialog.dataset.endpoint!, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ name, phone, consent: true, website: data.get('website'), type: 'consultation', sourcePage: window.location.pathname, sourceEntity: 'Лист ожидания', comment: 'Сохранить скидку 50% и сообщить об открытии клуба.', idempotencyKey: key, ...await metricaLeadContext(), analytics: window.unlimAnalytics?.serverContext() ?? null }) })
      const result = await response.json().catch(() => ({})) as { ok?: boolean; accepted?: boolean; error?: string }
      if (!response.ok || !result.ok || result.accepted === false) { fail(result.error ?? 'Не удалось отправить заявку. Попробуйте ещё раз.'); return }
      succeeded = true; form.hidden = true; description.hidden = true; title.textContent = dialog.dataset.successTitle ?? ''; success.textContent = dialog.dataset.successText ?? ''; success.hidden = false
      reachMetricaGoal('waitlist_submit_success', true)
      successTimer = window.setTimeout(close, 7_000)
    } catch { fail('Связь прервалась. Попробуйте ещё раз — повтор не создаст дубль.') }
    finally { clearTimeout(timeout); sending = false; submit.disabled = false; submit.removeAttribute('aria-busy'); submit.textContent = submitLabel }
  })
}
