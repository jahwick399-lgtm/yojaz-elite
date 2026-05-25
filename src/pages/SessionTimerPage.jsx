import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Timer, Play, Pause, RotateCcw, Settings, Zap, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const MODES = [
  { id: 'focus', label: 'Focus', defaultMins: 25, color: 'cyan' },
  { id: 'short', label: 'Short Break', defaultMins: 5, color: 'emerald' },
  { id: 'long', label: 'Long Break', defaultMins: 15, color: 'purple' },
]

function todayKey() { return new Date().toISOString().split('T')[0] }

export default function SessionTimerPage() {
  const { addXP } = useAuth()
  const [modeIdx, setModeIdx] = useState(0)
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('yojaz_timer_settings') || 'null') || { focus: 25, short: 5, long: 15 } }
    catch { return { focus: 25, short: 5, long: 15 } }
  })
  const [showSettings, setShowSettings] = useState(false)
  const [draft, setDraft] = useState(settings)
  const mode = MODES[modeIdx]
  const totalSecs = settings[mode.id] * 60
  const [secs, setSecs] = useState(totalSecs)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('yojaz_sessions') || '[]') } catch { return [] }
  })
  const intervalRef = useRef(null)

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setSecs(settings[MODES[modeIdx].id] * 60)
  }, [stop, settings, modeIdx])

  useEffect(() => { reset() }, [modeIdx, settings]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          const isSession = MODES[modeIdx].id === 'focus'
          if (isSession) {
            const entry = { date: todayKey(), mins: settings.focus, ts: Date.now() }
            setSessions(prev => {
              const next = [entry, ...prev].slice(0, 50)
              localStorage.setItem('yojaz_sessions', JSON.stringify(next))
              return next
            })
            addXP(settings.focus * 5)
            toast.success(`Session done! +${settings.focus * 5} XP earned.`)
          } else {
            toast.success('Break over! Ready to focus again.')
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, modeIdx, settings, addXP])

  const mins = String(Math.floor(secs / 60)).padStart(2, '0')
  const sec = String(secs % 60).padStart(2, '0')
  const progress = totalSecs > 0 ? (1 - secs / totalSecs) * 100 : 0

  const colors = { cyan: '#00f5ff', emerald: '#10b981', purple: '#a855f7' }
  const color = colors[mode.color]

  const todaySessions = sessions.filter(s => s.date === todayKey())
  const todayMins = todaySessions.reduce((a, s) => a + s.mins, 0)

  const saveSettings = () => {
    setSettings(draft)
    localStorage.setItem('yojaz_timer_settings', JSON.stringify(draft))
    setShowSettings(false)
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Timer size={24} className="text-cyan-400" /> Session Timer
          </h1>
          <p className="text-slate-400 text-sm mt-1">Pomodoro-style focus timer. Earn XP for every session completed.</p>
        </div>
        <button onClick={() => setShowSettings(v => !v)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
          <Settings size={20} />
        </button>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="card-bg rounded-xl p-5 mb-6">
            <h3 className="text-sm font-bold text-white mb-4">Timer Settings (minutes)</h3>
            <div className="grid grid-cols-3 gap-4">
              {MODES.map(m => (
                <div key={m.id}>
                  <label className="text-xs text-slate-400 block mb-1">{m.label}</label>
                  <input type="number" min={1} max={120} value={draft[m.id]}
                    onChange={e => setDraft(d => ({ ...d, [m.id]: Number(e.target.value) }))}
                    className="input-dark rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={saveSettings} className="btn-primary px-5 py-2 rounded-lg text-sm">Save</button>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white text-sm">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-8">
        {MODES.map((m, i) => (
          <button key={m.id} onClick={() => { stop(); setModeIdx(i) }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${modeIdx === i ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <motion.circle cx="100" cy="100" r="90" fill="none" stroke={color} strokeWidth="10"
              strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 90}`}
              animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100) }}
              transition={{ duration: 0.5 }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white tabular-nums">{mins}:{sec}</span>
            <span className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{mode.label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button onClick={reset} className="p-3 rounded-full text-slate-400 hover:text-white hover:bg-white/5">
          <RotateCcw size={20} />
        </button>
        <button onClick={() => setRunning(r => !r)}
          className="btn-primary w-16 h-16 rounded-full flex items-center justify-center">
          {running ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <div className="w-11" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-bg rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Today's Sessions</p>
          <p className="text-2xl font-black text-white">{todaySessions.length}</p>
        </div>
        <div className="card-bg rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Focus Time Today</p>
          <p className="text-2xl font-black text-white">{todayMins}m</p>
        </div>
        <div className="card-bg rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">XP This Session</p>
          <p className="text-2xl font-black text-cyan-400">{todaySessions.length * settings.focus * 5}</p>
        </div>
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Sessions</h2>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s, i) => (
              <div key={i} className="card-bg rounded-lg px-4 py-3 flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-white">{s.mins}-minute focus session</span>
                <span className="ml-auto text-xs text-slate-500">{s.date}</span>
                <span className="text-xs text-cyan-400 font-bold flex items-center gap-1"><Zap size={10} />+{s.mins * 5}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
