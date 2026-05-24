import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Copy, Check, Search } from 'lucide-react'
import { MAPS } from '@/data/maps'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'all',          label: 'All Maps' },
  { id: 'aim',          label: 'Aim' },
  { id: 'editing',      label: 'Editing' },
  { id: 'mechanics',    label: 'Mechanics' },
  { id: 'piece_control',label: 'Piece Control' },
  { id: 'fighting',     label: 'Fighting' },
  { id: 'ranked',       label: 'Ranked' },
  { id: 'building',     label: 'Building' },
]

const DIFF_COLORS = {
  All:          'bg-cyan-500/20 text-cyan-300',
  Beginner:     'bg-green-500/20 text-green-300',
  Intermediate: 'bg-amber-500/20 text-amber-300',
  Advanced:     'bg-red-500/20 text-red-300',
}

const CAT_LABEL = {
  aim:          'Aim',
  editing:      'Editing',
  mechanics:    'Mechanics',
  piece_control:'Piece Control',
  fighting:     'Fighting',
  ranked:       'Ranked',
  building:     'Building',
}

function MapCard({ map }) {
  const [copied, setCopied] = useState(false)

  const copyName = () => {
    navigator.clipboard.writeText(map.name)
    setCopied(true)
    toast.success('Map name copied!', { icon: '📋' })
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card-bg rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1"
    >
      {/* Top row: difficulty + category + rating */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFF_COLORS[map.difficulty] || DIFF_COLORS.All}`}>
            {map.difficulty}
          </span>
          <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {CAT_LABEL[map.category] || map.category}
          </span>
        </div>
        <span className="text-amber-400 text-xs font-bold flex-shrink-0">★ {map.rating}</span>
      </div>

      {/* Map info */}
      <div className="flex-1">
        <h3 className="font-bold text-white text-sm leading-snug">{map.name}</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{map.desc}</p>
      </div>

      {/* Copy name button */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-600 italic">Search this name in Fortnite Creative</p>
        <motion.button
          onClick={copyName}
          whileTap={{ scale: 0.92 }}
          className={`relative flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 flex-shrink-0 overflow-hidden border ${
            copied
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40'
              : 'bg-transparent text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/10 hover:border-cyan-400'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-1.5"
              >
                <Check size={11} />
                Name Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-1.5"
              >
                <Copy size={11} />
                Copy Name
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function TrainingMapsPage() {
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = MAPS.filter(m => {
    const matchCat = cat === 'all' || m.category === cat
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.desc.toLowerCase().includes(search.toLowerCase()) ||
      m.code.includes(search)
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Training Maps</h1>
        <p className="text-slate-400 text-sm mt-1">
          {MAPS.length} curated Creative codes across {CATEGORIES.length - 1} categories.
        </p>
      </div>

      {/* Search + category filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search maps or codes..."
            className="input-dark rounded-xl pl-9 pr-4 py-2.5 text-sm w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                cat === c.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {search && (
        <p className="text-xs text-slate-500">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {/* Maps grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.length > 0 ? (
            filtered.map(m => <MapCard key={m.code} map={m} />)
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16 text-slate-500"
            >
              <Map size={38} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No maps found.</p>
              <p className="text-xs mt-1 text-slate-600">Try a different search or category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
