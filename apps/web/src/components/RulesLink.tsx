import { ArrowUpRight } from 'lucide-react'
export function RulesLink({ children = 'Читать полные правила клуба' }: { children?: string }) {
  return <a href="/rules" className="type-ui mt-6 inline-flex items-center gap-2 font-medium text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:text-lime-deep focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-4">{children}<ArrowUpRight size={16} aria-hidden="true" /></a>
}
