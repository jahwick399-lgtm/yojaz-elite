import { useState } from 'react'
import { motion } from 'framer-motion'
import { Swords, Calendar, CheckCircle, Circle } from 'lucide-react'
import toast from 'react-hot-toast'

const RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'Champion', 'Unreal']
const FOCUS_AREAS = ['Zone Reads', 'End-Game Mechanics', 'Box Fighting', 'Mental Prep', 'Rotations', 'High Ground']

const PLANS = {
  'Zone Reads': {
    day1: { title: 'Zone Fundamentals', tasks: ['Study the storm circle patterns on 3 different map locations', 'Play 5 matches prioritising central positioning only', 'Log which zones you were caught in and why', 'Watch 1 pro player VOD focused only on their rotation decisions'] },
    day2: { title: 'Predictive Rotation Practice', tasks: ['Rotate ahead of zone every match — no storm damage allowed', 'Identify 2 "death zones" on the current map and avoid them', 'Practice storm surfing into position in 3 matches', 'Analyse one match VOD for zone decision mistakes'] },
    day3: { title: 'Simulation & Mental Prep', tasks: ['Play with tournament mindset: placement > kills', 'Simulate your zone plan: write out your intended first 3 rotations before queueing', '30-minute creative warm-up, then 3 ranked matches', 'Shut down 1 hour before tournament. Do breathing exercises and sleep 8 hours'] },
  },
  'End-Game Mechanics': {
    day1: { title: 'Mechanics Audit', tasks: ['Do 30 minutes of box fighting in creative', 'Record one ranked game and count how many times you lost high ground', 'Practice turtle/pyramid rotation builds for 15 minutes', 'Identify your 2 weakest mechanics from today'] },
    day2: { title: 'Targeted Drill Day', tasks: ['Drill your 2 weakest mechanics from yesterday for 45 minutes', 'Play 5 ranked matches focusing only on your weakest mechanic', 'Practice cone + ramp combinations under pressure', 'Review one pro player clip of an end-game fight'] },
    day3: { title: 'Simulation & Reset', tasks: ['2 hours of ranked play at tournament pace', '30-minute mechanics warm-up before tournament day', 'Get 8 hours sleep', 'No social media or news the morning of tournament — protect your mental state'] },
  },
  'Box Fighting': {
    day1: { title: 'Fundamentals Day', tasks: ['1 hour box fight 1v1 practice in creative', 'Focus: pre-aim entry, first shot accuracy', 'Play 5 ranked matches — only engage in box fights, disengage from open fights', 'Count your win rate in box fights today'] },
    day2: { title: 'Adaptation Practice', tasks: ['Practice double-edit counters for 30 minutes', 'Play 5 ranked matches varying your box fight approach each game', 'Record a game and count how many box fights you started vs finished', 'Drill the opponent-reads: when they side-edit vs floor-edit'] },
    day3: { title: 'Confidence Lock-In', tasks: ['Light 30-minute box fight warm-up', '3 ranked matches — play loose, trust your drills', 'Visualise winning 3 box fights before tournament queues', 'Lock in mechanics with intention, not pressure'] },
  },
  'Mental Prep': {
    day1: { title: 'Self-Assessment', tasks: ['Journal: write down your 3 mental weaknesses', 'Identify what typically tilts you in tournament play', 'Practice tilt-recovery drill: play 3 matches, intentionally play poorly in one, recover mentally in the next', 'Set a realistic tournament goal that isn\'t rank-dependent'] },
    day2: { title: 'Pressure Simulation', tasks: ['Play every ranked match as if it\'s tournament score', 'After each loss, perform the 3-breath reset before the next queue', 'No rage-quitting or closing the game early — finish every match', 'Journal: what triggered tilt today? What helped you recover?'] },
    day3: { title: 'Pre-Tournament Ritual', tasks: ['Light warm-up only — 30 minutes', 'Set your intention for the tournament: one sentence', 'Eat a real meal 2 hours before', 'No ranked games on tournament day before the event starts'] },
  },
  'Rotations': {
    day1: { title: 'Rotation Mapping', tasks: ['Study the map: identify 5 strong early-rotate positions', 'Play 5 matches with a single rule: rotate before zone hits 50%', 'Track how often early rotation gives you a positioning advantage', 'Log which drop locations produce the cleanest rotate paths'] },
    day2: { title: 'Speed and Stealth', tasks: ['Practice low-profile rotations (no big builds) in 3 matches', 'Use audio cues to time rotations around enemy gunfights', 'Challenge: make top 10 without being shot at during a rotate', 'Review one rotation where you got caught and plan an alternative'] },
    day3: { title: 'Tournament Simulate', tasks: ['3 ranked matches using your practiced rotate style', 'Write your tournament rotation plan: drop → rotate 1 → rotate 2 → final zone', 'Trust the plan in tournament — stick to your zones', 'Early night. Mental reset.'] },
  },
  'High Ground': {
    day1: { title: 'High Ground Fundamentals', tasks: ['Practice 90s and ramp rushes in creative for 30 minutes', 'Play 5 matches with a rule: always attempt to take height before engaging', 'Count how often you hold height vs lose it', 'Study: when is it NOT worth fighting for height?'] },
    day2: { title: 'High Ground Retakes', tasks: ['Drill high-ground retake sequences in creative (cone, pyramid, switch)', '5 ranked matches: if you lose height, attempt retake every time', 'Practice the high-ground to edit-peek combo', 'Identify which opponents adapt best to height and why'] },
    day3: { title: 'Lock In', tasks: ['30-minute warm-up: height control drills', '2 ranked matches at tournament pace', 'Visualise taking and holding height in final zones', 'Rest. Trust the work.'] },
  },
}

