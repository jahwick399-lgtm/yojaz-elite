import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { TrendingUp, Target, Plus, Trash2, Flag } from 'lucide-react'
import toast from 'react-hot-toast'

const RANKS = [
  'Bronze III', 'Bronze II', 'Bronze I',
  'Silver III', 'Silver II', 'Silver I',
  'Gold III', 'Gold II', 'Gold I',
  'Platinum III', 'Platinum II', 'Platinum I',
  'Diamond III', 'Diamond II', 'Diamond I',
  'Elite', 'Champion', 'Unreal',
]

const RANK_COLOR = {
  Bronze: 'text-orange-400', Silver: 'text-slate-300', Gold: 'text-yellow-400',
  Platinum: 'text-cyan-300', Diamond: 'text-blue-400', Elite: 'text-purple-400',
  Champion: 'text-pink-400', Unreal: 'text-amber-300',
}

function rankColor(rank) {
  const base = rank?.split(' ')[0]
  return RANK_COLOR[base] || 'text-slate-400'
}

function today() { return new Date().toISOString().split('T')[0] }

function projectDate(lpPerGame, lpNeeded) {
  if (lpPerGame <= 0 || lpNeeded <= 0) return null
  const gamesNeeded = Math.ceil(lpNeeded / lpPerGame)
  const d = new Date()
  d.setDate(d.getDate() + Math.ceil(gamesNeeded / 3))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RankedTrackerPage() {
  const { user } = useAuth()
  const key = `yojaz_ranked_${user?.id}`
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || { currentRank: 'Gold I', goalRank: 'Diamond III', sessions: [] } }
    catch { return { currentRank: 'Gold I', goalRank: 'Diamond III', sessions: [] } }
  })
  const [form, setForm] = useState({ date: today(), lp: '', placement: '', notes: '' })
  const [showForm, setShowForm] = useState(false)

  const persist = (next) => {
    setData(next)
    localStorage.setItem(key, JSON.stringify(next))
  }

  const updateGoal = (field, val) => persist({ ...data, [field]: val })

  const addSession = () => {
    if (!form.lp) { toast.error('Enter LP change for this session.'); return }
    const session = { ...form, id: Date.now() }
    persist({ ...data, sessions: [session, ...data.sessions] })
    setForm({ date: today(), lp: '', placement: '', notes: '' })
    setShowForm(false)
    toast.success('Session logged.')
  }

  const remove = (id) => persist({ ...data, sessions: data.sessions.filter(s => s.id !== id) })

  const sessions = data.sessions || []
  const totalLP = sessions.reduce((a, s) => a + (parseFloat(s.lp) || 0), 0)
  const avgLP = sessions.length ? (totalLP / sessions.length).toFixed(1) : null

  const currentIdx = RANKS.indexOf(data.currentRank)
  const goalIdx = RANKS.indexOf(data.goalRank)
  const progressPct = goalIdx > currentIdx ? Math.min(100, (currentIdx / goalIdx) * 100) : 0

  const lpNeeded = (goalIdx - currentIdx) * 100
  const projected = avgLP ? projectDate(parseFloat(avgLP), lpNeeded) : null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <TrendingUp size={24} className="text-cyan-400" /> Ranked Push Tracker
        </h1>
        <p className="text-slate-400 text-sm mt-1">Set your rank goal and track every session toward it.</p>
      </div>

      {/* Goal setup */}
      <div className="card-bg rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Flag size={16} className="text-cyan-400" /> Your Goal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Current Rank</label>
            <select value={data.currentRank} onChange={e => updateGoal('currentRank', e.target.value)}
              className="input-dark rounded-lg px-3 py-2.5 text-sm">
              {RANKS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Rank</label>
            <select value={data.goalRank} onChange={e => updateGoal('goalRank', e.target.value)}
              className="input-dark rounded-lg px-3 py-2.5 text-sm">
              {RANKS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className={`font-bold ${rankColor(data.currentRank)}`}>{data.currentRank}</span>
            <span className={`font-bold ${rankColor(data.goalRank)}`}>{data.goalRank}</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-slate-500">Sessions Logged</p>
            <p className="text-lg font-black text-white">{sessions.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Avg LP/Game</p>
            <p className={`text-lg font-black ${avgLP > 0 ? 'text-emerald-400' : avgLP < 0 ? 'text-red-400' : 'text-white'}`}>
              {avgLP ? `${avgLP > 0 ? '+' : ''}${avgLP}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Projected Hit</p>
            <p className="text-lg font-black text-cyan-400">{projected || '—'}</p>
          </div>
        </div>
      </div>

      {/* Log session */}
      <div className="mb-6">
        <button onClick={() => setShowForm(v => !v)} className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm">
          <Plus size={16} /> Log Session
        </button>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="card-bg rounded-xl p-5 mt-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">LP Change</label>
                <input type="number" placeholder="+12 or -8" value={form.lp}
                  onChange={e => setForm(f => ({ ...f, lp: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Placement</label>
                <input type="number" min={1} max={100} placeholder="e.g. 3"
                  value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Notes</label>
                <input type="text" placeholder="Optional..." value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addSession} className="btn-primary px-5 py-2 rounded-lg text-sm">Save</button>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-sm">Cancel</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Session history */}
      {sessions.length === 0 ? (
        <div className="card-bg rounded-2xl p-10 text-center">
          <Target size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No sessions logged yet. Start tracking your grind.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Session History</h2>
          {sessions.map(s => {
            const lp = parseFloat(s.lp)
            return (
              <div key={s.id} className="card-bg rounded-xl px-4 py-3 flex items-center gap-4">
                <span className={`text-sm font-black w-14 text-center ${lp > 0 ? 'text-emerald-400' : lp < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {lp > 0 ? '+' : ''}{s.lp} LP
                </span>
                <span className="text-xs text-slate-500">{s.date}</span>
                {s.placement && <span className="text-xs text-slate-400">#{s.placement}</span>}
                {s.notes && <span className="text-xs text-slate-500 flex-1 truncate">{s.notes}</span>}
                <button onClick={() => remove(s.id)} className="ml-auto text-slate-600 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
