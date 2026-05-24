import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'
import {
  Zap, Target, TrendingUp, Flame, Trophy, Star,
  Dumbbell, Map, Video, MessageSquare, ChevronRight, Lock
} from 'lucide-react'

const ACHIEVEMENTS = [
  { id: 'first_login', label: 'First Login', icon: '🎮', desc: 'Joined YoJaz Elite' },
  { id: 'week_streak', label: '7-Day Streak', icon: '🔥', desc: 'Trained 7 days straight' },
  { id: 'level_10', label: 'Level 10', icon: '⚡', desc: 'Reached Level 10' },
  { id: 'level_25', label: 'Level 25', icon: '💎', desc: 'Reached Level 25' },
  { id: 'level_50', label: 'Level 50', icon: '👑', desc: 'Reached Level 50' },
  { id: 'clip_master', label: 'Clip Master', icon: '🎬', desc: 'Analyzed 10 clips' },
]

const MISSIONS = [
  { label: 'Complete today\'s routine', xp: 500, done: false },
  { label: 'Analyze a clip', xp: 300, done: false },
  { label: 'Log into AI Coach', xp: 150, done: false },
  { label: '30-min aim training', xp: 250, done: true },
]

const QUICK_LINKS = [
  { to: '/routine', icon: Dumbbell, label: 'Daily Routine', desc: 'Your training plan', color: 'cyan' },
  { to: '/maps', icon: Map, label: 'Training Maps', desc: 'Creative codes', color: 'purple' },
  { to: '/progress', icon: TrendingUp, label: 'Progress', desc: 'Your stats', color: 'blue' },
  { to: '/clips', icon: Video, label: 'Clip Analysis', desc: 'AI feedback', color: 'pink', tier: 'extreme' },
  { to: '/coach', icon: MessageSquare, label: 'AI Coach', desc: 'Get coached', color: 'pink', tier: 'extreme' },
]

function StatCard({ icon: Icon, label, value, color = 'cyan' }) {
  const colors = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }
  return (
    <div className="card-bg rounded-xl p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  )
}

function XPBar({ xp, level }) {
  const xpForLevel = level * level * 100
  const xpForNext = (level + 1) * (level + 1) * 100
  const progress = Math.min(100, Math.max(0, ((xp - xpForLevel) / (xpForNext - xpForLevel)) * 100))
  const needed = xpForNext - xp
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Level {level}</span>
        <span className="text-slate-400">{needed.toLocaleString()} XP to Level {level + 1}</span>
      </div>
      <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full relative"
        >
          <div className="absolute inset-0 bg-white/10 rounded-full" />
        </motion.div>
      </div>
      <div className="flex justify-between text-xs text-slate-600">
        <span>{xp.toLocaleString()} XP</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, addXP } = useAuth()
  if (!user) return null

  const tierColor = user.tier === 'extreme'
    ? 'tier-extreme'
    : user.tier === 'premium'
    ? 'tier-premium'
    : user.tier === 'basic'
    ? 'tier-basic'
    : 'bg-slate-800 text-slate-400 border border-slate-700'

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Welcome back, <span className="gradient-text">{user.username}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`${tierColor} text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider hidden sm:block`}>
          {user.tier ?? 'No Plan'}
        </span>
      </motion.div>

      {/* XP Level Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card-bg rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/30 flex items-center justify-center text-2xl font-black text-white">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : user.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white">{user.username}</span>
              <span className={`${tierColor} text-xs font-bold px-2 py-0.5 rounded-full uppercase`}>{user.tier ?? 'No Plan'}</span>
            </div>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-3xl font-black gradient-text">{user.level}</p>
            <p className="text-xs text-slate-500 uppercase">Level</p>
          </div>
        </div>
        <XPBar xp={user.xp} level={user.level} />
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Day Streak" value={`${user.streak}d`} color="amber" />
        <StatCard icon={Zap} label="Total XP" value={user.xp.toLocaleString()} color="cyan" />
        <StatCard icon={Trophy} label="Achievements" value={user.achievements?.length || 0} color="purple" />
        <StatCard icon={Star} label="Level" value={user.level} color="pink" />
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h2 className="text-lg font-bold text-white mb-3">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {QUICK_LINKS.map(({ to, icon: Icon, label, desc, color, tier }) => {
            const locked = tier && user.tier !== tier && user.role !== 'admin'
            const colorMap = {
              cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
              purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
              blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
              pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
            }
            return (
              <Link key={to} to={locked ? '/subscribe?upgrade=extreme' : to}>
                <div className={`card-bg rounded-xl p-4 transition-all duration-200 hover:transform hover:-translate-y-1 cursor-pointer h-full ${locked ? 'opacity-60' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${colorMap[color]}`}>
                    {locked ? <Lock size={16} className="text-slate-500" /> : <Icon size={18} />}
                  </div>
                  <p className="font-bold text-white text-sm">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{locked ? 'Extreme only' : desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Daily Missions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <h2 className="text-lg font-bold text-white mb-3">Daily Missions</h2>
        <div className="card-bg rounded-xl divide-y divide-white/5">
          {MISSIONS.map((m, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${m.done ? 'border-cyan-400 bg-cyan-400/20' : 'border-slate-600'}`}>
                {m.done && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
              </div>
              <span className={`flex-1 text-sm ${m.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{m.label}</span>
              <span className="text-xs text-cyan-400 font-bold">+{m.xp} XP</span>
              {!m.done && (
                <button
                  onClick={() => addXP(m.xp)}
                  className="text-xs btn-secondary px-3 py-1.5 rounded-lg"
                >
                  Complete
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2 className="text-lg font-bold text-white mb-3">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map(a => {
            const unlocked = user.achievements?.includes(a.id)
            return (
              <div key={a.id} className={`card-bg rounded-xl p-4 text-center transition-all duration-200 ${unlocked ? '' : 'opacity-40'}`}>
                <div className="text-3xl mb-2">{a.icon}</div>
                <p className="text-xs font-bold text-white">{a.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
