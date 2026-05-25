// All calls to the Stripe backend go through this module.
// Set VITE_API_URL in your .env to point at the backend server.

const BASE = 'https://yojaz-elite.onrender.com'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

// Create a Stripe Checkout session and return the redirect URL
export async function createCheckoutSession(tier, userId, userEmail) {
  return post('/api/create-checkout-session', { tier, userId, userEmail })
}

// Verify a completed checkout session (called on success redirect)
export async function verifySession(sessionId) {
  return get(`/api/verify-session/${sessionId}`)
}

// Get current subscription status for a user
export async function getSubscription(userId) {
  return get(`/api/subscription/${userId}`)
}

// Open Stripe Customer Portal (manage billing, update card, etc.)
export async function createPortalSession(userId) {
  return post('/api/create-portal-session', { userId })
}

// Cancel subscription at period end
export async function cancelSubscription(userId) {
  return post('/api/cancel-subscription', { userId })
}

// Reactivate a subscription that was set to cancel at period end
export async function reactivateSubscription(userId) {
  return post('/api/reactivate-subscription', { userId })
}

// Get payment history / invoices
export async function getPaymentHistory(userId) {
  return get(`/api/payment-history/${userId}`)
}

// Check if the backend is reachable
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}
