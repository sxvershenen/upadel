import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

import { cn } from '../../utils/cn'

export type SelectOption = { value: string; label: string }

export function Select({ value, options, onChange, className, 'aria-label': ariaLabel }: { value: string; options: SelectOption[]; onChange: (value: string) => void; className?: string; 'aria-label'?: string }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selected = options[selectedIndex] ?? options[0]

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [open])

  const choose = (next: SelectOption) => {
    onChange(next.value)
    setOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpen((current) => !current); return }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : Math.max(0, Math.min(options.length - 1, selectedIndex + (event.key === 'ArrowDown' ? 1 : -1)))
    if (open) choose(options[nextIndex])
    else setOpen(true)
  }

  return <div ref={rootRef} className="relative min-w-0">
    <button type="button" className={cn('ui-select ui-select-trigger flex w-full items-center justify-between text-left', className)} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((current) => !current)} onKeyDown={handleKeyDown}>
      <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{selected?.label}</span>
    </button>
    {open && <div id={listId} role="listbox" aria-label={ariaLabel} className="ui-select-menu absolute inset-x-0 top-[calc(100%+6px)] z-30">
      {options.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} className={cn('ui-select-option', option.value === value && 'selected')} onClick={() => choose(option)}>{option.label}</button>)}
    </div>}
  </div>
}
