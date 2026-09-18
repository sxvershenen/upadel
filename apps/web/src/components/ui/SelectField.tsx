import { forwardRef, useEffect, useId, useState, type ChangeEvent, type ChangeEventHandler, type ReactNode } from 'react'

import { cn } from '../../utils/cn'
import { Select, type SelectOption } from './Select'
import { revealAttributes, type RevealConfig } from './revealAttributes'

export type SelectFieldOption = SelectOption

export interface SelectFieldProps {
  id?: string
  name?: string
  label: string
  options: SelectFieldOption[]
  description?: ReactNode
  error?: ReactNode
  labelVisibility?: 'visible' | 'sr-only'
  containerClassName?: string
  reveal?: RevealConfig
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  className?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'false' | 'true'
  'aria-required'?: boolean | 'false' | 'true'
  onChange?: ChangeEventHandler<HTMLSelectElement>
}

export const SelectField = forwardRef<HTMLButtonElement, SelectFieldProps>(
  ({
    id: suppliedId,
    name,
    label,
    options,
    description,
    error,
    labelVisibility = 'visible',
    reveal = true,
    className,
    containerClassName,
    value,
    defaultValue,
    disabled = false,
    required = false,
    'aria-describedby': suppliedDescribedBy,
    'aria-invalid': suppliedInvalid,
    'aria-required': suppliedRequired,
    onChange,
  }, ref) => {
    const generatedId = useId()
    const id = suppliedId ?? `select-${generatedId}`
    const descriptionId = description ? `${id}-description` : undefined
    const errorId = error ? `${id}-error` : undefined
    const describedBy = [suppliedDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined
    const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? '')
    const currentValue = value ?? internalValue

    useEffect(() => {
      if (value !== undefined) setInternalValue(value)
    }, [value])

    const handleChange = (nextValue: string) => {
      if (value === undefined) setInternalValue(nextValue)
      if (!onChange) return
      const target = { name: name ?? '', value: nextValue }
      onChange({ target, currentTarget: target } as unknown as ChangeEvent<HTMLSelectElement>)
    }

    return <div {...revealAttributes(reveal)} className={cn('flex flex-col', containerClassName)}>
      <label htmlFor={id} className={cn('type-caption mb-2 font-medium text-ink-soft', labelVisibility === 'sr-only' && 'sr-only')}>{label}</label>
      <div className={cn('se-2 relative flex h-[var(--control-md)] items-center bg-control text-ink transition-colors focus-within:outline-2 focus-within:outline-[var(--color-focus)] focus-within:outline-offset-2', error && 'outline-2 outline-[var(--color-danger)]', disabled && 'cursor-not-allowed opacity-50')}>
        <Select
          id={id}
          buttonRef={ref}
          value={currentValue}
          options={options}
          onChange={handleChange}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={error ? true : suppliedInvalid}
          aria-required={suppliedRequired ?? required}
          className={cn('ui-select-field-trigger h-full bg-control px-4 pr-3 type-ui font-medium outline-none disabled:cursor-not-allowed', className)}
          aria-label={labelVisibility === 'sr-only' ? label : undefined}
        />
        {name && <input type="hidden" name={name} value={currentValue} disabled={disabled} />}
      </div>
      {description && <p id={descriptionId} className="type-caption mt-1.5 text-ink-soft">{description}</p>}
      {error && <p id={errorId} role="alert" className="type-caption mt-1.5 text-danger">{error}</p>}
    </div>
  },
)
SelectField.displayName = 'SelectField'
