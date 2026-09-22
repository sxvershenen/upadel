export type PublicRouteError = { status: 404 | 503; title: string; message: string }

export function publicRouteError(error: unknown): PublicRouteError {
  const status = typeof error === 'object' && error !== null && 'status' in error && (error as { status?: unknown }).status === 404
    ? 404
    : 503
  return status === 404
    ? { status, title: 'Страница не найдена', message: 'Такой страницы нет или она больше не опубликована.' }
    : { status, title: 'Страница временно недоступна', message: 'Попробуйте обновить страницу немного позже.' }
}
