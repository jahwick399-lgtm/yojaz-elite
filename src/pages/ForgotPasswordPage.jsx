import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Zap, Mail, ArrowLeft, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
        </div>

        <div className="card-bg rounded-2xl p-8">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto">
                <Check size={28} className="text-cyan-400" />
              </div>
              <h2 className="text-xl font-black text-white">Check your email</h2>
              <p className="text-slate-400 text-sm">
                If an account exists with that email, we've sent a reset link. Check your inbox.
              </p>
              <Link to="/login" className="btn-secondary py-2.5 px-6 rounded-xl inline-flex items-center gap-2 text-sm mt-2">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="text-xl font-black text-white mb-1">Reset password</h1>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                      type="email"
                      placeholder="you@example.com"
                      className="input-dark rounded-xl pl-9 pr-4 py-3 text-sm"
                    />
                  </div>
                  {errors.email && <p className="text-pink-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full" />
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-6">
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1">
                  <ArrowLeft size={14} />
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
