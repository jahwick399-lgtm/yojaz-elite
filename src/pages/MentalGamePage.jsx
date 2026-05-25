import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Brain, ChevronDown, ChevronUp, Smile } from 'lucide-react'
import toast from 'react-hot-toast'

const MOODS = ['😤', '😞', '😐', '🙂', '😄', '🔥']
const MOOD_LABELS = ['Tilted', 'Frustrated', 'Neutral', 'Good', 'Great', 'On Fire']

const MODULES = [
  {
    id: 'tilt',
    title: 'Tilt Control',
    color: 'red',
    icon: '🧊',
    summary: 'Tilt is the silent rank killer. These tools help you reset fast.',
    tips: [
      { heading: 'The 3-breath reset', body: 'After a bad death, close your eyes and take 3 slow breaths. This physically lowers cortisol and resets your reaction time before the next match loads.' },
      { heading: 'Accept variance', body: 'Not every loss is your fault. Fortnite has RNG in storm placement, loot, and third-parties. Separate what you controlled from what you didn\'t, every single match.' },
      { heading: 'One thing per match', body: 'When tilted, give yourself ONE goal for the next match: "Just make top 10." It removes the pressure of winning and anchors your focus.' },
      { heading: 'Rage = off', body: 'If you feel genuine rage — chest tight, jaw clenched, mouse slammed — stop. One more game at that state averages a 40% worse performance. Log off, come back in 30 min.' },
    ],
  },
  {
    id: 'focus',
    title: 'Focus Routines',
    color: 'cyan',
    icon: '🎯',
    summary: 'Peak focus doesn\'t happen by accident. Build a pre-session ritual.',
    tips: [
      { heading: 'Screen off 10 minutes before', body: 'Social media and notifications keep your brain in a scattered, reactive mode. Give it 10 minutes of nothing before queuing. You\'ll feel the difference.' },
      { heading: 'Define your intention', body: 'Write or say one sentence: "Today I\'m working on [X]." This primes your brain to notice when you deviate and self-correct during matches.' },
      { heading: 'Creative warm-up first', body: 'Spend 10-15 minutes in Creative doing muscle-memory drills before ranked. Your mechanics will be sharper and decision-making faster in early fights.' },
      { heading: 'Limit session length', body: 'Focus degrades sharply after 2 hours. Shorter, intentional sessions beat 5-hour grinds where you coast on autopilot for the last 3.' },
    ],
  },
  {
    id: 'warmup',
    title: 'Warm-Up Rituals',
    color: 'amber',
    icon: '🔥',
    summary: 'Cold hands and slow aim cost you early fights. Warm up right.',
    tips: [
      { heading: 'The 15-minute rule', body: 'Always spend at least 15 minutes in a Creative aim map or edit course before ranked. Your neural pathways need warmup the same way muscles do.' },
      { heading: 'Movement before mechanics', body: 'Start with movement — sprinting, jumping, vaulting. Get your spatial awareness online before adding complex mechanics on top of it.' },
      { heading: 'Aim for consistency, not speed', body: 'During warm-up, aim for 100% accuracy at a comfortable speed rather than going fast and missing. Speed comes from accuracy becoming automatic.' },
      { heading: 'Review one recent VOD', body: 'Spend 5 minutes watching one clip from your last session. Your brain encodes patterns passively — this sets up smarter decisions in today\'s matches.' },
    ],
  },
  {
    id: 'lossstreak',
    title: 'Loss Streak Recovery',
    color: 'purple',
    icon: '📈',
    summary: 'Loss streaks feel like spirals. They\'re patterns you can break.',
    tips: [
      { heading: 'Recognize the spiral early', body: 'Two losses in a row where you felt out of control? That\'s your signal. Don\'t "one more game" yourself into five losses. Step back now.' },
      { heading: 'Drop rank pressure', body: 'Temporarily stop watching your rank counter. Play "to improve" not "to rank up." Counterintuitively, this usually accelerates rank gains because you make better decisions.' },
      { heading: 'Change the lobby size', body: 'If ranked is spiraling, switch to zero-build, duos, or squads for a match or two. A change of context resets your mental patterns without losing ranked LP.' },
      { heading: 'Hydration and posture', body: 'During a loss streak, check the basics: When did you last drink water? Are you slouching? Physical state directly affects reaction time and emotional regulation.' },
    ],
  },
]

const COLOR_MAP = {
  red: 'text-red-400 bg-red-500/10 border-red-500/30',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
}

function today() { return new Date().toISOString().split('T')[0] }

export default function MentalGamePage() {
  const { user } = useAuth()
  const key = `yojaz_mood_${user?.id}`
  const [moodLog, setMoodLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  })
  const [todayMood, setTodayMood] = useState(() => {
    try {
      const log = JSON.parse(localStorage.getItem(key) || '[]')
      return log.find(m => m.date === today())?.mood ?? null
    } catch { return null }
  })
  const [expanded, setExpanded] = useState(null)

  const logMood = (idx) => {
    const entry = { date: today(), mood: idx, ts: Date.now() }
    setTodayMood(idx)
    const next = [entry, ...moodLog.filter(m => m.date !== today())]
    setMoodLog(next)
    localStorage.setItem(key, JSON.stringify(next))
    toast.success(`Mood logged: ${MOOD_LABELS[idx]}. Let\'s get to work.`)
  }

  const last7 = moodLog.slice(0, 7)
  const avgMood = last7.length ? (last7.reduce((a, m) => a + m.mood, 0) / last7.length).toFixed(1) : null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Brain size={24} className="text-purple-400" /> Mental Game
        </h1>
        <p className="text-slate-400 text-sm mt-1">Mindset is the most underrated mechanic. Train it like everything else.</p>
      </div>

      {/* Mood check-in */}
      <div className="card-bg rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Smile size={18} className="text-cyan-400" />
          <h2 className="font-bold text-white">Pre-Session Mood Check-In</h2>
          {avgMood && (
            <span className="ml-auto text-xs text-slate-500">7-session avg: {MOODS[Math.round(avgMood)]} {avgMood}</span>
          )}
        </div>
        <p className="text-sm text-slate-400 mb-4">How are you feeling going into this session?</p>
        <div className="flex gap-3 flex-wrap">
          {MOODS.map((m, i) => (
            <button key={i} onClick={() => logMood(i)}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all ${todayMood === i ? 'bg-purple-500/20 ring-1 ring-purple-500/40' : 'hover:bg-white/5'}`}>
              <span className="text-3xl">{m}</span>
              <span className="text-xs text-slate-400">{MOOD_LABELS[i]}</span>
            </button>
          ))}
        </div>
        {todayMood !== null && (
          <p className="text-xs text-emerald-400 mt-3">Mood logged for today. Good self-awareness is the first step.</p>
        )}
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {MODULES.map(mod => {
          const isOpen = expanded === mod.id
          const cls = COLOR_MAP[mod.color]
          return (
            <div key={mod.id} className="card-bg rounded-2xl overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : mod.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-colors">
                <span className="text-2xl">{mod.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-white">{mod.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{mod.summary}</p>
                </div>
                {isOpen ? <ChevronUp size={18} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-500 flex-shrink-0" />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-white/5">
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mod.tips.map((tip, i) => (
                        <div key={i} className={`rounded-xl p-4 border ${cls}`}>
                          <p className="text-sm font-bold mb-1">{tip.heading}</p>
                          <p className="text-xs text-slate-400 leading-relaxed">{tip.body}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
