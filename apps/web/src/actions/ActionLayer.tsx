import type { ActionDTO, SiteDTO } from '@unlim/content-contract'
import { Mail, Phone, Send } from 'lucide-react'
import React, { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { analyticsServerContext, trackAnalytics } from '../analytics/AnalyticsTracker'

import { Button, ButtonLink } from '../components/ui/Button'
import { CheckboxField } from '../components/ui/CheckboxField'
import { Dialog } from '../components/ui/Dialog'
import { Field } from '../components/ui/Field'
import { TextareaField } from '../components/ui/TextareaField'
import { ProgressiveImage } from '../components/ui/ProgressiveImage'

type LeadRequest = { type: NonNullable<ActionDTO['leadType']>; sourcePage: string; sourceEntity?: string }
type Channel = SiteDTO['contactConfirmation']['channels'][number]
type ExternalRequest = { href: string; label?: string | null }
type ActionLayerValue = {
  requestContact: (channel: Channel['channel']) => void
  requestLead: (lead: LeadRequest) => void
  requestExternal: (request: ExternalRequest) => void
}
const ActionLayerContext = createContext<ActionLayerValue | null>(null)

function LeadForm({ site, lead, onClose, onContact }: { site: SiteDTO; lead: LeadRequest; onClose: () => void; onContact: (channel: Channel['channel']) => void }) {
  const [state, setState] = useState<'form' | 'sending' | 'success'>('form')
  const [error, setError] = useState('')
  const [key] = useState(() => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const started = useRef(false)
  const analyticsObjectId = lead.sourceEntity ?? lead.type
  useEffect(() => { trackAnalytics({ name: 'form_view', formType: lead.type, objectType: 'form', objectId: analyticsObjectId }) }, [analyticsObjectId, lead.type])
  const start = () => { if (!started.current) { started.current = true; trackAnalytics({ name: 'form_start', formType: lead.type, objectType: 'form', objectId: analyticsObjectId }) } }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const name = String(data.name ?? '').trim(), phone = String(data.phone ?? '').trim(), telegram = String(data.telegram ?? '').trim(), vk = String(data.vk ?? '').trim()
    const errors: string[] = []
    if (name.length < 2) errors.push('Укажите имя — минимум 2 символа.')
    if (!phone && !telegram && !vk) errors.push('Оставьте телефон, Telegram или VK — достаточно одного поля.')
    if (phone && !/^[+\d\s()-]{6,40}$/.test(phone)) errors.push('Проверьте формат телефона.')
    if (telegram && !/^@?[\p{L}\p{N}_.-]{3,80}$/u.test(telegram)) errors.push('Проверьте Telegram-логин.')
    if (vk && !/^@?[\p{L}\p{N}_.-]{3,80}$/u.test(vk)) errors.push('Проверьте VK-логин.')
    if (data.consent !== 'on') errors.push('Для отправки необходимо отметить отдельное согласие.')
    if (errors.length) { setError(errors.join(' ')); trackAnalytics({ name: 'form_error', formType: lead.type, objectType: 'form', objectId: analyticsObjectId }); return }
    trackAnalytics({ name: 'form_submit_attempt', formType: lead.type, objectType: 'form', objectId: analyticsObjectId })
    setState('sending')
    const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 12_000)
    try {
      const response = await fetch(site.contactConfirmation.leadEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ ...data, consent: true, type: lead.type, sourcePage: lead.sourcePage, sourceEntity: lead.sourceEntity, idempotencyKey: key, analytics: analyticsServerContext() }) })
      const result = await response.json().catch(() => ({})) as { error?: string; ok?: boolean }
      if (response.ok && result.ok) setState('success')
      else { setState('form'); setError(result.error ?? 'Не удалось отправить обращение. Попробуйте ещё раз.'); trackAnalytics({ name: 'form_error', formType: lead.type, objectType: 'form', objectId: analyticsObjectId }) }
    } catch {
      setState('form'); setError('Связь прервалась. Проверьте интернет и попробуйте ещё раз — повтор не создаст дубль.')
      trackAnalytics({ name: 'form_error', formType: lead.type, objectType: 'form', objectId: analyticsObjectId })
    } finally { window.clearTimeout(timeout) }
  }
  if (state === 'success') return <div role="status"><h3 className="type-title-card text-ink">{site.contactConfirmation.successTitle}</h3><p className="type-body mt-3 text-ink-soft">{site.contactConfirmation.successText}</p><Button className="mt-6" onClick={onClose}>Закрыть</Button></div>
  return <form onSubmit={submit} onFocusCapture={start} noValidate className="grid gap-3 md:gap-4">
    <Field label="Имя" labelVisibility="sr-only" name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Ваше имя" />
    <fieldset className="grid gap-2 md:gap-3"><legend className="type-caption mb-3.5 md:mb-1">Как с вами связаться? Заполните любое одно поле</legend>
      <Field label="Телефон" labelVisibility="sr-only" name="phone" autoComplete="tel" inputMode="tel" maxLength={40} placeholder="Телефон — например +7 999 000-00-00" />
      <Field label="Telegram / логин" labelVisibility="sr-only" name="telegram" autoComplete="off" placeholder="Telegram — например @username" maxLength={80} />
      <Field label="VK / логин" labelVisibility="sr-only" name="vk" autoComplete="off" placeholder="VK — id или @username" maxLength={80} />
    </fieldset>
    <TextareaField label="Комментарий" labelVisibility="sr-only" name="comment" maxLength={2000} placeholder="Например, удобный день и время" className="min-h-16 resize-none md:min-h-24 md:resize-y" />
    <label className="absolute -left-[10000px]" aria-hidden="true">Сайт<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <CheckboxField name="consent" required label={<>{site.contactConfirmation.consentLabel} · <a href={site.contactConfirmation.policyHref} target="_blank" rel="noreferrer" className="underline">политика</a></>} />
    {error && <p role="alert" className="type-body-sm text-red-700">{error}</p>}
    <Button type="submit" loading={state === 'sending'} fullWidth>{site.contactConfirmation.submitLabel}</Button>
    <div className="border-t border-ink/10 pt-3 md:pt-4"><p className="type-caption mb-2 text-ink-soft md:mb-3">Или свяжитесь напрямую</p><div className="flex flex-wrap gap-2">{site.contactConfirmation.channels.filter(({ enabled, channel }) => enabled && channel !== 'email').map((channel) => <Button key={channel.channel} variant="neutral" size="sm" onClick={() => onContact(channel.channel)}>{channel.label}</Button>)}</div></div>
  </form>
}

