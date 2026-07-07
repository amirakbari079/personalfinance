export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  username: string
  message: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T | null
}

const BASE = '/api/v1'

export async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) throw new Error('پاسخی از سرور دریافت نشد')
  return JSON.parse(text) as T
}

export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  })
  if (!res.ok) {
    // Include the HTTP status code in the error so it surfaces in the UI for debugging.
    let message = `خطای ورود (HTTP ${res.status})`
    try {
      const err: ApiResponse<null> = await parseJson(res)
      if (err.message) message = `${err.message} (HTTP ${res.status})`
    } catch {
      // body was empty or not JSON — keep the status-code-only message
    }
    throw new Error(message)
  }
  return parseJson(res)
}

export async function logout(): Promise<void> {
  await fetch(`${BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function getMe(): Promise<ApiResponse<string>> {
  const res = await fetch(`${BASE}/auth/me`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Unauthenticated')
  return parseJson(res)
}
