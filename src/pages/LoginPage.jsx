import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Zap, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password, remember }) => {
    setLoading(true)
    try {
      await login(email, password, remember)
      toast.success('Welcome back!')
      const redirect = searchParams.get('redirect')
      navigate(redirect || '/dashboard')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
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
          <h1 className="mt-6 text-2xl font-black text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="card-bg rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                {...register('email', { required: 'Email is required' })}
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
                  {...register('password', { required: 'Password is required' })}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-dark rounded-xl px-4 py-3 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-pink-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('remember')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 accent-cyan-400"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>

          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
