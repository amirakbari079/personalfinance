export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T | null
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
  const res = await fetch(url, {
    credentials: 'include',
    ...rest,
    headers: {
      ...(body != null ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body,
  })
  if (!res.ok) {
    throw new Error(await errorMessage(res, fallback))
  }
  const envelope: ApiResponse<T> = await parseJson(res)
  return envelope.data as T
}

export function apiGet<T>(url: string, errorMsg: string): Promise<T> {
  return apiRequest<T>(url, { errorMessage: errorMsg })
}

export function apiGetList<T>(url: string, errorMsg: string): Promise<T[]> {
  return apiRequest<T[] | null>(url, { errorMessage: errorMsg }).then((data) => data ?? [])
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
