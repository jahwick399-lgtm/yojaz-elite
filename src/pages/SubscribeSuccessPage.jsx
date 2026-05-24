import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Check, ArrowRight, AlertCircle, LogIn, Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { verifySession } from '@/services/api'

const TIER_LABELS = { basic: 'Basic', premium: 'Premium', extreme: 'Extreme' }
const TIER_CLS = { basic: 'tier-basic', premium: 'tier-premium', extreme: 'tier-extreme' }

export default function SubscribeSuccessPage() {
  const [params] = useSearchParams()
  const { user, updateUser } = useAuth()
  const [status, setStatus] = useState('verifying') // verifying | success | error | wrong_user | not_logged_in | pending

  const sessionId = params.get('session_id')
  const urlTier = params.get('tier')
  const urlUserId = params.get('user_id')

  useEffect(() => {
    if (!sessionId) {
      console.warn('[SubscribeSuccess] No session_id in URL — cannot verify payment.')
      setStatus('error')
      return
    }

    // If no user is logged in at all, we cannot safely assign a subscription.
    // Show a "log in" prompt rather than silently failing or guessing.
    if (!user) {
      console.warn('[SubscribeSuccess] No authenticated user — cannot assign subscription. urlUserId:', urlUserId)
      setStatus('not_logged_in')
      return
    }

    // Guard: the user_id embedded in the Stripe redirect URL must match the
    // currently logged-in session. If they differ, someone else's checkout
    // landed in this session — never update the wrong account.
    if (urlUserId && urlUserId !== user.id) {
      console.error(
        '[SubscribeSuccess] User ID mismatch — refusing to assign subscription.',
        'URL user_id:', urlUserId,
        'Logged-in user.id:', user.id
      )
      setStatus('wrong_user')
      return
    }

    verifySession(sessionId)
      .then(data => {
        console.log('[SubscribeSuccess] verifySession response:', data)

        if (!data.paid) {
          console.warn('[SubscribeSuccess] Session not paid — status:', data)
          setStatus('error')
          return
        }

        // Final safety check: server echoes back the userId from Stripe metadata.
        // Make sure it still matches the logged-in user before updating.
        if (data.userId && data.userId !== user.id) {
          console.error(
            '[SubscribeSuccess] Server userId mismatch — refusing to assign subscription.',
            'Server userId:', data.userId,
            'Logged-in user.id:', user.id
          )
          setStatus('wrong_user')
          return
        }

        const resolvedTier = data.tier || urlTier
        console.log('[SubscribeSuccess] Assigning tier', resolvedTier, 'to user', user.id)
        updateUser({ tier: resolvedTier })
        setStatus('success')
      })
      .catch(err => {
        // Backend is unreachable. Do NOT grant tier access based on URL params —
        // those can be crafted by anyone. The Stripe webhook will write the
        // subscription to the server DB when it fires (Stripe retries for 3 days).
        // The user's ProfilePage will load the correct tier once the server is back.
        console.warn('[SubscribeSuccess] Backend unreachable — cannot verify payment. Showing pending state. Error:', err)
        setStatus('pending')
      })
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const tier = urlTier || 'basic'
  const tierLabel = TIER_LABELS[tier] || 'Coaching'
  const tierCls = TIER_CLS[tier] || 'tier-basic'

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap size={18} className="text-black" />
            </div>
            <span className="font-black text-xl gradient-text">YoJaz Elite</span>
          </div>
        </div>

        {/* Verifying */}
        {status === 'verifying' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-bg rounded-2xl p-10 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-2 border-transparent border-t-cyan-400 border-r-purple-500 rounded-full mx-auto mb-4"
            />
            <p className="text-white font-semibold">Confirming your payment...</p>
            <p className="text-slate-400 text-sm mt-1">This takes just a moment.</p>
          </motion.div>
        )}

        {/* Success */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="card-bg rounded-2xl p-8 text-center border border-cyan-500/20 glow-cyan"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-2 border-cyan-400/50 flex items-center justify-center mx-auto mb-5"
            >
              <Check size={36} className="text-cyan-400" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <h1 className="text-2xl font-black text-white mb-2">You're in. Let's get to work.</h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`${tierCls} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                  {tierLabel} Coaching
                </span>
                <span className="text-slate-400 text-sm">activated</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Your subscription is live. Head to your dashboard and start your first training session.
              </p>

              <Link
                to="/dashboard"
                className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2 text-base font-bold"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>

              <p className="text-xs text-slate-600 mt-4">
                Manage billing any time from your{' '}
                <Link to="/profile" className="text-cyan-400 hover:underline">Profile page</Link>.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Not logged in */}
        {status === 'not_logged_in' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-bg rounded-2xl p-8 text-center border border-amber-500/20"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <LogIn size={28} className="text-amber-400" />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Log in to activate your plan</h1>
            <p className="text-slate-400 text-sm mb-6">
              Your payment was received. Log back in to the account you used at checkout and your subscription will be activated.
            </p>
            <Link
              to={`/login?redirect=/subscribe/success?session_id=${sessionId}&tier=${urlTier}&user_id=${urlUserId}`}
              className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2 text-base font-bold"
            >
              <LogIn size={18} /> Log In
            </Link>
          </motion.div>
        )}

        {/* Wrong user logged in */}
        {status === 'wrong_user' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-bg rounded-2xl p-8 text-center border border-amber-500/20"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-amber-400" />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Wrong account</h1>
            <p className="text-slate-400 text-sm mb-6">
              This payment belongs to a different account. Log out and log back in with the account you used at checkout, then revisit this link.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/profile" className="btn-primary px-6 py-2.5 rounded-xl text-sm">
                Go to Profile
              </Link>
              <Link to="/dashboard" className="btn-secondary px-6 py-2.5 rounded-xl text-sm">
                Dashboard
              </Link>
            </div>
          </motion.div>
        )}

        {/* Pending — backend offline, webhook will activate subscription */}
        {status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-bg rounded-2xl p-8 text-center border border-cyan-500/20"
          >
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-cyan-400" />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Payment received — activating soon</h1>
            <p className="text-slate-400 text-sm mb-2">
              Stripe confirmed your payment. Our server is temporarily unavailable to complete activation right now.
            </p>
            <p className="text-slate-500 text-xs mb-6">
              Your subscription will activate automatically once the server is back online. Check your Profile page in a few minutes.
            </p>
            <Link to="/profile" className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2 text-base font-bold">
              Check Profile <ArrowRight size={18} />
            </Link>
          </motion.div>
        )}

        {/* Error */}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-bg rounded-2xl p-8 text-center border border-red-500/20"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Payment could not be confirmed</h1>
            <p className="text-slate-400 text-sm mb-6">
              If you were charged, please contact support. Otherwise, try again below.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/subscribe" className="btn-primary px-6 py-2.5 rounded-xl text-sm">
                Try Again
              </Link>
              <Link to="/dashboard" className="btn-secondary px-6 py-2.5 rounded-xl text-sm">
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
