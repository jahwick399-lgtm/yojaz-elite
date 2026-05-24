import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Camera, Save, Zap, Shield, Calendar, User,
  CreditCard, Receipt, ExternalLink, AlertCircle, RefreshCw,
  CheckCircle, XCircle, Loader
} from 'lucide-react'
import {
  getSubscription, createPortalSession, cancelSubscription,
  reactivateSubscription, getPaymentHistory, checkBackendHealth,
} from '@/services/api'
import toast from 'react-hot-toast'

const TIER_INFO = {
  basic:   { label: 'Basic',   price: '$7.99/mo',  cls: 'tier-basic',   nextTier: 'premium', nextLabel: 'Premium', nextPrice: '$12.99/mo' },
  premium: { label: 'Premium', price: '$12.99/mo', cls: 'tier-premium', nextTier: 'extreme', nextLabel: 'Extreme', nextPrice: '$19.99/mo' },
  extreme: { label: 'Extreme', price: '$19.99/mo', cls: 'tier-extreme', nextTier: null },
}

function StatusPill({ status }) {
  const cfg = {
    active:    { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle },
    canceled:  { cls: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle },
    past_due:  { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: AlertCircle },
    trialing:  { cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: CheckCircle },
    none:      { cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: XCircle },
  }[status] || { cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: XCircle }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <Icon size={10} />
      {status === 'none' ? 'Inactive' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function Spinner({ size = 16 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      style={{ width: size, height: size }}
      className="border-2 border-transparent border-t-current rounded-full inline-block"
    />
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  // Subscription state
  const [sub, setSub] = useState(null)
  const [subLoading, setSubLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [backendOk, setBackendOk] = useState(null)

  // Payment history state
  const [invoices, setInvoices] = useState([])
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [showInvoices, setShowInvoices] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: { username: user?.username, email: user?.email },
  })

  // Load subscription on mount
  useEffect(() => {
    if (!user) return
    checkBackendHealth().then(ok => {
      setBackendOk(ok)
      if (ok) {
        getSubscription(user.id)
          .then(data => { setSub(data); setSubLoading(false) })
          .catch(() => setSubLoading(false))
      } else {
        setSubLoading(false)
      }
    })
  }, [user?.id])

  const loadInvoices = async () => {
    if (invoices.length || invoiceLoading) return
    setInvoiceLoading(true)
    try {
      const { invoices: data } = await getPaymentHistory(user.id)
      setInvoices(data || [])
    } catch { /* silent */ }
    setInvoiceLoading(false)
  }

  const toggleInvoices = () => {
    setShowInvoices(v => !v)
    if (!showInvoices) loadInvoices()
  }

  const handleCancel = async () => {
    if (!confirm('Cancel subscription? You keep access until the end of the current billing period.')) return
    setCancelLoading(true)
    try {
      const data = await cancelSubscription(user.id)
      setSub(prev => ({ ...prev, cancelAtPeriodEnd: true, renewalDate: data.renewalDate }))
      toast.success('Subscription set to cancel at period end.')
    } catch (err) {
      toast.error(err.message)
    }
    setCancelLoading(false)
  }

  const handleReactivate = async () => {
    setCancelLoading(true)
    try {
      await reactivateSubscription(user.id)
      setSub(prev => ({ ...prev, cancelAtPeriodEnd: false }))
      toast.success('Subscription reactivated!')
    } catch (err) {
      toast.error(err.message)
    }
    setCancelLoading(false)
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const { url } = await createPortalSession(user.id)
      window.location.href = url
    } catch (err) {
      toast.error(err.message)
      setPortalLoading(false)
    }
  }

  const onSave = async (data) => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    updateUser({ username: data.username })
    setSaving(false)
    toast.success('Profile updated!')
  }

  const handleAvatar = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { updateUser({ avatar: ev.target.result }); toast.success('Avatar updated!') }
    reader.readAsDataURL(file)
  }

  if (!user) return null

  const tier = TIER_INFO[user.tier] || TIER_INFO.basic
  const xpForLevel = user.level * user.level * 100
  const xpForNext = (user.level + 1) * (user.level + 1) * 100
  const progress = Math.min(100, Math.max(0, ((user.xp - xpForLevel) / (xpForNext - xpForLevel)) * 100))

  const renewalStr = sub?.renewalDate
    ? new Date(sub.renewalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and subscription.</p>
      </div>

      {/* ── Avatar + Level Card ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-bg rounded-2xl p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/40 to-purple-500/40 border-2 border-cyan-500/30 flex items-center justify-center overflow-hidden">
              {user.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-3xl font-black text-white">{user.username?.[0]?.toUpperCase()}</span>}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Camera size={14} className="text-black" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xl font-black text-white">{user.username}</span>
              <span className={`${tier.cls} text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>{tier.label}</span>
              {user.role === 'admin' && (
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield size={10} /> Admin
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-black gradient-text">{user.level}</p>
            <p className="text-xs text-slate-500 uppercase">Level</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-slate-400">
            <span>{user.xp.toLocaleString()} XP</span>
            <span>{Math.round(progress)}% to Level {user.level + 1}</span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/5">
          {[
            { icon: Zap, label: 'Total XP', value: user.xp.toLocaleString() },
            { icon: Calendar, label: 'Member Since', value: user.joinDate },
            { icon: User, label: 'Streak', value: `${user.streak} days` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
              <p className="font-bold text-white text-sm">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Account Details ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-bg rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4">Account Details</h2>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
            <input
              {...register('username', {
                required: 'Required',
                minLength: { value: 3, message: 'Min 3 chars' },
                maxLength: { value: 20, message: 'Max 20 chars' },
                pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers, underscores only' },
              })}
              className="input-dark rounded-xl px-4 py-3 text-sm"
            />
            {errors.username && <p className="text-pink-400 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              {...register('email')}
              type="email"
              disabled
              className="input-dark rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1">Email cannot be changed.</p>
          </div>
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <Spinner size={14} /> : <Save size={16} />}
            Save Changes
          </button>
        </form>
      </motion.div>

      {/* ── Subscription ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-bg rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard size={17} className="text-cyan-400" />
          Subscription
        </h2>

        {/* Backend offline notice */}
        {backendOk === false && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 mb-4 text-xs text-amber-400">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            <span>Backend server not running — subscription details unavailable. See <code className="bg-white/10 px-1 rounded">STRIPE_SETUP.md</code>.</span>
          </div>
        )}

        {subLoading ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
            <Spinner size={14} />
            <span>Loading subscription...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current plan row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`${tier.cls} text-xs font-bold px-2 py-0.5 rounded-full uppercase`}>{tier.label}</span>
                  <span className="text-slate-300 text-sm">{tier.price}</span>
                  {sub && <StatusPill status={sub.cancelAtPeriodEnd ? 'canceled' : (sub.status || 'none')} />}
                </div>

                {sub?.cancelAtPeriodEnd && renewalStr && (
                  <p className="text-xs text-amber-400">
                    Cancels on {renewalStr} — you keep access until then
                  </p>
                )}
                {sub?.status === 'active' && !sub.cancelAtPeriodEnd && renewalStr && (
                  <p className="text-xs text-slate-500">Next renewal: {renewalStr}</p>
                )}
                {(!sub || sub.status === 'none') && (
                  <p className="text-xs text-slate-500">No active subscription found.</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {backendOk && sub?.status === 'active' && (
                  <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {portalLoading ? <Spinner size={12} /> : <ExternalLink size={12} />}
                    Manage Billing
                  </button>
                )}
                {tier.nextTier && (
                  <Link
                    to={`/subscribe?upgrade=${tier.nextTier}`}
                    className="btn-primary text-xs px-3 py-1.5 rounded-lg"
                  >
                    Upgrade to {tier.nextLabel}
                  </Link>
                )}
              </div>
            </div>

            {/* Cancel / Reactivate */}
            {backendOk && sub?.status === 'active' && (
              <div className="pt-3 border-t border-white/5">
                {sub.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleReactivate}
                    disabled={cancelLoading}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                  >
                    {cancelLoading ? <Spinner size={12} /> : <RefreshCw size={12} />}
                    Reactivate subscription
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    disabled={cancelLoading}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {cancelLoading ? <Spinner size={12} /> : <XCircle size={12} />}
                    Cancel subscription
                  </button>
                )}
              </div>
            )}

            {/* No subscription — show subscribe link */}
            {backendOk && (!sub || sub.status === 'none') && (
              <Link to="/subscribe" className="btn-primary text-sm px-5 py-2 rounded-xl inline-flex items-center gap-2">
                <Zap size={14} />
                Subscribe Now
              </Link>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Payment History ── */}
      {backendOk && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-bg rounded-2xl p-6">
          <button
            onClick={toggleInvoices}
            className="w-full flex items-center justify-between group"
          >
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt size={17} className="text-cyan-400" />
              Payment History
            </h2>
            <span className="text-xs text-slate-500 group-hover:text-cyan-400 transition-colors">
              {showInvoices ? 'Hide' : 'Show'}
            </span>
          </button>

          {showInvoices && (
            <div className="mt-4">
              {invoiceLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                  <Spinner size={14} />
                  <span>Loading invoices...</span>
                </div>
              ) : invoices.length === 0 ? (
                <p className="text-slate-500 text-sm py-2">No payment history found.</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm text-slate-200">{inv.description}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">
                          ${inv.amount} {inv.currency}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {inv.status}
                        </span>
                        {inv.pdfUrl && (
                          <a
                            href={inv.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-cyan-400 transition-colors"
                            title="Download invoice"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
