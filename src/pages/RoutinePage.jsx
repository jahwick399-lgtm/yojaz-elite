import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Dumbbell, Clock, Target, ChevronRight, RotateCcw, Check, Copy, Map as MapIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { pickMap } from '@/data/maps'
import toast from 'react-hot-toast'

// ─── Type display config ─────────────────────────────────────────────────────
const TYPE_COLORS = {
  Warmup:       'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Aim:          'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Editing:      'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Mechanics:    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Building:     'bg-teal-500/20 text-teal-300 border-teal-500/30',
  PieceControl: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Fighting:     'bg-red-500/20 text-red-300 border-red-500/30',
  Ranked:       'bg-pink-500/20 text-pink-300 border-pink-500/30',
  Review:       'bg-slate-500/20 text-slate-300 border-slate-500/30',
}

// ─── Block templates ─────────────────────────────────────────────────────────
// Each block: { type, name, detail, mapCategory, mapSkill }
// mapCategory/mapSkill are used to pull a map from the DB; omit for non-map blocks

const BLOCK_TEMPLATES = {
  warmup: {
    type: 'Warmup',
    name: 'Warm-Up Session',
    detail: 'Light aim training and movement to wake up your mechanics before the real work.',
    mapCategory: 'aim',
  },
  aim: {
    type: 'Aim',
    name: 'Aim Training',
    detail: 'Focused tracking and flick practice to build consistent crosshair placement.',
    mapCategory: 'aim',
  },
  editing: {
    type: 'Editing',
    name: 'Edit Drills',
    detail: 'High-rep edit course runs. Focus on rhythm and resets, not just speed.',
    mapCategory: 'editing',
  },
  mechanics: {
    type: 'Mechanics',
    name: 'Mechanics Practice',
    detail: 'Build fights, 90s, tunnelling, and retakes. Drill the situations that cost you in ranked.',
    mapCategory: 'mechanics',
  },
  building: {
    type: 'Building',
    name: 'Build Training',
    detail: 'Height control, wall replacements, and 90s. Building speed is the foundation of everything.',
    mapCategory: 'building',
  },
  pieceControl: {
    type: 'PieceControl',
    name: 'Piece Control',
    detail: '1v1 box fight practice. Work on aggressive reads, resets, and retake opportunities.',
    mapCategory: 'piece_control',
  },
  fighting: {
    type: 'Fighting',
    name: 'Fight Practice',
    detail: 'Real fight scenarios under pressure. Apply aim and mechanics in dynamic engagements.',
    mapCategory: 'fighting',
  },
  ranked: {
    type: 'Ranked',
    name: 'Ranked Games',
    detail: 'Apply everything learned in real games. Focus on one specific thing to improve each game.',
    mapCategory: 'ranked',
  },
  review: {
    type: 'Review',
    name: 'VOD Review',
    detail: 'Watch your replays. Identify the 1–2 mistakes costing you the most and note them down.',
    mapCategory: null,
  },
  freeplay: {
    type: 'Ranked',
    name: 'Free Play',
    detail: 'Play relaxed games. Have fun, experiment with new strategies and pushing limits.',
    mapCategory: null,
  },
}

// ─── Goal segment weights ─────────────────────────────────────────────────────
// Keys must be block template keys; values are proportion of total time (sum = 1.0)
const GOAL_WEIGHTS = {
  aim: {
    warmup:      0.10,
    aim:         0.45,
    mechanics:   0.15,
    editing:     0.10,
    fighting:    0.10,
    review:      0.10,
  },
  editing: {
    warmup:      0.08,
    aim:         0.10,
    editing:     0.45,
    mechanics:   0.12,
    pieceControl:0.15,
    fighting:    0.05,
    review:      0.05,
  },
  mechanics: {
    warmup:      0.08,
    aim:         0.10,
    editing:     0.20,
    mechanics:   0.35,
    building:    0.15,
    fighting:    0.07,
    review:      0.05,
  },
  building: {
    warmup:      0.08,
    aim:         0.08,
    editing:     0.15,
    building:    0.42,
    mechanics:   0.15,
    fighting:    0.07,
    review:      0.05,
  },
  piece_control: {
    warmup:      0.08,
    aim:         0.12,
    editing:     0.15,
    pieceControl:0.42,
    mechanics:   0.10,
    fighting:    0.08,
    review:      0.05,
  },
  fighting: {
    warmup:      0.08,
    aim:         0.18,
    editing:     0.10,
    mechanics:   0.12,
    fighting:    0.42,
    review:      0.10,
  },
  ranked: {
    warmup:      0.08,
    aim:         0.12,
    editing:     0.08,
    mechanics:   0.10,
    ranked:      0.47,
    review:      0.15,
  },
  earnings: {
    warmup:      0.08,
    aim:         0.10,
    mechanics:   0.08,
    pieceControl:0.12,
    ranked:      0.47,
    review:      0.15,
  },
}

