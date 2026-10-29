import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { trackDesktopPhoneClick } from '../analytics/metrica'
import { PhoneIcon } from './ui/ContactIcons'
import { PixelPhoneNumber } from './ui/PixelPhoneNumber'

const classes = 'se-2 items-start gap-3 bg-white/5 p-4 text-left transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2'

export function FooterPhoneContact({ label, display, value, onContact }: { label: string; display: string; value: string; onContact: () => void }) {
  const [revealed, setRevealed] = useState(false)
  return <>
    <button type="button" data-footer-phone-reveal data-analytics-action="phone" aria-expanded={revealed} aria-label={revealed ? `Скрыть номер телефона ${display}` : 'Показать полный номер телефона'} onClick={() => {
      setRevealed(!revealed)
      if (!revealed) trackDesktopPhoneClick()
    }} className={`${classes} hidden w-full md:flex`}>
      <PhoneIcon size={16} className="mt-0.5 shrink-0 text-white/45" />
      <span className="flex min-w-0 flex-col gap-0.5"><span className="type-caption text-white/45">{label}</span><span className="type-ui font-medium text-white/85"><PixelPhoneNumber display={display} revealed={revealed} /></span></span>
      <span aria-hidden="true" className="se-1 ml-auto flex h-8 w-8 shrink-0 items-center justify-center self-center bg-white/5 text-white/60">{revealed ? <EyeOff size={16} /> : <Eye size={16} />}</span>
    </button>
    <a href={`tel:${value}`} data-contact-confirmed data-analytics-action="phone" onClick={(event) => { event.preventDefault(); onContact() }} className={`${classes} flex md:hidden`}>
      <PhoneIcon size={16} className="mt-0.5 shrink-0 text-white/45" />
      <span className="flex flex-col gap-0.5"><span className="type-caption text-white/45">{label}</span><span className="type-ui font-medium text-white/85">{display}</span></span>
    </a>
  </>
}
