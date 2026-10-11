'use client'

import { CalendarCheck, CalendarDays, UserRound, ArrowUpRight, Info, Sparkles } from 'lucide-react'
import { FieldLabel, useField } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'

const iconOptions = [
  { label: 'Бронирование', value: 'CalendarCheck', Icon: CalendarCheck },
  { label: 'Календарь', value: 'CalendarDays', Icon: CalendarDays },
  { label: 'Личный кабинет', value: 'UserRound', Icon: UserRound },
  { label: 'Ссылка', value: 'ArrowUpRight', Icon: ArrowUpRight },
  { label: 'Информация', value: 'Info', Icon: Info },
  { label: 'Акцент', value: 'Sparkles', Icon: Sparkles },
] as const

export const HeroSlotIconField: SelectFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })

  return (
    <div className="field-type select hero-slot-icon-field">
      <FieldLabel label={field.label} path={path} required={field.required} />
      <div className="hero-slot-icon-field__options" role="group" aria-label={typeof field.label === 'string' ? field.label : 'Иконка'}>
        {iconOptions.map(({ label, value: iconValue, Icon }) => (
          <button
            key={iconValue}
            type="button"
            className="hero-slot-icon-field__option"
            aria-label={label}
            aria-pressed={value === iconValue}
            title={label}
            onClick={() => setValue(iconValue)}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}
