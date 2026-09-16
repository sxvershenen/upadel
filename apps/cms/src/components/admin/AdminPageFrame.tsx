import type { ReactNode } from 'react'

type AdminPageFrameProps = {
  children: ReactNode
  className?: string
}

export function AdminPageFrame({ children, className }: AdminPageFrameProps) {
  return <main className={['admin-page-frame', className].filter(Boolean).join(' ')}>{children}</main>
}
