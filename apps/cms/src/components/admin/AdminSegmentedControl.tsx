import type { ReactNode } from 'react'

type SegmentValue = number | string

type AdminSegmentedControlProps<T extends SegmentValue> = {
  ariaLabel?: string
  className?: string
  formatLabel?: (item: T) => ReactNode
  items: readonly T[]
  onChange: (item: T) => void
  value?: T
}

export function AdminSegmentedControl<T extends SegmentValue>({ ariaLabel, className, formatLabel = (item) => item, items, onChange, value }: AdminSegmentedControlProps<T>) {
  const Component = ariaLabel ? 'nav' : 'div'
  return (
    <Component className={['admin-segmented-control', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      {items.map((item) => <button className={value === item ? 'active' : ''} key={String(item)} onClick={() => onChange(item)} type="button">{formatLabel(item)}</button>)}
    </Component>
  )
}
