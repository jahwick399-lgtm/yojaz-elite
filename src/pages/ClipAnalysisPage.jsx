import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Video, Upload, X, Brain, Target, Crosshair, Home, Zap, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

const ANALYSIS_STEPS = [
  { label: 'Processing video...', duration: 1200 },
  { label: 'Analyzing aim patterns...', duration: 1400 },
  { label: 'Evaluating mechanics...', duration: 1000 },
  { label: 'Assessing positioning...', duration: 900 },
  { label: 'Building report...', duration: 700 },
]

const SAMPLE_ANALYSES = [
  {
    category: 'Aim',
    icon: Crosshair,
    score: 72,
    color: '#00f5ff',
    findings: ['Good tracking consistency on close targets', 'Micro-adjustments slightly late on moving targets', 'Overcorrecting on long-range edits'],
    tip: 'Practice smooth reactive tracking. Try Baz Reactive Tracking on Kovaaks.',
  },
  {
    category: 'Mechanics',
    icon: Zap,
    score: 65,
    color: '#a855f7',
    findings: ['Edit resets are 80ms slower than optimal', 'Build placement is clean', 'Cone placements missing in endgame scenarios'],
    tip: 'Run The Edit Course v3 (5856-7619-3536) for 20 min daily. Focus on cone resets.',
  },
  {
    category: 'Positioning',
    icon: Target,
    score: 81,
    color: '#22d3ee',
    findings: ['Storm positioning is excellent', 'Height control maintained throughout fight', 'Exposure risk taken at 0:22 — unnecessary'],
    tip: 'Your positioning is a strength. Work on not overpushing when you have height.',
  },
  {
    category: 'Building',
    icon: Home,
    score: 68,
    color: '#f59e0b',
    findings: ['Ramp rushes are clean', 'Defensive build response is 200ms too slow', 'Triple edits missing in fights'],
    tip: 'JHIB Mechanics Map (8032-5735-9872) — focus on defensive reaction builds.',
  },
  {
    category: 'Decision Making',
    icon: Brain,
    score: 74,
    color: '#ec4899',
    findings: ['Correctly disengaged from 2v1 at 0:08', 'Box fight decision at 0:31 was suboptimal', 'Third-party sense is developing well'],
    tip: 'When boxed 2v1, always prioritize escape over kills. Watch high-level VODs for fight IQ.',
  },
]

function ScoreRing({ score, color, size = 80 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  )
}

export default function ClipAnalysisPage() {
  const { addXP } = useAuth()
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [step, setStep] = useState(0)
  const [results, setResults] = useState(null)

  const onDrop = useCallback(accepted => {
    const f = accepted[0]
    if (!f) return
    if (f.size > 100 * 1024 * 1024) { toast.error('File too large. Max 100MB.'); return }
    setFile(f)
    setResults(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.webm', '.mkv'] },
    maxFiles: 1,
  })

  const analyze = async () => {
    if (!file) return
    setAnalyzing(true)
    setStep(0)
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setStep(i)
      await new Promise(r => setTimeout(r, ANALYSIS_STEPS[i].duration))
    }
    setResults(SAMPLE_ANALYSES)
    setAnalyzing(false)
    addXP(300)
    toast.success('+300 XP — clip analyzed!', { icon: '🎬' })
  }

  const avgScore = results ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">Clip Analysis</h1>
        <p className="text-slate-400 text-sm mt-1">Upload up to 30 seconds of gameplay. Our AI will break down every detail.</p>
      </div>

      {/* Upload zone */}
      {!results && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-cyan-400 bg-cyan-500/10'
                : file
                ? 'border-cyan-500/40 bg-cyan-500/5'
                : 'border-slate-700 hover:border-cyan-500/40 hover:bg-white/3'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="space-y-2">
                <Video size={40} className="mx-auto text-cyan-400" />
                <p className="text-white font-bold">{file.name}</p>
                <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload size={40} className="mx-auto text-slate-500" />
                <div>
                  <p className="text-white font-semibold">Drop your clip here</p>
                  <p className="text-slate-400 text-sm mt-1">MP4, MOV, WebM — max 30 seconds</p>
                </div>
              </div>
            )}
          </div>

          {file && !analyzing && (
            <div className="flex items-center gap-3">
              <button onClick={analyze} className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm">
                <Brain size={16} />
                Analyze Clip
              </button>
              <button onClick={() => setFile(null)} className="btn-secondary px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm">
                <X size={14} />
                Remove
              </button>
            </div>
          )}

          {analyzing && (
            <div className="card-bg rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-transparent border-t-cyan-400 border-r-purple-500 rounded-full"
                />
                <p className="text-white font-medium">{ANALYSIS_STEPS[step].label}</p>
              </div>
              <div className="space-y-2">
                {ANALYSIS_STEPS.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${i < step ? 'bg-cyan-500/30' : i === step ? 'border-2 border-cyan-400' : 'border-2 border-slate-700'}`}>
                      {i < step && <Check size={10} className="text-cyan-400" />}
                    </div>
                    <p className={`text-sm ${i <= step ? 'text-slate-200' : 'text-slate-600'}`}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Overall score */}
            <div className="card-bg rounded-2xl p-6 flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <ScoreRing score={avgScore} color="#00f5ff" size={90} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-white">{avgScore}</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Overall Performance</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {avgScore >= 80 ? 'Elite performance. Minor polishing needed.' : avgScore >= 65 ? 'Solid foundations. Clear areas to improve.' : 'Early stages. Consistent practice will skyrocket your growth.'}
                </p>
                <button
                  onClick={() => { setResults(null); setFile(null) }}
                  className="btn-secondary text-xs px-3 py-1.5 rounded-lg mt-3"
                >
                  Analyze Another Clip
                </button>
              </div>
            </div>

            {/* Per-category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.map(({ category, icon: Icon, score, color, findings, tip }) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-bg rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{category}</span>
                        <span className="text-sm font-black" style={{ color }}>{score}/100</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${color}aa, ${color})` }}
                        />
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-1.5">
                    {findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <div className="w-1 h-1 rounded-full bg-slate-500 mt-1.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-3 flex gap-2">
                    <AlertCircle size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-cyan-300">{tip}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