export default function TournamentPrepPage() {
  const [form, setForm] = useState({ date: '', rank: 'Diamond', focus: 'Zone Reads' })
  const [plan, setPlan] = useState(null)
  const [checked, setChecked] = useState({})

  const generate = () => {
    if (!form.date) { toast.error('Pick your tournament date.'); return }
    const dayPlan = PLANS[form.focus]
    if (!dayPlan) { toast.error('No plan for that focus.'); return }
    setPlan({ ...form, days: dayPlan })
    setChecked({})
    toast.success('3-day plan generated!')
  }

  const toggle = (day, i) => {
    const k = `${day}_${i}`
    setChecked(c => ({ ...c, [k]: !c[k] }))
  }

  const tournamentDate = plan?.date ? new Date(plan.date) : null
  const daysUntil = tournamentDate ? Math.ceil((tournamentDate - new Date()) / (1000 * 60 * 60 * 24)) : null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Swords size={24} className="text-pink-400" /> Tournament Prep Mode
        </h1>
        <p className="text-slate-400 text-sm mt-1">Get a focused 3-day training plan before your next tournament.</p>
      </div>

      {/* Setup */}
      <div className="card-bg rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-white mb-4">Set Up Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tournament Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="input-dark rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Your Rank</label>
            <select value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))}
              className="input-dark rounded-lg px-3 py-2.5 text-sm">
              {RANKS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Primary Focus</label>
            <select value={form.focus} onChange={e => setForm(f => ({ ...f, focus: e.target.value }))}
              className="input-dark rounded-lg px-3 py-2.5 text-sm">
              {FOCUS_AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <button onClick={generate} className="btn-primary px-6 py-2.5 rounded-xl text-sm">Generate 3-Day Plan</button>
      </div>

      {/* Plan */}
      {plan && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-5">
            <Calendar size={18} className="text-pink-400" />
            <div>
              <span className="text-white font-bold">{plan.focus}</span>
              <span className="text-slate-400 text-sm ml-2">— {plan.rank} level plan</span>
            </div>
            {daysUntil !== null && (
              <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {daysUntil > 0 ? `${daysUntil} days to go` : daysUntil === 0 ? 'Tournament Day!' : 'Past date'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {['day1', 'day2', 'day3'].map((d, di) => {
              const day = plan.days[d]
              const doneCount = day.tasks.filter((_, i) => checked[`${d}_${i}`]).length
              return (
                <div key={d} className="card-bg rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Day {di + 1}</p>
                      <p className="font-bold text-white text-sm">{day.title}</p>
                    </div>
                    <span className="text-xs text-slate-500">{doneCount}/{day.tasks.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {day.tasks.map((task, i) => {
                      const done = checked[`${d}_${i}`]
                      return (
                        <button key={i} onClick={() => toggle(d, i)}
                          className="flex items-start gap-2.5 text-left w-full group">
                          {done
                            ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                            : <Circle size={16} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-0.5 transition-colors" />}
                          <span className={`text-xs leading-relaxed transition-colors ${done ? 'text-slate-600 line-through' : 'text-slate-300'}`}>{task}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
