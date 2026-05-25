import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Newspaper, Crosshair, Wind, Map, Gamepad2, Keyboard } from 'lucide-react'

const LAST_UPDATED = 'May 25, 2026'

const META = {
  weapons: [
    {
      slot: 'AR',
      name: 'Thermal DMR / Striker AR',
      tier: 'S',
      notes: 'Thermal DMR is dominant at range. Striker AR wins mid-range spray fights. Both reward positioning over aggression.',
      controller: 'Lower your look sensitivity for DMR sniping. Pair with a SMG for close range — don\'t rely on DMR inside 30m.',
      kbm: 'Bind ads to a side mouse button for quick scope accuracy. Microadjust with wrist, not elbow, at distance.',
    },
    {
      slot: 'SMG',
      name: 'Submachine Gun (Rapid Fire)',
      tier: 'S',
      notes: 'Best up-close DPS. Shreds through edit fights and box fights when pre-aimed correctly. Must-have in the loadout.',
      controller: 'Enable flick aim assist settings — bump vertical ADS sensitivity to 0.90 for faster upper-body targets.',
      kbm: 'Pre-aim shoulder level before entering any box fight. SMG only rewards you if your crosshair is already on the target.',
    },
    {
      slot: 'Shotgun',
      name: 'Havoc Pump / Heavy Shotgun',
      tier: 'A',
      notes: 'Heavy Shotgun punishes tunnelling opponents. Havoc Pump wins the opener of box fights. One-shot potential at close range.',
      controller: 'Don\'t spray — one shot at a time with quick crosshair reset. Aim for upper chest every time.',
      kbm: 'Flick to head height, not chest. With kbm precision you can consistently hit 60-70% headshot shots at full charge.',
    },
    {
      slot: 'Heals',
      name: 'Medkit + Shield Potion',
      tier: 'A',
      notes: 'Carry 2 medkits and 2 large shields minimum. Do not sacrifice heal slot for extra ammo — you will lose late game.',
      controller: 'Assign heals to face buttons for zero-delay activation mid-box.',
      kbm: 'Assign to 4/5 keys for quick swap without leaving WASD.',
    },
    {
      slot: 'Mobility',
      name: 'Shockwave Hammer / Launch Pad',
      tier: 'A',
      notes: 'Shockwave Hammer is the strongest rotation tool this season. Enables aggressive 3rd party plays and escape routes.',
      controller: 'Shockwave jump timing: hold slightly past the peak of your box bounce for maximum distance.',
      kbm: 'Bind launch pad to a key you can hit instantly — zone reads depend on launch speed.',
    },
  ],
  movement: [
    { tip: 'Sprint-jump into builds', desc: 'Crouch-jump into ramp placements cancels fall damage and reduces your hitbox during aggressive pushes.', controller: true, kbm: true },
    { tip: 'Mantling priority', desc: 'Mantle over obstacles without jumping — it\'s faster and keeps your aim active. Prioritise mantle routes in zone.', controller: true, kbm: true },
    { tip: 'Slide-cancel resets stamina', desc: 'Slide then immediately sprint to cancel the slide and regain full sprint speed. Use on flat ground rotations.', controller: true, kbm: true },
    { tip: 'Controller: walk for precision builds', desc: 'Tap L3 off sprint when placing tight builds — you\'ll land edits more consistently.', controller: true, kbm: false },
    { tip: 'KBM: keybind crouch to C', desc: 'Remapping crouch to C lets you spam crouch mid-fight without leaving WASD movement.', controller: false, kbm: true },
  ],
  zones: [
    { name: 'Drop rotation timing', desc: 'Rotate when zone shows at 75% health or when you\'re in a safe position with height. Never wait until zone damages you before moving.' },
    { name: 'Third ring strategy', desc: 'Third ring is the highest LP-swing zone. Position yourself between 2 known squads — third-party the loser immediately for easy kills.' },
    { name: 'Final 5 zones', desc: 'Height = survival in end game. Secure a natural rock or hill with 800+ materials by zone 4. Don\'t build high unnecessarily — it draws third-parties.' },
    { name: 'Storm surf timing', desc: 'When behind in zone, storm surf into position. Time it so you arrive with a sliver of health before opponents can see you reposition.' },
    { name: 'Central vs edge positioning', desc: 'Central players average more eliminations but more third-parties. Edge players average higher placements but fewer fights. Choose based on your goal that session.' },
  ],
}

const TIER_COLOR = { S: 'text-pink-400 bg-pink-500/10 border-pink-500/40', A: 'text-amber-400 bg-amber-500/10 border-amber-500/40', B: 'text-blue-400 bg-blue-500/10 border-blue-500/40' }

export default function MetaPage() {
  const { user } = useAuth()
  const inputMode = user?.inputMode || 'kbm'
  const [tab, setTab] = useState('weapons')

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Newspaper size={24} className="text-cyan-400" /> Weekly Meta Breakdown
          </h1>
          <p className="text-slate-400 text-sm mt-1">Last updated: {LAST_UPDATED} — Tips adapt to your input mode.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1 text-xs font-bold">
          <span className="px-2 py-1 text-slate-400 flex items-center gap-1">
            {inputMode === 'controller' ? <><Gamepad2 size={12} /> Controller</> : <><Keyboard size={12} /> KBM</>}
          </span>
          <span className="text-slate-600 text-xs">mode active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'weapons', label: 'Top Weapons', icon: Crosshair },
          { id: 'movement', label: 'Movement', icon: Wind },
          { id: 'zones', label: 'Zone Strategy', icon: Map },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Weapons */}
      {tab === 'weapons' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {META.weapons.map(w => (
            <div key={w.slot} className="card-bg rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className={`text-xs font-black px-2 py-1 rounded border ${TIER_COLOR[w.tier]}`}>{w.tier}</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{w.slot}</p>
                  <p className="font-black text-white">{w.name}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-3">{w.notes}</p>
              <div className={`rounded-lg p-3 text-sm ${inputMode === 'controller' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-cyan-500/10 border border-cyan-500/20'}`}>
                <span className="text-xs font-bold uppercase tracking-wider mr-2 opacity-60">
                  {inputMode === 'controller' ? '🎮 Controller' : '⌨️ KBM'}
                </span>
                <span className="text-slate-300">{inputMode === 'controller' ? w.controller : w.kbm}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Movement */}
      {tab === 'movement' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {META.movement.filter(m => inputMode === 'controller' ? m.controller : m.kbm).map(m => (
            <div key={m.tip} className="card-bg rounded-xl p-4">
              <p className="text-sm font-bold text-white mb-1">{m.tip}</p>
              <p className="text-sm text-slate-400">{m.desc}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Zones */}
      {tab === 'zones' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {META.zones.map(z => (
            <div key={z.name} className="card-bg rounded-xl p-4">
              <p className="text-sm font-bold text-white mb-1">{z.name}</p>
              <p className="text-sm text-slate-400">{z.desc}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
