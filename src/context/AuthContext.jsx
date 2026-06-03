import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)
const SESSION_KEY = 'yojaz_session'   // stores { id, email }
const XPDATA_KEY  = 'yojaz_xpdata'   // stores { [id]: { xp, level, streak, achievements } }

const BASE = 'https://yojaz-elite.onrender.com'

const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    || 'admin@yojazelite.gg'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

// ─── XP/game data helpers (stays in localStorage — fast, frequent writes) ─────

function getXPData() {
  try { return JSON.parse(localStorage.getItem(XPDATA_KEY) || '{}') } catch { return {} }
}

function saveXPData(data) {
  localStorage.setItem(XPDATA_KEY, JSON.stringify(data))
}

function getUserXP(id) {
  return getXPData()[id] || { xp: 0, level: 1, streak: 0, achievements: ['first_login'] }
}

function setUserXP(id, updates) {
  const all = getXPData()
  all[id] = { ...(all[id] || { xp: 0, level: 1, streak: 0, achievements: [] }), ...updates }
  saveXPData(all)
}

// ─── Backend helpers ───────────────────────────────────────────────────────────

async function apiPost(path, body) {
  const res  = await fetch(`${BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`)
  return res.json()
}

// ─── Merge backend user with local XP data ────────────────────────────────────

function mergeUser(backendUser) {
  const xp = getUserXP(backendUser.id)
  return { ...backendUser, ...xp, joinDate: backendUser.joinDate || new Date().toISOString().split('T')[0] }
}

// ─── AuthProvider ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = localStorage.getItem(SESSION_KEY)
        if (!stored) { setLoading(false); return }
        const { email } = JSON.parse(stored)
        if (!email) { setLoading(false); return }

        const data = await apiPost('/api/auth/get-user', { email })
        if (data.success) {
          setUser(mergeUser(data.user))
          console.log(`[Auth] Session restored — ${email} tier=${data.user.tier}`)
        } else {
          localStorage.removeItem(SESSION_KEY)
          console.log('[Auth] Session invalid — cleared')
        }
      } catch {
        console.log('[Auth] Session restore failed — backend offline, using cached session')
        try {
          const stored = localStorage.getItem(SESSION_KEY)
          if (stored) {
            const session = JSON.parse(stored)
            if (session.email && session.tier !== undefined) {
              setUser({ id: session.id || session.email, email: session.email, username: session.username || session.email.split('@')[0], tier: session.tier, role: session.role || 'user', ...getUserXP(session.id || session.email) })
            }
          }
        } catch {}
      }
      setLoading(false)
    }
    restore()
  }, [])

  const login = useCallback(async (email, password, remember) => {
    // Admin shortcut
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const adminUser = { id: 'admin', email: ADMIN_EMAIL, username: 'Admin', role: 'admin', tier: 'extreme', xp: 0, level: 1, streak: 0, achievements: [] }
      setUser(adminUser)
      localStorage.setItem(SESSION_KEY, JSON.stringify({ id: 'admin', email: ADMIN_EMAIL, tier: 'extreme', role: 'admin', username: 'Admin' }))
      return adminUser
    }

    const data = await apiPost('/api/auth/login', { email, password })
    if (!data.success) throw new Error(data.error || 'Login failed.')

    const merged = mergeUser(data.user)
    setUser(merged)
    if (remember !== false) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ id: data.user.id, email: data.user.email, tier: data.user.tier, role: data.user.role, username: data.user.username }))
    }
    console.log(`[Auth] Login — ${email} tier=${data.user.tier}`)
    return merged
  }, [])

  const signup = useCallback(async ({ email, password, username }) => {
    const data = await apiPost('/api/auth/signup', { email, password, username })
    if (!data.success) throw new Error(data.error || 'Signup failed.')

    const merged = mergeUser(data.user)
    setUser(merged)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: data.user.id, email: data.user.email, tier: data.user.tier, role: data.user.role, username: data.user.username }))
    console.log(`[Auth] Signup — ${email}`)
    return merged
  }, [])

  const logout = useCallback(() => {
    console.log(`[Auth] Logout — ${user?.email}`)
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }, [user?.email])

  const updateUser = useCallback((updates) => {
    const { role: _r, id: _i, ...safe } = updates
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...safe }
      // Persist XP/game data locally
      setUserXP(updated.id, { xp: updated.xp, level: updated.level, streak: updated.streak, achievements: updated.achievements })
      // Update cached session
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        const session = JSON.parse(stored)
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, tier: updated.tier }))
      }
      return updated
    })
  }, [])

  const addXP = useCallback((amount) => {
    setUser(prev => {
      if (!prev) return prev
      const newXp    = (prev.xp || 0) + amount
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1
      const updated  = { ...prev, xp: newXp, level: newLevel }
      setUserXP(updated.id, { xp: newXp, level: newLevel, streak: updated.streak, achievements: updated.achievements })
      return updated
    })
  }, [])

  // allUsers — still available for admin panel (fetches from backend)
  const [allUsers, setAllUsers] = useState([])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, addXP, allUsers, setUsers: setAllUsers }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