// ─── Minimum times per block type ────────────────────────────────────────────
const MIN_BLOCK = {
  warmup: 5, aim: 5, editing: 5, mechanics: 5, building: 5,
  pieceControl: 5, fighting: 5, ranked: 10, review: 5, freeplay: 5,
}

// ─── Routine generator ────────────────────────────────────────────────────────
function generateRoutine(hours, goal, skill) {
  const totalMin = Math.round(hours * 60)
  const weights = GOAL_WEIGHTS[goal] || GOAL_WEIGHTS.ranked

  // Build raw segments with proportional minutes (rounded to 5)
  const rawSegments = Object.entries(weights).map(([key, weight]) => {
    const raw = totalMin * weight
    const floored = Math.max(MIN_BLOCK[key] || 5, Math.round(raw / 5) * 5)
    return { key, mins: floored }
  })

  // Scale segments to not exceed totalMin
  const rawTotal = rawSegments.reduce((s, r) => s + r.mins, 0)
  let segments = rawSegments.map(r => ({
    ...r,
    mins: Math.max(MIN_BLOCK[r.key] || 5, Math.round((r.mins / rawTotal) * totalMin / 5) * 5),
  }))

  // Final trim: if still over, shrink the biggest non-warmup non-review block
  let sum = segments.reduce((s, r) => s + r.mins, 0)
  let safety = 0
  while (sum > totalMin && safety++ < 20) {
    const biggest = [...segments].sort((a, b) => b.mins - a.mins)[0]
    const idx = segments.findIndex(s => s.key === biggest.key)
    if (segments[idx].mins > (MIN_BLOCK[segments[idx].key] || 5)) {
      segments[idx] = { ...segments[idx], mins: segments[idx].mins - 5 }
    }
    sum = segments.reduce((s, r) => s + r.mins, 0)
  }

  // Build display blocks with map data
  return segments.map(({ key, mins }, i) => {
    const tpl = BLOCK_TEMPLATES[key]
    if (!tpl) return null
    const map = tpl.mapCategory ? pickMap(tpl.mapCategory, skill, i) : null
    return {
      type: tpl.type,
      name: tpl.name,
      duration: `${mins} min`,
      durationMins: mins,
      detail: tpl.detail,
      map: map ? { name: map.name, desc: map.desc } : null,
    }
  }).filter(Boolean)
}

