import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Dumbbell, Map, TrendingUp, Video,
  MessageSquare, User, Shield, LogOut, Menu, X, Zap, ChevronUp
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/routine', icon: Dumbbell, label: 'Routine' },
  { to: '/maps', icon: Map, label: 'Maps' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/clips', icon: Video, label: 'Clips', tier: 'extreme' },
  { to: '/coach', icon: MessageSquare, label: 'AI Coach', tier: 'extreme' },
  { to: '/profile', icon: User, label: 'Profile' },
]

function TierBadge({ tier }) {
  if (!tier) return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
      No Plan
    </span>
  )
  const cls = tier === 'extreme' ? 'tier-extreme' : tier === 'premium' ? 'tier-premium' : 'tier-basic'
  return (
    <span className={`${cls} text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
      {tier}
    </span>
  )
}

function XPBar({ xp, level }) {
  const xpForLevel = level * level * 100
  const xpForNext = (level + 1) * (level + 1) * 100
  const progress = ((xp - xpForLevel) / (xpForNext - xpForLevel)) * 100
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Level {level}</span>
        <span>{xp.toLocaleString()} XP</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
        />
      </div>
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = user?.role === 'admin'
    ? [...NAV, { to: '/admin', icon: Shield, label: 'Admin' }]
    : NAV

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a0f1a] border-r border-cyan-500/10 fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-cyan-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap size={18} className="text-black" />
            </div>
            <div>
              <span className="font-black text-lg gradient-text">YoJaz</span>
              <span className="text-white font-black text-lg"> Elite</span>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-cyan-500/10">
          <div className="card-bg rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-black font-black text-sm flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                ) : user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">{user?.username}</p>
                <TierBadge tier={user?.tier} />
              </div>
            </div>
            <XPBar xp={user?.xp || 0} level={user?.level || 1} />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, tier }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {tier && user?.tier !== tier && user?.role !== 'admin' && (
                <span className="ml-auto text-xs tier-extreme px-1.5 py-0.5 rounded">PRO</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-cyan-500/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/95 backdrop-blur-md border-b border-cyan-500/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <Zap size={14} className="text-black" />
          </div>
          <span className="font-black gradient-text">YoJaz Elite</span>
        </div>
        <button onClick={() => setMobileOpen(v => !v)} className="text-slate-400 hover:text-white">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="lg:hidden fixed inset-0 z-40 pt-14"
          >
            <div className="bg-[#0a0f1a] h-full w-72 border-r border-cyan-500/10 flex flex-col p-4 space-y-2">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 mt-auto"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
