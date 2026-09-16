import { Mail, MapPin, Phone, Send } from 'lucide-react'

import { ContentAction } from '../ContentAction'
import { useSite } from '../../content/ContentContext'
import { BottomSheet } from './BottomSheet'
import { useActionLayer } from '../../actions/ActionLayer'

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const site = useSite()
  const telegram = site.footer.socialLinks.find(({ provider }) => provider === 'telegram')
  const { requestContact } = useActionLayer()
  return <BottomSheet open={open} onClose={onClose} title={site.mobileActions.menuTitle}>
    <nav className="grid grid-cols-2 gap-2 pb-5">{site.mobileMenuNavigation.map((link) => <a key={link.href} href={link.href} onClick={onClose} className="se-1 type-ui bg-surface-subtle px-4 py-3 font-medium text-ink">{link.label}</a>)}</nav>
    <div className="se-2 type-body-sm flex flex-col gap-3 bg-surface-subtle p-4 text-ink-soft">
      <a href={site.contacts.directionsURL ?? undefined} data-analytics-action="directions" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-ink"><MapPin size={16} className="shrink-0" /> {site.contacts.address} · маршрут</a>
      <a href={`tel:${site.contacts.phoneValue}`} data-analytics-action="phone" onClick={(event) => { event.preventDefault(); onClose(); window.setTimeout(() => requestContact('phone'), 300) }} className="flex items-center gap-2.5"><Phone size={16} className="shrink-0" /> {site.contacts.phoneDisplay}</a>
      <a href={`mailto:${site.contacts.email}`} data-analytics-action="email" onClick={(event) => { event.preventDefault(); onClose(); window.setTimeout(() => requestContact('email'), 300) }} className="flex items-center gap-2.5"><Mail size={16} className="shrink-0" /> {site.contacts.email}</a>
      {telegram && <a href={telegram.url} data-analytics-action="telegram" onClick={(event) => { event.preventDefault(); onClose(); window.setTimeout(() => requestContact('telegram'), 300) }} target="_blank" rel="noreferrer" className="flex items-center gap-2.5"><Send size={16} className="shrink-0" /> {telegram.label}</a>}
    </div>
    <div className="mt-4"><ContentAction action={{ mode: 'booking', label: site.mobileActions.bookCourtLabel }} variant="primary" size="lg" fullWidth /></div>
  </BottomSheet>
}
