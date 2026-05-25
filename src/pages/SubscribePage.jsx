import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Check, Shield, CreditCard, ArrowLeft, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createCheckoutSession, checkBackendHealth } from '@/services/api'
import toast from 'react-hot-toast'

const TIERS = [
  {
    id: 'basic',
    label: 'Basic Coaching',
    price: '$7.99',
    cls: 'tier-basic',
    border: 'border-blue-500/40',
    ring: 'ring-blue-500/40',
    features: [
      'Daily routine generator',
      'Training maps library',
      'Progress tracking',
      'Achievement system',
    ],
  },
  {
    id: 'premium',
    label: 'Premium Coaching',
    price: '$12.99',
    cls: 'tier-premium',
    border: 'border-purple-500/40',
    ring: 'ring-purple-500/40',
    popular: true,
    features: [
      'Everything in Basic',
      'Advanced routine plans',
      'Weekly performance reports',
      'XP bonus multiplier',
    ],
  },
  {
    id: 'extreme',
    label: 'Extreme Coaching',
    price: '$19.99',
    cls: 'tier-extreme',
    border: 'border-pink-500/40',
    ring: 'ring-pink-500/40',
    features: [
      'Everything in Premium',
      'AI Clip Analysis (30s)',
      'AI Coach Chat',
      'Direct coaching sessions',
    ],
  },
]

export default function SubscribePage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const defaultTier = params.get('upgrade') || params.get('tier') || 'basic'
  const wasCanceled = params.get('canceled') === 'true'
  const [selected, setSelected] = useState(defaultTier)
  const [loading, setLoading] = useState(false)
  const [backendOk, setBackendOk] = useState(null)

  const tier = TIERS.find(t => t.id === selected) || TIERS[0]

  // Check backend availability on mount
  useEffect(() => {
    checkBackendHealth().then(ok => setBackendOk(ok))
  }, [])

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = `/signup?tier=${selected}`
      return
    }
    setLoading(true)
    try {
      console.log('[Checkout] Creating session — userId:', user.id, 'email:', user.email, 'tier:', selected)
      const { url } = await createCheckoutSession(selected, user.id, user.email)
      console.log('[Checkout] Redirecting to Stripe:', url)
      window.location.href = url
    } catch (err) {
      toast.error(err.message || 'Could not start checkout. Is the backend running?')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020408] px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <Link
          to={user ? '/dashboard' : '/'}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          {user ? 'Back to Dashboard' : 'Back to Home'}
        </Link>

        {/* Cancellation notice */}
        {wasCanceled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3"
          >
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-sm">Payment was canceled. No charge was made. Select a plan below whenever you're ready.</p>
          </motion.div>
        )}

        {/* Backend offline warning */}
        {backendOk === false && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3"
          >
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 text-sm font-semibold">Payment server is warming up…</p>
              <p className="text-amber-400/70 text-xs mt-0.5">
                This may take a few seconds. You can still attempt checkout — it will connect automatically.
              </p>
            </div>
          </motion.div>
        )}

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap size={18} className="text-black" />
            </div>
            <span className="font-black text-xl gradient-text">YoJaz Elite</span>
          </div>
          <h1 className="text-3xl font-black text-white">Choose Your Plan</h1>
          <p className="text-slate-400 mt-2">Recurring monthly subscription. Cancel anytime.</p>
        </div>

        {/* Tier cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {TIERS.map(t => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`relative rounded-2xl p-6 text-left transition-all duration-200 border ${t.border} ${
                  selected === t.id ? `ring-2 ${t.ring} bg-white/5` : 'bg-[#0a0f1a] hover:bg-white/3'
                }`}
              >
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 tier-premium text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                <span className={`${t.cls} text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>{t.label}</span>
                <div className="my-3">
                  <span className="text-3xl font-black text-white">{t.price}</span>
                  <span className="text-slate-400 text-sm">/mo</span>
                </div>
                <ul className="space-y-2">
                  {t.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={13} className="text-cyan-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {selected === t.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center">
                    <Check size={12} className="text-black" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={handleCheckout}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary px-10 py-3.5 rounded-xl flex items-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                />
              ) : (
                <>
                  <CreditCard size={18} />
                  {user ? `Subscribe to ${tier.label} — ${tier.price}/mo` : `Get Started — ${tier.price}/mo`}
                </>
              )}
            </motion.button>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield size={12} className="text-cyan-400" />
              Payments powered by Stripe. We never see your card details.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
