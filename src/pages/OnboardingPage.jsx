import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Zap, ChevronRight, Check } from 'lucide-react'

const STEPS = [
  {
    id: 'skill',
    title: 'What\'s your current skill level?',
    subtitle: 'Be honest — this helps us calibrate everything for you.',
    type: 'single',
    options: [
      { value: 'bronze', label: 'Bronze', desc: 'Just getting started. Still learning the basics.' },
      { value: 'silver', label: 'Silver', desc: 'Getting consistent. Winning some fights.' },
      { value: 'gold', label: 'Gold', desc: 'Competent player. Can hold your own most matches.' },
      { value: 'platinum', label: 'Platinum', desc: 'Strong mechanics. Inconsistent game sense.' },
      { value: 'diamond', label: 'Diamond', desc: 'High-level player. Focused on small improvements.' },
      { value: 'elite', label: 'Elite', desc: 'Near-peak mechanical skill. Optimising everything.' },
      { value: 'champion', label: 'Champion', desc: 'Tournament-level competitor.' },
      { value: 'unreal', label: 'Unreal', desc: 'Pro-level. Refining edge cases.' },
    ],
  },
  {
    id: 'goals',
    title: 'What are your goals?',
    subtitle: 'Select all that apply.',
    type: 'multi',
    options: [
      { value: 'ranked', label: 'Ranked Push', desc: 'Climb the ranked ladder as high as possible.' },
      { value: 'competitive', label: 'Competitive / Tournaments', desc: 'Cash cups, FNCS, scrims.' },
      { value: 'casual', label: 'Casual Improvement', desc: 'Just want to be better and have more fun.' },
      { value: 'mechanics', label: 'Improve Mechanics', desc: 'Build, edit, and aim mastery.' },
      { value: 'mental', label: 'Mental Game', desc: 'Reduce tilt, play more consistently.' },
      { value: 'content', label: 'Content Creation', desc: 'Clips, streams, highlights.' },
    ],
  },
  {
    id: 'hours',
    title: 'How many hours per day can you train?',
    subtitle: 'We\'ll build a realistic routine around your schedule.',
    type: 'single',
    options: [
      { value: 'under1', label: 'Under 1 hour', desc: 'Short and focused sessions.' },
      { value: '1to2', label: '1–2 hours', desc: 'Solid daily training window.' },
      { value: '2to4', label: '2–4 hours', desc: 'Serious grind mode.' },
      { value: '4plus', label: '4+ hours', desc: 'Full commitment.' },
    ],
  },
  {
    id: 'weaknesses',
    title: 'Where do you struggle most?',
    subtitle: 'Select your 3 weakest areas — we\'ll prioritise these.',
    type: 'multi',
    options: [
      { value: 'building', label: 'Building', desc: 'Speed, placement, reactivity.' },
      { value: 'editing', label: 'Editing', desc: 'Speed, accuracy, reset consistency.' },
      { value: 'aim', label: 'Aim', desc: 'Tracking, flicking, consistency.' },
      { value: 'gamesense', label: 'Game Sense', desc: 'Decision making, reads, awareness.' },
      { value: 'zone', label: 'Zone Reads', desc: 'Rotations, storm timing, positioning.' },
      { value: 'mental', label: 'Mental Resilience', desc: 'Tilt, consistency, pressure.' },
      { value: 'endgame', label: 'End-Game', desc: 'Final circle, high-ground, closing out.' },
      { value: 'boxfight', label: 'Box Fighting', desc: 'Entry fights, trades, reads.' },
    ],
  },
]

const TIER_COLOR = {
  bronze: 'border-orange-500/50 bg-orange-500/10 text-orange-300',
  silver: 'border-slate-400/50 bg-slate-400/10 text-slate-300',
  gold: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
  platinum: 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300',
  diamond: 'border-blue-400/50 bg-blue-400/10 text-blue-300',
  elite: 'border-purple-400/50 bg-purple-400/10 text-purple-300',
  champion: 'border-pink-400/50 bg-pink-400/10 text-pink-300',
  unreal: 'border-amber-300/50 bg-amber-300/10 text-amber-200',
}

export default function OnboardingPage() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ skill: '', goals: [], hours: '', weaknesses: [] })

  const current = STEPS[step]
  const isMulti = current.type === 'multi'

  const toggle = (val) => {
    if (!isMulti) {
      setAnswers(a => ({ ...a, [current.id]: val }))
    } else {
      setAnswers(a => {
        const arr = a[current.id]
        return { ...a, [current.id]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }
      })
    }
  }

  const selected = (val) => isMulti ? answers[current.id].includes(val) : answers[current.id] === val

  const canNext = isMulti ? answers[current.id].length > 0 : !!answers[current.id]

  const next = () => {
    if (step < STEPS.length - 1) { setStep(s => s + 1); return }
    updateUser({ onboarding: answers, onboardingDone: true })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap size={20} className="text-black" />
            </div>
            <span className="font-black text-xl gradient-text">YoJaz Elite</span>
          </div>
          <h1 className="text-3xl font-black text-white">Let's set you up</h1>
          <p className="text-slate-400 mt-2 text-sm">4 quick questions to personalise your experience</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-white/10'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card-bg rounded-2xl p-8">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Step {step + 1} of {STEPS.length}</p>
              <h2 className="text-xl font-black text-white mb-1">{current.title}</h2>
              <p className="text-slate-400 text-sm mb-6">{current.subtitle}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.options.map(opt => {
                  const isSelected = selected(opt.value)
                  const tierCls = TIER_COLOR[opt.value] || ''
                  return (
                    <button key={opt.value} onClick={() => toggle(opt.value)}
                      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? `${tierCls || 'border-cyan-500/50 bg-cyan-500/10'} ring-1 ring-cyan-500/30`
                          : 'border-white/10 hover:border-white/20 hover:bg-white/3'
                      }`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isSelected ? 'bg-cyan-400' : 'border border-white/20'}`}>
                        {isSelected && <Check size={12} className="text-black" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{opt.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-between items-center mt-8">
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                  className="text-sm text-slate-500 hover:text-white disabled:opacity-30 transition-colors">
                  Back
                </button>
                <button onClick={next} disabled={!canNext}
                  className="btn-primary px-7 py-3 rounded-xl flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  {step === STEPS.length - 1 ? 'Get Started' : 'Next'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
