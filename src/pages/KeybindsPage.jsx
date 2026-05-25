import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Keyboard, Gamepad2, Lightbulb, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const KBM_ACTIONS = [
  { id: 'jump', label: 'Jump', default: 'Space' },
  { id: 'crouch', label: 'Crouch', default: 'C' },
  { id: 'sprint', label: 'Sprint', default: 'L-Shift' },
  { id: 'build_wall', label: 'Build Wall', default: 'Q' },
  { id: 'build_floor', label: 'Build Floor', default: 'Mouse4' },
  { id: 'build_ramp', label: 'Build Ramp', default: 'Mouse5' },
  { id: 'build_cone', label: 'Build Cone', default: 'F' },
  { id: 'edit', label: 'Edit', default: 'G' },
  { id: 'confirm_edit', label: 'Confirm Edit', default: 'Mouse1' },
  { id: 'reset_edit', label: 'Reset Edit', default: 'Mouse2' },
  { id: 'interact', label: 'Interact / Pickup', default: 'E' },
  { id: 'reload', label: 'Reload', default: 'R' },
  { id: 'inventory', label: 'Inventory', default: 'Tab' },
  { id: 'map', label: 'Map', default: 'M' },
]

const CONTROLLER_ACTIONS = [
  { id: 'jump', label: 'Jump', default: 'A / Cross' },
  { id: 'crouch', label: 'Crouch', default: 'R3 / R-Stick' },
  { id: 'sprint', label: 'Sprint', default: 'L3 / L-Stick' },
  { id: 'build_wall', label: 'Build Wall', default: 'X / Square' },
  { id: 'build_floor', label: 'Build Floor', default: 'A / Cross (Build Mode)' },
  { id: 'build_ramp', label: 'Build Ramp', default: 'B / Circle' },
  { id: 'build_cone', label: 'Build Cone', default: 'Y / Triangle' },
  { id: 'edit', label: 'Edit', default: 'R3' },
  { id: 'confirm_edit', label: 'Confirm Edit', default: 'R2' },
  { id: 'reset_edit', label: 'Reset Edit', default: 'A / Cross' },
  { id: 'interact', label: 'Interact / Pickup', default: 'Y / Triangle' },
  { id: 'reload', label: 'Reload', default: 'X / Square' },
  { id: 'inventory', label: 'Inventory', default: 'D-Pad Down' },
  { id: 'map', label: 'Map', default: 'Select / Touchpad' },
]

const KBM_SUGGESTIONS = {
  build_wall:  { ideal: 'Q',      why: 'Q is reachable without leaving WASD. Common pro standard.' },
  build_floor: { ideal: 'Mouse4', why: 'Thumb button lets you place floor mid-aim without breaking your grip.' },
  build_ramp:  { ideal: 'Mouse5', why: 'Second thumb button for ramp — zero hand movement, maximum build speed.' },
  build_cone:  { ideal: 'F',      why: 'F is index-finger reach from WASD and keeps cone easily accessible.' },
  edit:        { ideal: 'G',      why: 'G sits just to the right of F — fast hand transition from cone to edit.' },
  crouch:      { ideal: 'C',      why: 'C enables spam-crouch in box fights without losing WASD control.' },
  jump:        { ideal: 'Space',  why: 'Space bar is the universally optimal jump key — do not change this.' },
  sprint:      { ideal: 'L-Shift',why: 'Pinky on shift for sprint is ergonomic and universal for FPS games.' },
}

const CONTROLLER_SUGGESTIONS = {
  edit:         { ideal: 'R3',            why: 'R3 edit on right stick is the fastest modern controller layout — thumb never leaves aim stick.' },
  confirm_edit: { ideal: 'R2',            why: 'R2 confirm keeps your trigger finger active and avoids awkward repositioning.' },
  reset_edit:   { ideal: 'A / Cross',     why: 'Jumping to reset edit is a natural motion — you\'re often jumping out of the edit anyway.' },
  crouch:       { ideal: 'R3 / R-Stick',  why: 'Crouch on R3 lets you quickly micro-crouch in fights without disrupting movement.' },
  build_wall:   { ideal: 'X / Square',    why: 'Face button wall is reachable with thumb during almost any movement state.' },
}

export default function KeybindsPage() {
  const { user, updateUser } = useAuth()
  const [mode, setMode] = useState(user?.inputMode || 'kbm')
  const actions = mode === 'kbm' ? KBM_ACTIONS : CONTROLLER_ACTIONS
  const suggestions = mode === 'kbm' ? KBM_SUGGESTIONS : CONTROLLER_SUGGESTIONS

  const savedBinds = user?.keybinds || {}
  const [binds, setBinds] = useState(() => {
    const defaults = Object.fromEntries(actions.map(a => [a.id, '']))
    return { ...defaults, ...(savedBinds[mode] || {}) }
  })

  const update = (id, val) => setBinds(b => ({ ...b, [id]: val }))

  const save = () => {
    updateUser({ keybinds: { ...savedBinds, [mode]: binds }, inputMode: mode })
    toast.success('Keybinds saved to your profile.')
  }

  const getSuggestion = (id) => suggestions[id]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Keyboard size={24} className="text-cyan-400" /> Keybind Optimizer
        </h1>
        <p className="text-slate-400 text-sm mt-1">Enter your current binds and get suggestions for more efficient layouts.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {[{ id: 'kbm', icon: Keyboard, label: 'Keyboard & Mouse' }, { id: 'controller', icon: Gamepad2, label: 'Controller' }].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { setMode(id); setBinds(Object.fromEntries(actions.map(a => [a.id, '']))) }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input grid */}
        <div className="card-bg rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">Your Current Binds</h2>
          <div className="space-y-2.5">
            {actions.map(a => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="text-sm text-slate-300 w-32 flex-shrink-0">{a.label}</span>
                <input type="text" placeholder={a.default}
                  value={binds[a.id] || ''}
                  onChange={e => update(a.id, e.target.value)}
                  className="input-dark rounded-lg px-3 py-2 text-sm font-mono flex-1" />
              </div>
            ))}
          </div>
          <button onClick={save} className="btn-primary mt-5 px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <Save size={15} /> Save Keybinds
          </button>
        </div>

        {/* Suggestions */}
        <div>
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-400" /> Optimisation Suggestions
          </h2>
          <div className="space-y-3">
            {actions.map(a => {
              const s = getSuggestion(a.id)
              if (!s) return null
              const current = binds[a.id]
              const isOptimal = current && current.toLowerCase() === s.ideal.toLowerCase()
              return (
                <motion.div key={a.id} layout className="card-bg rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white">{a.label}</span>
                    <div className="flex items-center gap-2">
                      {current && (
                        <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">{current}</span>
                      )}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOptimal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {isOptimal ? 'Optimal' : `Suggest: ${s.ideal}`}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{s.why}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
