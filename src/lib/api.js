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

export async function listBloodRequests() {
  return apiRequest('/requests/', { auth: true })
}

export async function createBloodRequest(payload) {
  return apiRequest('/requests/', { method: 'POST', body: payload, auth: true })
}

export async function getDonorProfile() {
  return apiRequest('/donors/profile/', { auth: true })
}

export async function updateDonorProfile(payload) {
  return apiRequest('/donors/profile/', { method: 'PATCH', body: payload, auth: true })
}

export async function listMyMatches() {
  return apiRequest('/requests/my_matches/', { auth: true })
}

export async function acceptRequest(id, healthAnswers) {
  return apiRequest(`/requests/${id}/accept/`, { method: 'POST', body: healthAnswers, auth: true })
}

export async function declineRequest(id) {
  return apiRequest(`/requests/${id}/decline/`, { method: 'POST', auth: true })
}

export async function getRequestMatches(id) {
  return apiRequest(`/requests/${id}/matches/`, { auth: true })
}

export async function selectDonor(id, donorId) {
  return apiRequest(`/requests/${id}/select_donor/`, {
    method: 'POST',
    body: { donor_id: donorId },
    auth: true,
  })
}

export async function fulfillRequest(id) {
  return apiRequest(`/requests/${id}/fulfill/`, { method: 'POST', auth: true })
}

export async function cancelRequest(id) {
  return apiRequest(`/requests/${id}/cancel/`, { method: 'POST', auth: true })
}

export async function listMessages(bloodRequestId) {
  return apiRequest(`/messages/?blood_request=${bloodRequestId}`, { auth: true })
}

export async function sendMessage(bloodRequestId, content) {
  return apiRequest('/messages/', {
    method: 'POST',
    body: { blood_request: bloodRequestId, content },
    auth: true,
  })
}

export async function listMyDonations() {
  return apiRequest('/donors/donations/', { auth: true })
}

export async function getHospitalAnalytics() {
  return apiRequest('/requests/analytics/', { auth: true })
}

export async function listNotifications() {
  return apiRequest('/notifications/', { auth: true })
}

export async function markNotificationRead(id) {
  return apiRequest(`/notifications/${id}/read/`, { method: 'PATCH', auth: true })
}

export async function listAdminHospitals() {
  return apiRequest('/admin/hospitals/', { auth: true })
}

export async function verifyHospital(id) {
  return apiRequest(`/admin/hospitals/${id}/verify/`, { method: 'POST', auth: true })
}

export async function listAdminDonors() {
  return apiRequest('/admin/donors/', { auth: true })
}

export async function listAdminRequests() {
  return apiRequest('/admin/requests/', { auth: true })
}

export async function adminCancelRequest(id) {
  return apiRequest(`/admin/requests/${id}/cancel/`, { method: 'POST', auth: true })
}

export async function getAdminReports() {
  return apiRequest('/admin/reports/', { auth: true })
}

export async function volunteerForRequest(id, healthAnswers) {
  return apiRequest(`/requests/${id}/volunteer/`, { method: 'POST', body: healthAnswers, auth: true })
}


export async function updateBloodRequest(id, data) {
  return apiRequest(`/requests/${id}/`, { method: 'PATCH', body: data, auth: true })
}

export async function deleteBloodRequest(id) {
  return apiRequest(`/requests/${id}/`, { method: 'DELETE', auth: true })
}
