import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, Plus, X, Star, TrendingUp, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const MOODS = ['😤', '😐', '🙂', '😄', '🔥']
const MOOD_LABELS = ['Tilted', 'Meh', 'Good', 'Great', 'On Fire']

function today() { return new Date().toISOString().split('T')[0] }

export default function JournalPage() {
  const { user } = useAuth()
  const storageKey = `yojaz_journal_${user?.id}`
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') } catch { return [] }
  })
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [form, setForm] = useState({ date: today(), hours: '', mood: 2, worked_on: '', goals: '', notes: '' })

  const save = () => {
    if (!form.worked_on.trim()) { toast.error('Add what you worked on.'); return }
    const entry = { ...form, id: Date.now(), createdAt: new Date().toISOString() }
    const next = [entry, ...entries]
    setEntries(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
    setShowForm(false)
    setForm({ date: today(), hours: '', mood: 2, worked_on: '', goals: '', notes: '' })
    toast.success('Journal entry saved.')
  }

  const remove = (id) => {
    const next = entries.filter(e => e.id !== id)
    setEntries(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  // Weekly summary (last 7 entries)
  const recent = entries.slice(0, 7)
  const avgMood = recent.length ? (recent.reduce((a, e) => a + e.mood, 0) / recent.length).toFixed(1) : null
  const totalHours = recent.reduce((a, e) => a + (parseFloat(e.hours) || 0), 0).toFixed(1)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BookOpen size={24} className="text-cyan-400" /> Session Journal
          </h1>
          <p className="text-slate-400 text-sm mt-1">Log how each session felt, what you worked on, and your next goals.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm">
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Summary */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card-bg rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Entries</p>
            <p className="text-2xl font-black text-white">{entries.length}</p>
          </div>
          <div className="card-bg rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Mood (7 sessions)</p>
            <p className="text-2xl font-black text-white">{avgMood ? `${MOODS[Math.round(avgMood)]} ${avgMood}` : '—'}</p>
          </div>
          <div className="card-bg rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Hours Logged (7 sessions)</p>
            <p className="text-2xl font-black text-white">{totalHours}h</p>
          </div>
        </div>
      )}

      {/* New entry form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card-bg rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">New Journal Entry</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Hours Played</label>
                <input type="number" min={0} max={24} step={0.5} placeholder="e.g. 2.5"
                  value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2.5 text-sm" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-400 block mb-2">How did you feel?</label>
              <div className="flex gap-3">
                {MOODS.map((m, i) => (
                  <button key={i} onClick={() => setForm(f => ({ ...f, mood: i }))}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${form.mood === i ? 'bg-cyan-500/20 ring-1 ring-cyan-500/40' : 'hover:bg-white/5'}`}>
                    <span className="text-2xl">{m}</span>
                    <span className="text-xs text-slate-400">{MOOD_LABELS[i]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">What did you work on?</label>
                <textarea rows={2} placeholder="e.g. Box fighting, zone rotations, editing speed..."
                  value={form.worked_on} onChange={e => setForm(f => ({ ...f, worked_on: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2.5 text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Goals for next session</label>
                <textarea rows={2} placeholder="e.g. Work on high-ground retakes, play more patiently..."
                  value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2.5 text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Additional Notes</label>
                <textarea rows={2} placeholder="Anything else you want to remember..."
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2.5 text-sm resize-none" />
              </div>
            </div>

            <button onClick={save} className="btn-primary px-6 py-2.5 rounded-xl text-sm">Save Entry</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="card-bg rounded-2xl p-12 text-center">
          <BookOpen size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No journal entries yet.</p>
          <p className="text-slate-600 text-sm mt-1">Start logging your sessions to track patterns over time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => (
            <div key={e.id} className="card-bg rounded-xl overflow-hidden">
              <button onClick={() => setExpanded(x => x === e.id ? null : e.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/3 transition-colors">
                <span className="text-2xl">{MOODS[e.mood]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{e.date}</p>
                  <p className="text-xs text-slate-400 truncate">{e.worked_on}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {e.hours && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} /> {e.hours}h</span>}
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Star size={10} /> {MOOD_LABELS[e.mood]}</span>
                  {expanded === e.id ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
              </button>
              <AnimatePresence>
                {expanded === e.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-white/5">
                    <div className="p-4 space-y-3">
                      {e.worked_on && <div><p className="text-xs text-slate-500 mb-0.5">Worked On</p><p className="text-sm text-slate-300">{e.worked_on}</p></div>}
                      {e.goals && <div><p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1"><TrendingUp size={10} /> Next Session Goals</p><p className="text-sm text-slate-300">{e.goals}</p></div>}
                      {e.notes && <div><p className="text-xs text-slate-500 mb-0.5">Notes</p><p className="text-sm text-slate-300">{e.notes}</p></div>}
                      <button onClick={() => remove(e.id)} className="text-xs text-red-400/60 hover:text-red-400 mt-2">Delete entry</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
