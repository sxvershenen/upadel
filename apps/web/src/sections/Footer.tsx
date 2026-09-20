import React from 'react'
import { CircleParking, Clock3, Mail, MapPin, TrainFront, Video } from 'lucide-react'
import { useSite } from '../content/ContentContext'
import { Reveal } from '../components/ui/Reveal'
import { Partners } from './Partners'
import { useActionLayer } from '../actions/ActionLayer'
import { VkIcon } from '../components/ui/VkIcon'
import { PhoneIcon, TelegramIcon } from '../components/ui/ContactIcons'

export function Footer() {
  const site = useSite()
  const { contacts, footer } = site
  const { requestContact } = useActionLayer()
  const contactRows = [
    { icon: MapPin, label: contacts.labels.address, value: contacts.address, href: contacts.directionsURL ?? undefined },
    { icon: TrainFront, label: contacts.labels.transit, value: contacts.transit },
    { icon: CircleParking, label: contacts.labels.parking, value: contacts.parking },
    { icon: Clock3, label: contacts.labels.openingHours, value: contacts.openingHours },
    { icon: PhoneIcon, label: contacts.labels.phone, value: contacts.phoneDisplay, href: `tel:${contacts.phoneValue}` },
    { icon: Mail, label: contacts.labels.email, value: contacts.email, href: `mailto:${contacts.email}` },
  ]
  const socialIcons = { telegram: TelegramIcon, video: Video, vk: VkIcon }
  const mapURL = `https://yandex.ru/map-widget/v1/?ll=${contacts.map.longitude}%2C${contacts.map.latitude}&z=${contacts.map.zoom}&pt=${contacts.map.longitude},${contacts.map.latitude},pm2rdl`
  const navColumns = ['1', '2'].map((column) => footer.navigation.filter((item) => item.column === column))

  return <footer id="footer" className="mesh-dark relative overflow-hidden pb-[calc(96px+env(safe-area-inset-bottom))] pt-20 text-white md:pb-16">
    <div className="container-page"><div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <Reveal scope={false}><div className="flex flex-col gap-6"><Reveal><div className="se-3 h-[260px] w-full overflow-hidden bg-white/5"><iframe title={`Карта клуба ${site.brandName}`} src={mapURL} className="h-full w-full grayscale" loading="eager" /></div></Reveal><div data-footer-contact-grid className="grid grid-cols-1 gap-2 sm:grid-cols-2">{contactRows.map((row, index) => { const Tag = row.href ? 'a' : 'div'; const channel = row.href?.startsWith('tel:') ? 'phone' : row.href?.startsWith('mailto:') ? 'email' : null; return <Reveal key={row.label} delay={(index + 1) * 0.06}><Tag key={row.label} href={row.href} data-analytics-action={channel ?? (row.href?.startsWith('http') ? 'directions' : undefined)} onClick={channel ? (event) => { event.preventDefault(); requestContact(channel) } : undefined} target={row.href?.startsWith('http') ? '_blank' : undefined} rel={row.href?.startsWith('http') ? 'noreferrer' : undefined} className="se-2 flex items-start gap-3 bg-white/5 p-4 transition-colors hover:bg-white/10"><row.icon size={16} className="mt-0.5 shrink-0 text-white/45" /><span className="flex flex-col gap-0.5"><span className="type-caption text-white/45">{row.label}</span><span className="type-ui font-medium text-white/85">{row.value}</span></span></Tag></Reveal> })}</div></div></Reveal>
      <Reveal delay={0.5}><div className="flex flex-col gap-6">{footer.image && <div className="se-3 aspect-[16/10] w-full overflow-hidden"><img src={footer.image.url} alt={footer.image.alt} className="h-full w-full object-cover" /></div>}<p className="type-body-sm max-w-[520px] text-white/60">{footer.about}</p><div className="grid grid-cols-4 gap-3 border-t border-white/10 pt-6 text-center sm:text-left">{footer.stats.map(({ value, label }) => <div key={label} className="flex flex-col gap-1"><span className="type-title-card font-semibold text-white">{value}</span><span className="type-micro leading-tight text-white/45">{label}</span></div>)}</div></div></Reveal>
    </div></div>
    <div className="container-page mt-16"><Partners /></div>
    <div className="container-page mt-16 flex flex-col gap-8"><div className="flex flex-col justify-between gap-8 md:flex-row"><div className="flex flex-col gap-3"><span className="type-editorial font-semibold text-white">{site.brandName}</span><p className="type-caption max-w-[280px] leading-relaxed text-white/40">{footer.legalEntity}</p><div className="flex items-center gap-2 pt-1">{footer.socialLinks.map((item) => { const Icon = socialIcons[item.provider as keyof typeof socialIcons]; const channel = item.provider === 'telegram' || item.provider === 'vk' ? item.provider : null; return <a key={item.provider} href={item.url} data-analytics-action={channel ?? 'external'} onClick={channel ? (event) => { event.preventDefault(); requestContact(channel) } : undefined} aria-label={item.label} target={item.url.startsWith('https://') ? '_blank' : undefined} rel={item.url.startsWith('https://') ? 'noreferrer' : undefined} className="se-1 type-micro flex h-[var(--control-sm)] w-[var(--control-sm)] items-center justify-center bg-white/10 font-semibold text-white/70 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2">{Icon ? <Icon size={15} /> : item.provider === 'instagram' ? 'IG' : 'VK'}</a> })}</div></div><div className="type-ui grid grid-cols-2 gap-x-10 gap-y-2 text-white/55 sm:flex sm:gap-16">{navColumns.map((column, index) => <div key={index} className="flex flex-col gap-2.5">{column.map((item) => <a key={item.label} href={item.href} className="transition-colors hover:text-white">{item.label}</a>)}</div>)}</div></div><div className="type-caption flex flex-col gap-3 border-t border-white/10 pt-6 text-white/40 sm:flex-row sm:items-center sm:justify-between"><span>{footer.copyright}</span><div className="flex flex-wrap gap-x-5 gap-y-1">{footer.legalLinks.map((item) => <a key={item.label} href={item.href} className="transition-colors hover:text-white/70">{item.label}</a>)}</div></div></div>
  </footer>
}
