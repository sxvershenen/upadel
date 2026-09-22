import { catalogPath, type CatalogDTO } from '@unlim/content-contract'

export function visiblePageNumbers(page: number, total: number): Array<number | 'ellipsis'> {
  const values = [...new Set([1, page - 1, page, page + 1, total])].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b)
  return values.flatMap((value, index): Array<number | 'ellipsis'> => index > 0 && value - values[index - 1] > 1 ? ['ellipsis', value] : [value])
}

export function CatalogPagination({ dto, onPreviewNavigate }: { dto: CatalogDTO; onPreviewNavigate?: (page: number) => void }) {
  const { page, totalPages } = dto.pagination
  if (totalPages <= 1) return null
  const link = (number: number, label: string, current = false) => <a
    href={catalogPath(dto.kind, { ...dto.query, page: number })}
    aria-label={`Страница ${number}`}
    aria-current={current ? 'page' : undefined}
    onClick={dto.preview ? (event) => { event.preventDefault(); onPreviewNavigate?.(number) } : undefined}
    className={`se-2 inline-flex h-11 min-w-11 items-center justify-center px-3 type-ui focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${current ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-lime-soft'}`}
  >{label}</a>
  return <nav aria-label="Страницы каталога" className="mt-10 flex flex-wrap items-center justify-center gap-2">
    {page > 1 && link(page - 1, '←')}
    {visiblePageNumbers(page, totalPages).map((number, index) => number === 'ellipsis'
      ? <span key={`gap-${index}`} aria-hidden="true" className="px-1">…</span>
      : <span key={number}>{link(number, String(number), number === page)}</span>)}
    {page < totalPages && link(page + 1, '→')}
  </nav>
}
