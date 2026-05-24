import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Zap, UserPlus, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

const TIERS = [
  { id: 'basic', label: 'Basic', price: '$7.99/mo', cls: 'tier-basic', border: 'border-blue-500/50' },
  { id: 'premium', label: 'Premium', price: '$12.99/mo', cls: 'tier-premium', border: 'border-purple-500/50' },
  { id: 'extreme', label: 'Extreme', price: '$19.99/mo', cls: 'tier-extreme', border: 'border-pink-500/50' },
]

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState(params.get('tier') || 'basic')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const pw = watch('password')

  const onSubmit = async ({ email, password, username }) => {
    setLoading(true)
    try {
      await signup({ email, password, username })
      toast.success('Account created! Complete your subscription to unlock access.')
      // Redirect to Stripe checkout for the selected plan — tier is NOT granted here
      navigate(`/subscribe?tier=${selectedTier}`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap size={20} className="text-black" />
            </div>
            <span className="font-black text-2xl">
              <span className="gradient-text">YoJaz</span>
              <span className="text-white"> Elite</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-black text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the elite. Start dominating.</p>
        </div>

        <div className="card-bg rounded-2xl p-8">
          {/* Tier selector — sets which plan to purchase after signup, does NOT grant access */}
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-300 mb-3">Choose your plan</p>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTier(t.id)}
                  className={`rounded-lg p-2.5 text-center transition-all duration-200 border ${
                    selectedTier === t.id ? `${t.border} bg-white/5` : 'border-transparent bg-white/3'
                  }`}
                >
                  <span className={`${t.cls} text-xs font-bold px-1.5 py-0.5 rounded-full block mb-1`}>{t.label}</span>
                  <span className="text-xs text-slate-400">{t.price}</span>
                  {selectedTier === t.id && (
                    <div className="flex justify-center mt-1">
                      <Check size={12} className="text-cyan-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'At least 3 characters' },
                  maxLength: { value: 20, message: 'Max 20 characters' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers, underscores only' },
                })}
                placeholder="YoJaz_Pro"
                className="input-dark rounded-xl px-4 py-3 text-sm"
              />
              {errors.username && <p className="text-pink-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                type="email"
                placeholder="you@example.com"
                className="input-dark rounded-xl px-4 py-3 text-sm"
              />
              {errors.email && <p className="text-pink-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-dark rounded-xl px-4 py-3 text-sm pr-10"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-pink-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <input
                {...register('confirm', {
                  required: 'Please confirm your password',
                  validate: v => v === pw || 'Passwords do not match',
                })}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                className="input-dark rounded-xl px-4 py-3 text-sm"
              />
              {errors.confirm && <p className="text-pink-400 text-xs mt-1">{errors.confirm.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
