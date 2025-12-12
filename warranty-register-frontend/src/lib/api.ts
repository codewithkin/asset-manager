const API_URL = process.env.NEXT_PUBLIC_WARRANTY_REGISTER_API_URL || process.env.WARRANTY_REGISTER_API_URL || 'http://localhost:8000'

export type RegisterResult = { success: boolean; user?: { id: number; username: string } }
export type LoginResult = { access_token: string; token_type: string }
export type WarrantiesResult = { success: boolean; data: Array<any> }

export async function registerUser({ username, password }: { username: string; password: string }): Promise<RegisterResult> {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error((data && data.detail) || JSON.stringify(data) || 'Registration failed')
  return data
}

export async function loginUser({ username, password }: { username: string; password: string }): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error((data && data.detail) || JSON.stringify(data) || 'Login failed')
  return data
}

export async function fetchWarranties(token: string | null): Promise<WarrantiesResult> {
  const res = await fetch(`${API_URL}/warranties`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  })
  const data = await res.json()
  if (!res.ok) throw new Error((data && data.detail) || JSON.stringify(data) || 'Failed to fetch warranties')
  return data
}

export function saveToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem('warranty_token', token)
}

export function loadToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('warranty_token')
}

export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('warranty_token')
}
