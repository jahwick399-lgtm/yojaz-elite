import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getSubscription } from '@/services/api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'yojaz_auth'

function genId() {
  return Math.random().toString(36).slice(2, 11)
}

// Admin credentials are read from environment variables at build time.
// Set VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD in your .env file.
// If either is unset, admin login is disabled entirely.
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || ''

function buildAdminUser() {
  return {
    id: 'admin',
    email: ADMIN_EMAIL,
    username: 'Admin',
    role: 'admin',
    tier: 'extreme',
    avatar: null,
    xp: 0,
    level: 1,
    joinDate: new Date().toISOString().split('T')[0],
    streak: 0,
    achievements: [],
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('yojaz_users')
      if (!stored) return []
      const parsed = JSON.parse(stored)
      // Migrate: strip any legacy hardcoded admin-001 account from previous builds
      return parsed.filter(u => u.id !== 'admin-001')
    } catch { return [] }
  })
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on app load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const found = users.find(u => u.id === parsed.id)
        if (found) {
          // Guard: admin sessions are only valid when env vars are still configured
          if (found.role === 'admin' && (!ADMIN_EMAIL || !ADMIN_PASSWORD)) {
            console.warn('[Auth] Admin session rejected — VITE_ADMIN_EMAIL/PASSWORD not configured')
            localStorage.removeItem(STORAGE_KEY)
          } else {
            setUser(found)
            console.log(`[Auth] Session restored — userId=${found.id} role=${found.role} tier=${found.tier}`)
          }
        } else {
          console.log('[Auth] Stored session ID not found in user list — clearing session')
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist users list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('yojaz_users', JSON.stringify(users))
  }, [users])

  // Sync subscription status from the server whenever the active user changes.
  // The server (via Stripe webhooks) is the source of truth for tier.
  // Admin accounts bypass this — their tier is not managed by Stripe.
  useEffect(() => {
    if (!user || user.role === 'admin') return

    getSubscription(user.id)
      .then(({ tier, status, cancelAtPeriodEnd, renewalDate }) => {
        console.log(
          `[Auth] Subscription sync — userId=${user.id} ` +
          `serverTier=${tier} status=${status} localTier=${user.tier}`
        )
        if (tier !== user.tier) {
          console.log(`[Auth] Subscription sync updating local tier: ${user.tier} → ${tier}`)
          setUser(prev => {
            if (!prev) return prev
            const updated = { ...prev, tier, subscriptionStatus: status, cancelAtPeriodEnd, renewalDate }
            setUsers(us => us.map(u => u.id === updated.id ? updated : u))
            return updated
          })
        }
      })
      .catch(() => {
        console.log(
          `[Auth] Subscription sync skipped — backend unavailable, ` +
          `using cached tier=${user.tier} for userId=${user.id}`
        )
      })
  }, [user?.id]) // Runs once per login/restore, not on every tier change

  const login = useCallback(async (email, password, remember) => {
    await new Promise(r => setTimeout(r, 800))

    // Admin login — credentials must match environment variables exactly.
    // If env vars are unset, this branch is unreachable.
    if (
      ADMIN_EMAIL &&
      ADMIN_PASSWORD &&
      email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      const adminUser = buildAdminUser()
      // Upsert admin into users list so session restore works
      setUsers(prev => prev.some(u => u.id === 'admin') ? prev : [...prev, adminUser])
      setUser(adminUser)
      if (remember) localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: adminUser.id }))
      console.log('[Auth] Admin login via environment credentials')
      return adminUser
    }

    // Regular user login
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) {
      console.warn(`[Auth] Failed login attempt — email: ${email}`)
      throw new Error('Invalid email or password.')
    }
    if (found.role === 'admin') {
      // Reject attempts to log in as a stored admin without env var confirmation
      console.warn('[Auth] Blocked login to admin account without environment credentials')
      throw new Error('Invalid email or password.')
    }
    console.log(`[Auth] Login — userId=${found.id} role=${found.role} tier=${found.tier}`)
    setUser(found)
    if (remember) localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: found.id }))
    return found
  }, [users])

  const signup = useCallback(async ({ email, password, username }) => {
    await new Promise(r => setTimeout(r, 1000))
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      throw new Error('An account with this email already exists.')
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
      throw new Error('Username is already taken.')
    // Prevent signup with the admin email
    if (ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase())
      throw new Error('An account with this email already exists.')

    // tier is always null at signup — it is ONLY set after Stripe confirms payment
    const newUser = {
      id: genId(),
      email,
      password,
      username,
      role: 'user',
      tier: null,
      avatar: null,
      xp: 0,
      level: 1,
      joinDate: new Date().toISOString().split('T')[0],
      streak: 0,
      achievements: ['first_login'],
    }
    console.log(`[Auth] New account created — userId=${newUser.id} email=${email} (no subscription yet)`)
    setUsers(prev => [...prev, newUser])
    setUser(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: newUser.id }))
    return newUser
  }, [users])

  const logout = useCallback(() => {
    console.log(`[Auth] Logout — userId=${user?.id}`)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [user?.id])

  const updateUser = useCallback((updates) => {
    // role and id must never be changed via updateUser
    const { role: _role, id: _id, ...safeUpdates } = updates
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...safeUpdates }
      setUsers(us => us.map(u => u.id === updated.id ? updated : u))
      return updated
    })
  }, [])

  const addXP = useCallback((amount) => {
    setUser(prev => {
      if (!prev) return prev
      const newXp = prev.xp + amount
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1
      const updated = { ...prev, xp: newXp, level: newLevel }
      setUsers(us => us.map(u => u.id === updated.id ? updated : u))
      return updated
    })
  }, [])

  const allUsers = users

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, addXP, allUsers, setUsers }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
