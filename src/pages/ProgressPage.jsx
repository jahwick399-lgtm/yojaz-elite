import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

function generateWeekly() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((d, i) => ({
    day: d,
    xp: Math.floor(300 + Math.random() * 700),
    sessions: Math.floor(1 + Math.random() * 3),
    aim: Math.floor(50 + Math.random() * 50),
  }))
}

function generateMonthly() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    xp: Math.floor(200 + Math.random() * 800),
    rank: Math.floor(60 + Math.random() * 40),
  }))
}

const WEEKLY = generateWeekly()
const MONTHLY = generateMonthly()

const RADAR_DATA = [
  { skill: 'Aim', value: 72 },
  { skill: 'Edits', value: 58 },
  { skill: 'Builds', value: 81 },
  { skill: 'Piece Control', value: 65 },
  { skill: 'Positioning', value: 74 },
  { skill: 'Fight IQ', value: 69 },
]

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d1526] border border-cyan-500/20 rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function ProgressPage() {
  const { user } = useAuth()
  const [view, setView] = useState('weekly')

  const data = view === 'weekly' ? WEEKLY : MONTHLY
  const xKey = view === 'weekly' ? 'day' : 'day'

  const totalXP = data.reduce((s, d) => s + d.xp, 0)
  const avgXP = Math.round(totalXP / data.length)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Progress Tracking</h1>
        <p className="text-slate-400 text-sm mt-1">Your performance history and skill breakdown.</p>
      </div>

      {/* Summary stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: user?.xp?.toLocaleString() || '0', icon: Zap, color: 'cyan' },
          { label: 'Level', value: user?.level || 1, icon: TrendingUp, color: 'purple' },
          { label: 'Day Streak', value: `${user?.streak || 0}d`, icon: Calendar, color: 'amber' },
          { label: 'Avg XP/Day', value: avgXP.toLocaleString(), icon: Target, color: 'pink' },
        ].map(({ label, value, icon: Icon, color }) => {
          const cls = {
            cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
            purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
          }[color]
          return (
            <div key={label} className="card-bg rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${cls}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-white">{value}</p>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* View switcher */}
      <div className="flex items-center gap-2">
        {['weekly', 'monthly'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              view === v ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* XP Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card-bg rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-5">XP Earned</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Area type="monotone" dataKey="xp" stroke="#00f5ff" strokeWidth={2} fill="url(#xpGrad)" name="XP" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Radar — skill breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="card-bg rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5">Skill Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar name="Skills" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card-bg rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-5">Skill Ratings</h2>
          <div className="space-y-3">
            {RADAR_DATA.map(({ skill, value }) => (
              <div key={skill}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{skill}</span>
                  <span className="text-cyan-400 font-bold">{value}/100</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
