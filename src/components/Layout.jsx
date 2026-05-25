import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import {
  LayoutDashboard, Dumbbell, Map, TrendingUp, Video, MessageSquare,
  User, Shield, LogOut, Menu, X, Zap, Target, Timer, BookOpen,
  Brain, Swords, Newspaper, Film, Keyboard, Gift, Sun, Moon,
  Gamepad2, ChevronDown, ChevronUp,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Core',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/challenges', icon: Target, label: 'Daily Challenge' },
      { to: '/routine', icon: Dumbbell, label: 'Routine' },
      { to: '/maps', icon: Map, label: 'Maps' },
      { to: '/progress', icon: TrendingUp, label: 'Progress' },
    ],
  },
  {
    label: 'Training Tools',
    items: [
      { to: '/timer', icon: Timer, label: 'Session Timer' },
      { to: '/journal', icon: BookOpen, label: 'Journal' },
      { to: '/ranked', icon: TrendingUp, label: 'Ranked Tracker' },
      { to: '/mental-game', icon: Brain, label: 'Mental Game' },
      { to: '/tournament-prep', icon: Swords, label: 'Tournament Prep' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { to: '/meta', icon: Newspaper, label: 'Meta Breakdown' },
      { to: '/vod-review', icon: Film, label: 'VOD Review' },
      { to: '/keybinds', icon: Keyboard, label: 'Keybinds' },
      { to: '/clips', icon: Video, label: 'Clips', tier: 'extreme' },
      { to: '/coach', icon: MessageSquare, label: 'AI Coach', tier: 'extreme' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/referral', icon: Gift, label: 'Referral' },
      { to: '/profile', icon: User, label: 'Profile' },
    ],
  },
]

function TierBadge({ tier }) {
  if (!tier) return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
      No Plan
    </span>
  )
  const cls = tier === 'extreme' ? 'tier-extreme' : tier === 'premium' ? 'tier-premium' : 'tier-basic'
  return <span className={`${cls} text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>{tier}</span>
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
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
      </div>
    </div>
  )
}

function NavSection({ section, user, collapsed, onToggle }) {
  return (
    <div className="mb-1">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 uppercase tracking-widest font-bold hover:text-slate-400 transition-colors">
        {section.label}
        {collapsed ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {section.items.map(({ to, icon: Icon, label, tier }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }>
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {tier && user?.tier !== tier && user?.role !== 'admin' && (
                  <span className="text-xs tier-extreme px-1.5 py-0.5 rounded">PRO</span>
                )}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Layout() {
  const { user, logout, updateUser } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState({})

  const handleLogout = () => { logout(); navigate('/login') }

  const toggleSection = (label) => setCollapsed(c => ({ ...c, [label]: !c[label] }))

  const inputMode = user?.inputMode || 'kbm'
  const toggleInputMode = () => updateUser({ inputMode: inputMode === 'kbm' ? 'controller' : 'kbm' })

  const allItems = NAV_SECTIONS.flatMap(s => s.items)
  const navItems = user?.role === 'admin'
    ? [...allItems, { to: '/admin', icon: Shield, label: 'Admin' }]
    : allItems

  const adminSection = user?.role === 'admin'
    ? [{ label: 'Admin', items: [{ to: '/admin', icon: Shield, label: 'Admin Panel' }] }]
    : []

  const sections = [...NAV_SECTIONS, ...adminSection]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a0f1a] border-r border-cyan-500/10 fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="px-6 py-4 border-b border-cyan-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap size={18} className="text-black" />
            </div>
            <div>
              <span className="font-black text-lg gradient-text">YoJaz</span>
              <span className="text-white font-black text-lg"> Elite</span>
            </div>
          </div>
          {/* Theme toggle */}
          <button onClick={toggleTheme} title="Toggle theme"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-3 border-b border-cyan-500/10">
          <div className="card-bg rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-black font-black text-sm flex-shrink-0">
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                  : user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-sm truncate">{user?.username}</p>
                <TierBadge tier={user?.tier} />
              </div>
            </div>
            <XPBar xp={user?.xp || 0} level={user?.level || 1} />
            {/* Input mode toggle */}
            <button onClick={toggleInputMode}
              className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-300 transition-colors py-0.5">
              <span className="flex items-center gap-1.5">
                {inputMode === 'controller' ? <Gamepad2 size={11} /> : <Keyboard size={11} />}
                {inputMode === 'controller' ? 'Controller Mode' : 'KBM Mode'}
              </span>
              <span className="text-slate-600">tap to switch</span>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
          {sections.map(section => (
            <NavSection key={section.label} section={section} user={user}
              collapsed={!!collapsed[section.label]}
              onToggle={() => toggleSection(section.label)} />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-cyan-500/10">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/95 backdrop-blur-md border-b border-cyan-500/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <Zap size={14} className="text-black" />
          </div>
          <span className="font-black gradient-text">YoJaz Elite</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-1.5 text-slate-400 hover:text-white">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => setMobileOpen(v => !v)} className="text-slate-400 hover:text-white">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="lg:hidden fixed inset-0 z-40 pt-14">
            <div className="bg-[#0a0f1a] h-full w-72 border-r border-cyan-500/10 flex flex-col overflow-y-auto">
              <div className="p-4 space-y-1 flex-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        isActive ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`
                    }>
                    <Icon size={16} /> {label}
                  </NavLink>
                ))}
              </div>
              <div className="p-4 border-t border-cyan-500/10">
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 w-full">
                  <LogOut size={18} /> Logout
                </button>
              </div>
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
