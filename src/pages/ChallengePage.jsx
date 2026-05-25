import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Target, Zap, Trophy, CheckCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'Champion', 'Unreal']

const CHALLENGES = {
  Bronze: [
    { task: 'Land at a named location and loot a full loadout before moving', xp: 100 },
    { task: 'Get 3 eliminations in a single match using only shotguns', xp: 150 },
    { task: 'Build a 1×1 box and hold it for at least 2 minutes mid-game', xp: 120 },
    { task: 'Survive into the top 20 players in 2 matches', xp: 100 },
    { task: 'Deal 500 damage without using any shield potions', xp: 130 },
    { task: 'Successfully rotate to final zone without taking storm damage twice', xp: 110 },
    { task: 'Practice editing 50 tiles in Creative before queuing ranked', xp: 90 },
  ],
  Silver: [
    { task: 'Get 5 eliminations in a single match', xp: 200 },
    { task: 'Win a late-game box fight against an opponent who shoots first', xp: 250 },
    { task: 'Survive top 10 in 3 consecutive ranked matches', xp: 220 },
    { task: 'Land at a hot-drop and get 2+ eliminations before zone moves', xp: 180 },
    { task: 'Rotate using only natural cover (no building) in a full match', xp: 200 },
    { task: 'Deal 1,000 total damage across two ranked matches', xp: 210 },
    { task: 'Complete a Creative aim-training map for 20 minutes straight', xp: 150 },
  ],
  Gold: [
    { task: 'Win a match without taking damage in the final 3 zones', xp: 350 },
    { task: 'Get a placement of 3rd or better in 3 ranked matches today', xp: 300 },
    { task: 'Eliminate an opponent using only a sniper from 150+ metres', xp: 320 },
    { task: 'Hit 70%+ accuracy in any aim-training session (10 min minimum)', xp: 280 },
    { task: 'Successfully read and rotate ahead of 2 zone collapses mid-match', xp: 310 },
    { task: 'Eliminate 2 opponents from height advantage in the same match', xp: 290 },
    { task: 'Solo vs Duo: eliminate a pair within 10 seconds of engaging', xp: 400 },
  ],
  Platinum: [
    { task: 'Achieve a Victory Royale today', xp: 500 },
    { task: 'Win 3 box fights in a row against real opponents mid-match', xp: 420 },
    { task: 'Hold high ground in the final circle and eliminate 2 from above', xp: 450 },
    { task: 'Complete a match with 8+ eliminations', xp: 480 },
    { task: 'Rotate into final 5 with full materials and full shield', xp: 400 },
    { task: 'Eliminate an opponent who has 300+ materials stockpiled', xp: 440 },
    { task: 'Drop 15 eliminations across a 3-game session', xp: 460 },
  ],
  Diamond: [
    { task: 'Win 2 ranked matches today', xp: 600 },
    { task: 'Achieve a 10-kill game', xp: 580 },
    { task: 'Win a match using exclusively mechanical outplay (no third-partying)', xp: 650 },
    { task: 'Practice zone-read Creative map for 30 minutes and identify 3 patterns', xp: 500 },
    { task: 'Go 3 for 3 in high-ground retakes in a single match', xp: 570 },
    { task: 'End a match with zero materials taken from builds (full loot only)', xp: 540 },
    { task: 'Eliminate an opponent, immediately rotate 200m, and get another elimination', xp: 620 },
  ],
  Elite: [
    { task: 'Drop 20 eliminations across a 3-game session', xp: 750 },
    { task: 'Win back-to-back ranked matches', xp: 800 },
    { task: 'Achieve a 15+ kill match', xp: 850 },
    { task: 'Win a match with zero builds placed (zero-build challenge)', xp: 700 },
    { task: 'Go an entire ranked session without placing outside top 5', xp: 780 },
    { task: 'Outright control final zone positioning in 2 matches via aggressive rotates', xp: 760 },
    { task: 'Complete a 1-hour creative mechanical drill session and log your improvement', xp: 680 },
  ],
  Champion: [
    { task: 'Win 3 ranked matches in a single session', xp: 1000 },
    { task: 'Achieve a 20-kill game', xp: 1200 },
    { task: 'Hit rank #1 in your lobby leaderboard at end of match twice', xp: 1100 },
    { task: 'Go a full session without a single death in the first 3 zones', xp: 950 },
    { task: 'Coach a lower-ranked friend for 30 minutes and record what you taught', xp: 800 },
    { task: 'Win a tournament game (cash cup, etc.) or place top 10%', xp: 1300 },
    { task: 'Drop 30 kills across a 3-game session', xp: 1150 },
  ],
  Unreal: [
    { task: 'Hit a personal placement PR in ranked today', xp: 1500 },
    { task: 'Go 5-0 in scrimmage or tournament lobbies', xp: 1800 },
    { task: 'Record and review VOD footage identifying 5 positioning mistakes', xp: 1200 },
    { task: 'Achieve a 25-kill ranked game', xp: 2000 },
    { task: 'Run a full team scrim session as IGL and close out a win', xp: 1600 },
    { task: 'Stream a full ranked session and maintain positive mental commentary', xp: 1400 },
    { task: 'Create and share a teaching clip breaking down an advanced mechanic', xp: 1300 },
  ],
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function getDailyChallenge(rank) {
  const challenges = CHALLENGES[rank] || CHALLENGES.Bronze
  const day = new Date().getDate()
  return challenges[day % challenges.length]
}

export default function ChallengePage() {
  const { user, addXP } = useAuth()
  const [rank, setRank] = useState(() => localStorage.getItem('yojaz_rank') || 'Gold')
  const [completed, setCompleted] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('yojaz_challenges') || '{}')
      return stored[todayKey()] || []
    } catch { return [] }
  })

  const challenge = getDailyChallenge(rank)
  const challengeId = `${todayKey()}_${rank}`
  const isDone = completed.includes(challengeId)

  useEffect(() => {
    localStorage.setItem('yojaz_rank', rank)
  }, [rank])

  const handleComplete = () => {
    if (isDone) return
    const next = [...completed, challengeId]
    setCompleted(next)
    const stored = JSON.parse(localStorage.getItem('yojaz_challenges') || '{}')
    stored[todayKey()] = next
    localStorage.setItem('yojaz_challenges', JSON.stringify(stored))
    addXP(challenge.xp)
    toast.success(`+${challenge.xp} XP earned! Keep grinding.`)
  }

  const rankColor = {
    Bronze: 'text-orange-400', Silver: 'text-slate-300', Gold: 'text-yellow-400',
    Platinum: 'text-cyan-300', Diamond: 'text-blue-400', Elite: 'text-purple-400',
    Champion: 'text-pink-400', Unreal: 'text-amber-300',
  }[rank] || 'text-cyan-400'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Target size={24} className="text-cyan-400" /> Challenge of the Day
        </h1>
        <p className="text-slate-400 text-sm mt-1">Resets at midnight. Complete it to earn XP.</p>
      </div>

      {/* Rank selector */}
      <div className="card-bg rounded-xl p-5 mb-6">
        <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Your Rank</label>
        <select
          value={rank}
          onChange={e => setRank(e.target.value)}
          className="input-dark rounded-lg px-4 py-2.5 text-sm"
        >
          {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <p className="text-xs text-slate-500 mt-2">Challenges scale in difficulty based on your rank.</p>
      </div>

      {/* Challenge card */}
      <motion.div
        key={rank}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card-bg rounded-2xl p-8 mb-6 text-center border-2 ${isDone ? 'border-emerald-500/40' : 'border-cyan-500/20'}`}
      >
        <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 ${rankColor}`}>
          <Trophy size={14} /> {rank} Challenge
        </div>
        <p className="text-xl font-bold text-white leading-relaxed mb-6 max-w-xl mx-auto">
          {challenge.task}
        </p>
        <div className="flex items-center justify-center gap-2 text-cyan-400 font-black text-2xl mb-8">
          <Zap size={20} /> +{challenge.xp} XP
        </div>

        {isDone ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-lg">
            <CheckCircle size={22} /> Completed! Come back tomorrow for a new challenge.
          </div>
        ) : (
          <button onClick={handleComplete} className="btn-primary px-10 py-3 rounded-xl font-bold">
            Mark as Complete
          </button>
        )}
      </motion.div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: RefreshCw, label: 'Daily Reset', desc: 'New challenge every midnight' },
          { icon: Zap, label: 'XP Reward', desc: 'Higher rank = bigger XP payout' },
          { icon: Trophy, label: 'Rank-Based', desc: 'Difficulty matches your skill level' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="card-bg rounded-xl p-4 flex gap-3 items-start">
            <Icon size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
