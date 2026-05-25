import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Video, Plus, X, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_CFG = {
  pending:    { label: 'Pending Review', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock },
  reviewing:  { label: 'Under Review',   cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30',   icon: AlertCircle },
  complete:   { label: 'Reviewed',       cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle },
}

export default function VODReviewPage() {
  const { user } = useAuth()
  const key = `yojaz_vods_${user?.id}`
  const [requests, setRequests] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', url: '', timestamps: '', focus: '', notes: '' })

  const submit = () => {
    if (!form.url.trim()) { toast.error('Add your VOD URL.'); return }
    if (!form.title.trim()) { toast.error('Add a title.'); return }
    const req = { ...form, id: Date.now(), status: 'pending', submittedAt: new Date().toISOString() }
    const next = [req, ...requests]
    setRequests(next)
    localStorage.setItem(key, JSON.stringify(next))
    setShowForm(false)
    setForm({ title: '', url: '', timestamps: '', focus: '', notes: '' })
    toast.success('VOD review request submitted.')
  }

  const remove = (id) => {
    const next = requests.filter(r => r.id !== id)
    setRequests(next)
    localStorage.setItem(key, JSON.stringify(next))
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Video size={24} className="text-cyan-400" /> VOD Review Requests
          </h1>
          <p className="text-slate-400 text-sm mt-1">Submit full match VODs with timestamps for detailed coach breakdown.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm">
          <Plus size={16} /> Submit VOD
        </button>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { step: '1', label: 'Submit your VOD', desc: 'Paste a YouTube or Twitch VOD link with key timestamps you want reviewed.' },
          { step: '2', label: 'Coach reviews it', desc: 'A coach watches your footage and prepares a detailed written breakdown.' },
          { step: '3', label: 'Get your feedback', desc: 'Receive specific, actionable feedback on positioning, mechanics, and decisions.' },
        ].map(({ step, label, desc }) => (
          <div key={step} className="card-bg rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-black font-black text-sm mb-3">{step}</div>
            <p className="text-sm font-bold text-white mb-1">{label}</p>
            <p className="text-xs text-slate-400">{desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card-bg rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">New VOD Review Request</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title / Match Description</label>
                <input type="text" placeholder="e.g. Diamond ranked game — struggling with end-game"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">VOD URL (YouTube or Twitch)</label>
                <input type="url" placeholder="https://youtube.com/watch?v=..."
                  value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Key Timestamps</label>
                <input type="text" placeholder="e.g. 2:15 bad rotation, 8:40 lost box fight, 14:30 zone death"
                  value={form.timestamps} onChange={e => setForm(f => ({ ...f, timestamps: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">What do you want reviewed?</label>
                <select value={form.focus} onChange={e => setForm(f => ({ ...f, focus: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2.5 text-sm">
                  <option value="">Select focus area...</option>
                  {['Decision making', 'Positioning / zone reads', 'Mechanical play', 'Box fighting', 'Rotations', 'End-game play', 'Overall performance'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Additional Notes (optional)</label>
                <textarea rows={2} placeholder="Any context that helps the coach understand what happened..."
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="input-dark rounded-lg px-3 py-2.5 text-sm resize-none" />
              </div>
            </div>
            <button onClick={submit} className="btn-primary px-6 py-2.5 rounded-xl text-sm mt-5">Submit for Review</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Requests */}
      {requests.length === 0 ? (
        <div className="card-bg rounded-2xl p-12 text-center">
          <Video size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No VOD reviews submitted yet.</p>
          <p className="text-slate-600 text-sm mt-1">Submit a match VOD to get detailed coaching feedback.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Submissions</h2>
          {requests.map(r => {
            const cfg = STATUS_CFG[r.status] || STATUS_CFG.pending
            const Icon = cfg.icon
            return (
              <div key={r.id} className="card-bg rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white truncate">{r.title}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.cls}`}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                    </div>
                    <a href={r.url} target="_blank" rel="noreferrer"
                      className="text-xs text-cyan-400 hover:underline truncate block">{r.url}</a>
                    {r.timestamps && <p className="text-xs text-slate-500 mt-1">Timestamps: {r.timestamps}</p>}
                    {r.focus && <p className="text-xs text-slate-500">Focus: {r.focus}</p>}
                    <p className="text-xs text-slate-600 mt-1">{new Date(r.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => remove(r.id)} className="text-slate-600 hover:text-red-400 flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
