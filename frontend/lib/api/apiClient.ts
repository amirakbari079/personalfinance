export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T | null
}

const readCache = new Map<string, { expiresAt: number; value: Promise<unknown> }>()
let cacheGeneration = 0

/** Memory only: never persist financial records in localStorage. */
export function clearApiCache() {
  cacheGeneration++
  readCache.clear()
}

export async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) throw new Error('پاسخی از سرور دریافت نشد')
  return JSON.parse(text) as T
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const err: ApiResponse<null> = await parseJson(res)
    return err.message ?? fallback
  } catch {
    return fallback
  }
}

type RequestOptions = RequestInit & {
  /** Fallback Persian message when the body has no `message`. */
  errorMessage?: string
}

/**
 * Authenticated JSON API call. Always sends cookies (`credentials: 'include'`).
 * Returns `data` from the `ApiResponse` envelope.
 */
export async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { errorMessage: fallback = 'خطای سرور', headers, body, ...rest } = options
  const mutates = !['GET', 'HEAD'].includes((rest.method ?? 'GET').toUpperCase())
  if (mutates) clearApiCache()
  let res: Response
  try {
    res = await fetch(url, {
    credentials: 'include',
    ...rest,
    signal: rest.signal ?? AbortSignal.timeout(90_000),
    headers: {
      ...(body != null && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error
    throw new Error('ارتباط با برنامه برقرار نشد. وضعیت اجرا را بررسی کنید و دوباره تلاش کنید.')
  } finally {
    if (mutates) clearApiCache()
  }
  if (!res.ok) {
    if (res.status === 401) {
      clearApiCache()
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('pf-session-expired'))
    }
    throw new Error(await errorMessage(res, fallback))
  }
  const envelope: ApiResponse<T> = await parseJson(res)
  if (!envelope.success) throw new Error(envelope.message ?? fallback)
  return envelope.data as T
}

export function apiGet<T>(url: string, errorMsg: string): Promise<T> {
  const cached = readCache.get(url)
  if (cached && cached.expiresAt > Date.now()) return cached.value as Promise<T>
  const generation = cacheGeneration
  const value = apiRequest<T>(url, { errorMessage: errorMsg }).catch((error) => {
    if (generation === cacheGeneration && readCache.get(url)?.value === value) readCache.delete(url)
    throw error
  })
  if (readCache.size >= 100) readCache.delete(readCache.keys().next().value!)
  readCache.set(url, { value, expiresAt: Date.now() + 15_000 })
  return value
}

export function apiGetList<T>(url: string, errorMsg: string): Promise<T[]> {
  return apiGet<T[] | null>(url, errorMsg).then((data) => data ?? [])
}

export function apiPost<T>(url: string, body: unknown, errorMsg: string): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
    errorMessage: errorMsg,
  })
}

export function apiPut<T>(url: string, body: unknown, errorMsg: string): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    errorMessage: errorMsg,
  })
}

export function apiDelete(url: string, errorMsg: string): Promise<void> {
  return apiRequest<null>(url, { method: 'DELETE', errorMessage: errorMsg }).then(() => undefined)
}
