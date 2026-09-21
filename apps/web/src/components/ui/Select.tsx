import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type Ref } from 'react'

import { cn } from '../../utils/cn'

export type SelectOption = { value: string; label: string }

export interface SelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  className?: string
  id?: string
  disabled?: boolean
  buttonRef?: Ref<HTMLButtonElement>
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'false' | 'true'
  'aria-required'?: boolean | 'false' | 'true'
}

export function Select({
  value,
  options,
  onChange,
  className,
  id,
  disabled = false,
  buttonRef,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const reduceMotion = useReducedMotion() ?? false
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selected = options[selectedIndex] ?? options[0]

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [open])

  useLayoutEffect(() => {
    if (!open) return
    const updateMenuPosition = () => {
      const rect = rootRef.current?.getBoundingClientRect()
      if (!rect) return
      const contentWidth = menuRef.current?.scrollWidth ?? rect.width
      const width = Math.min(Math.max(rect.width, contentWidth), window.innerWidth - 16)
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
      setMenuPosition((current) => current && current.top === rect.bottom + 6 && current.left === left && current.width === width
        ? current
        : { top: rect.bottom + 6, left, width })
    }
    updateMenuPosition()
    const frame = window.requestAnimationFrame(updateMenuPosition)
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open, options.length])

  const choose = (next: SelectOption) => {
    onChange(next.value)
    setOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen((current) => !current)
      return
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || options.length === 0) return
    event.preventDefault()
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? options.length - 1
        : Math.max(0, Math.min(options.length - 1, selectedIndex + (event.key === 'ArrowDown' ? 1 : -1)))
    if (open) choose(options[nextIndex])
    else setOpen(true)
  }

  return <div ref={rootRef} className="relative h-full min-w-0 w-full">
    <button
      ref={buttonRef}
      id={id}
      type="button"
      disabled={disabled}
      className={cn('ui-select ui-select-trigger flex w-full items-center justify-between text-left', className)}
      aria-label={ariaLabel}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={handleKeyDown}
    >
      <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{selected?.label}</span>
      <motion.span
        aria-hidden="true"
        animate={{ rotate: open ? 180 : 0 }}
        transition={reduceMotion ? { duration: 0.01 } : { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="ml-3 flex shrink-0 text-ink-soft"
      >
        <ChevronDown size={17} />
      </motion.span>
    </button>
    {typeof document !== 'undefined' && createPortal(
      <AnimatePresence initial={false}>
        {open && menuPosition && <motion.div
          ref={menuRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.985 }}
          transition={reduceMotion ? { duration: 0.01 } : { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, width: menuPosition.width }}
          className="ui-select-menu z-[100] origin-top type-ui font-medium"
        >
          {options.map((option) => <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === value}
            className={cn('ui-select-option', option.value === value && 'selected')}
            onClick={() => choose(option)}
          >{option.label}</button>)}
        </motion.div>}
      </AnimatePresence>,
      document.body,
    )}
  </div>
}
