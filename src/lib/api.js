const BASE_URL = import.meta.env.VITE_API_BASE_URL

export function getTokens() {
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  }
}

export function setTokens({ access, refresh }) {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const { access } = getTokens()
    if (access) headers['Authorization'] = `Bearer ${access}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.detail || Object.values(data || {}).flat().join(' ') || 'Something went wrong'
    throw new Error(message)
  }

  return data
}

export async function registerUser(payload) {
  return apiRequest('/auth/register/', { method: 'POST', body: payload })
}

export async function loginUser({ username, password }) {
  const data = await apiRequest('/auth/login/', {
    method: 'POST',
    body: { username, password },
  })
  setTokens({ access: data.access, refresh: data.refresh })
  return data
}

export async function getCurrentUser() {
  return apiRequest('/auth/me/', { auth: true })
}