// ─── Sub-component: recommended map name ────────────────────────────────────
function InlineMapName({ map }) {
  const [copied, setCopied] = useState(false)
  if (!map) return null

  const copyName = () => {
    navigator.clipboard.writeText(map.name)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
    toast.success('Map name copied!', { icon: '📋' })
  }

  return (
    <div className="mt-2 bg-white/3 border border-cyan-500/10 rounded-lg px-3 py-2 flex items-start gap-2">
      <MapIcon size={13} className="text-cyan-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Recommended Map</p>
        <p className="text-xs font-semibold text-cyan-300 leading-snug">{map.name}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{map.desc}</p>
      </div>
      <motion.button
        onClick={copyName}
        whileTap={{ scale: 0.93 }}
        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-all duration-200 flex-shrink-0 border ${
          copied
            ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40'
            : 'bg-white/5 text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-400 border-white/10 hover:border-cyan-500/20'
        }`}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? 'Copied!' : 'Copy Name'}
      </motion.button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const GOALS = [
  { value: 'aim',          label: 'Improve Aim' },
  { value: 'editing',      label: 'Faster Edits' },
  { value: 'mechanics',    label: 'Mechanics' },
  { value: 'building',     label: 'Building' },
  { value: 'piece_control',label: 'Piece Control' },
  { value: 'fighting',     label: 'Fighting' },
  { value: 'ranked',       label: 'Rank Up' },
  { value: 'earnings',     label: 'Earnings / Tournaments' },
]

export default function RoutinePage() {
  const { addXP } = useAuth()
  const [routine, setRoutine] = useState(null)
  const [completed, setCompleted] = useState([])
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { hours: 1.5, goal: 'ranked', skill: 'intermediate' },
  })

  const hours = watch('hours')

  const generate = (data) => {
    const plan = generateRoutine(Number(data.hours), data.goal, data.skill)
    setRoutine({ ...data, plan })
    setCompleted([])
  }

  const toggleComplete = (i) => {
    if (completed.includes(i)) {
      setCompleted(p => p.filter(x => x !== i))
    } else {
      setCompleted(p => [...p, i])
      addXP(150)
      toast.success('+150 XP — session complete!', { icon: '⚡' })
    }
  }

  const totalMin = routine?.plan?.reduce((s, b) => s + b.durationMins, 0) || 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Daily Routine Generator</h1>
        <p className="text-slate-400 text-sm mt-1">Get a personalized training plan scaled to your time and goals.</p>
      </div>

      {/* Generator form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-bg rounded-2xl p-6">
        <form onSubmit={handleSubmit(generate)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Hours slider */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Clock size={14} className="inline mr-1.5 text-cyan-400" />
                Time Available:{' '}
                <span className="text-cyan-400 font-bold">
                  {Number(hours) < 1 ? `${Number(hours) * 60 | 0}m` : `${hours}h`}
                </span>
              </label>
              <input
                {...register('hours', { min: 0.5, max: 6 })}
                type="range" min="0.5" max="6" step="0.5"
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>30m</span>
                <span>1h</span>
                <span>2h</span>
                <span>4h</span>
                <span>6h</span>
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Target size={14} className="inline mr-1.5 text-purple-400" />
                Goal
              </label>
              <select
                {...register('goal')}
                className="w-full rounded-xl px-3 py-2.5 text-sm cursor-pointer bg-[#0d1526] text-slate-100 border border-cyan-500/20 focus:outline-none focus:border-cyan-500/50"
              >
                {GOALS.map(g => (
                  <option key={g.value} value={g.value} className="bg-[#0d1526] text-slate-100">
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill level */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Dumbbell size={14} className="inline mr-1.5 text-pink-400" />
                Skill Level
              </label>
              <select
                {...register('skill')}
                className="w-full rounded-xl px-3 py-2.5 text-sm cursor-pointer bg-[#0d1526] text-slate-100 border border-cyan-500/20 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="beginner" className="bg-[#0d1526] text-slate-100">Beginner</option>
                <option value="intermediate" className="bg-[#0d1526] text-slate-100">Intermediate</option>
                <option value="advanced" className="bg-[#0d1526] text-slate-100">Advanced</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm">
            Generate Routine <ChevronRight size={16} />
          </button>
        </form>
      </motion.div>

      {/* Generated plan */}
      <AnimatePresence>
        {routine && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Your Training Plan</h2>
                <p className="text-sm text-slate-400">
                  {totalMin} min total · {routine.plan.length} blocks ·{' '}
                  {GOALS.find(g => g.value === routine.goal)?.label}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{completed.length}/{routine.plan.length} done</span>
                <button
                  onClick={() => { setRoutine(null); setCompleted([]) }}
                  className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${routine.plan.length ? (completed.length / routine.plan.length) * 100 : 0}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
              />
            </div>

            <div className="space-y-3">
              {routine.plan.map((block, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`card-bg rounded-xl p-5 flex items-start gap-4 transition-all duration-200 ${completed.includes(i) ? 'opacity-50' : ''}`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(i)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      completed.includes(i)
                        ? 'border-cyan-400 bg-cyan-400/30'
                        : 'border-slate-600 hover:border-cyan-500'
                    }`}
                  >
                    {completed.includes(i) && <Check size={14} className="text-cyan-400" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[block.type] || TYPE_COLORS.Review}`}>
                        {block.type}
                      </span>
                      <span className="text-xs font-bold text-cyan-400">{block.duration}</span>
                    </div>
                    <p className={`font-semibold text-sm ${completed.includes(i) ? 'line-through text-slate-500' : 'text-white'}`}>
                      {block.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{block.detail}</p>
                    <InlineMapName map={block.map} />
                  </div>
                </motion.div>
              ))}
            </div>

            {completed.length === routine.plan.length && routine.plan.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-bg rounded-2xl p-6 text-center border border-cyan-500/30 glow-cyan"
              >
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-xl font-black text-white">Routine Complete!</h3>
                <p className="text-slate-400 text-sm mt-1">
                  {totalMin} min of focused training done. Consistency builds champions.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