export function ActionLayerProvider({ site, children, captureContacts = true }: { site: SiteDTO; children: ReactNode; captureContacts?: boolean }) {
  const [channel, setChannel] = useState<Channel | null>(null)
  const [lead, setLead] = useState<LeadRequest | null>(null)
  const [external, setExternal] = useState<ExternalRequest | null>(null)
  const requestContact = (kind: Channel['channel']) => { const next = site.contactConfirmation.channels.find((item) => item.channel === kind && item.enabled && item.destination); if (next) setChannel(next) }
  const requestLead = (next: LeadRequest) => setLead(next)
  const requestExternal = (next: ExternalRequest) => {
    if (/^https:\/\//.test(next.href)) setExternal(next)
  }
  useEffect(() => {
    if (!captureContacts) return
    const capture = (event: globalThis.MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const anchor = event.target.closest('a[href]')
      if (!anchor || anchor.hasAttribute('data-contact-confirmed')) return
      const href = anchor.getAttribute('href') ?? ''
      const match = site.contactConfirmation.channels.find((item) => item.enabled && item.destination === href)
      if (match) { event.preventDefault(); setChannel(match) }
    }
    document.addEventListener('click', capture, true)
    return () => document.removeEventListener('click', capture, true)
  }, [captureContacts, site.contactConfirmation.channels])
  return <ActionLayerContext.Provider value={{ requestContact, requestLead, requestExternal }}>{children}
    <Dialog open={channel !== null} onClose={() => setChannel(null)} title={site.contactConfirmation.dialogTitle}>{channel && <div className="text-center">{site.contactConfirmation.avatar ? <ProgressiveImage media={site.contactConfirmation.avatar} alt={site.contactConfirmation.avatar.alt} className="mx-auto h-20 w-20 rounded-full object-cover" /> : <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-soft text-ink">{channel.channel === 'phone' ? <Phone /> : channel.channel === 'email' ? <Mail /> : <Send />}</span>}<p className="type-caption mt-5 text-ink-soft">{channel.label}</p><p className="type-title-card mt-1 break-all text-ink">{channel.displayValue}</p><div className="mt-7 flex justify-center gap-3"><Button variant="neutral" onClick={() => setChannel(null)}>{site.contactConfirmation.cancelLabel}</Button><ButtonLink data-contact-confirmed data-analytics-ignore href={channel.destination} target={channel.destination.startsWith('http') ? '_blank' : undefined} rel={channel.destination.startsWith('http') ? 'noreferrer' : undefined}>{channel.channel === 'phone' ? 'Позвонить' : site.contactConfirmation.continueLabel}</ButtonLink></div></div>}</Dialog>
    <Dialog open={lead !== null} onClose={() => setLead(null)} title={site.contactConfirmation.formTitle} mobileTall>{lead && <LeadForm site={site} lead={lead} onClose={() => setLead(null)} onContact={(kind) => { requestContact(kind) }} />}</Dialog>
    <Dialog open={external !== null} onClose={() => setExternal(null)} title="Перейти на внешний сайт?">
      {external && <div className="text-center">
        <p className="type-body text-ink-soft">Вы переходите на сайт{external.label ? ` «${external.label}»` : ''}, который находится за пределами UNLIM RIGA PADEL.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Button variant="neutral" onClick={() => setExternal(null)}>Остаться</Button>
          <Button onClick={() => { window.open(external.href, '_blank', 'noopener,noreferrer'); setExternal(null) }}>Продолжить</Button>
        </div>
      </div>}
    </Dialog>
  </ActionLayerContext.Provider>
}

export function useActionLayer(): ActionLayerValue {
  const value = useContext(ActionLayerContext)
  if (!value) throw new Error('Action layer is not available.')
  return value
}
