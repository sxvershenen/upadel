import type { ActionDTO } from '@unlim/content-contract'
import type { Transition } from 'framer-motion'
import type { ReactNode } from 'react'

import { useSite } from '../content/ContentContext'
import { useActionLayer } from '../actions/ActionLayer'
import type { RevealConfig } from './ui/revealAttributes'
import { Button, ButtonLink, type ButtonSize, type ButtonVariant } from './ui/Button'

type Props = {
  'aria-label'?: string
  action: ActionDTO
  children?: ReactNode
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  iconOnly?: boolean
  iconDivider?: boolean
  iconPosition?: 'left' | 'right'
  reveal?: RevealConfig
  size?: ButtonSize
  sourceEntity?: string
  sourcePage?: string
  title?: string
  layout?: boolean | 'position' | 'size' | 'preserve-aspect'
  transition?: Transition
  variant?: ButtonVariant
}

export function ContentAction({ action, children, sourceEntity, sourcePage, ...buttonProps }: Props) {
  const site = useSite()
  const { requestContact, requestExternal, requestLead } = useActionLayer()
  const label = children ?? action.label ?? site.booking.buttonLabel
  let href = action.href ?? undefined

  if (action.mode === 'phone') href = `tel:${site.contacts.phoneValue}`
  if (action.mode === 'email') href = `mailto:${site.contacts.email}`
  if ((action.mode === 'booking' || action.mode === 'trial-booking') && site.booking.mode === 'external-link') {
    href = site.booking.externalURL ?? undefined
  }

  const analyticsObject = action.mode === 'lead-form' ? 'form' : sourcePage?.startsWith('/coaches') ? 'coach' : sourcePage?.startsWith('/tournaments') ? 'tournament' : sourcePage?.startsWith('/blog') ? 'article' : undefined
  const analyticsProps = { 'data-analytics-action': action.mode === 'booking' || action.mode === 'trial-booking' ? 'booking' : action.mode === 'phone' ? 'phone' : action.mode === 'email' ? 'email' : action.mode === 'lead-form' ? 'lead' : action.mode === 'external-link' ? 'external' : action.mode === 'internal-link' ? 'internal' : undefined, 'data-analytics-object-type': analyticsObject, 'data-analytics-object-id': sourceEntity }
  if (action.mode === 'phone' || action.mode === 'email') { const contactMode = action.mode; return <Button {...buttonProps} {...analyticsProps} onClick={() => requestContact(contactMode)}>{label}</Button> }
  const leadType = action.mode === 'lead-form' ? action.leadType ?? 'other' : action.mode === 'trial-booking' && !href ? 'trial' : action.mode === 'booking' && !site.booking.ready ? 'consultation' : null
  if (leadType) return <Button {...buttonProps} {...analyticsProps} onClick={() => requestLead({ type: leadType, sourcePage: sourcePage ?? window.location.pathname, sourceEntity })}>{label}</Button>

  if (action.mode === 'external-link' && href) {
    return <Button {...buttonProps} {...analyticsProps} onClick={() => requestExternal({ href, label: typeof label === 'string' ? label : action.label })}>{label}</Button>
  }

  if (href) {
    const external = href.startsWith('https://')
    return <ButtonLink {...buttonProps} {...analyticsProps} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{label}</ButtonLink>
  }

  return <Button {...buttonProps} {...analyticsProps}>{label}</Button>
}
