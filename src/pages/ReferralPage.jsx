import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Gift, Copy, CheckCircle, Users, Zap, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

function genCode(user) {
  return `YOJAZ-${(user?.username || 'USER').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}-${(user?.id || 'XX').slice(0, 4).toUpperCase()}`
}

export default function ReferralPage() {
  const { user, addXP } = useAuth()
  const code = genCode(user)
  const referralLink = `https://yojaz-elite.vercel.app/signup?ref=${code}`
  const [copied, setCopied] = useState(false)
  const [referrals] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`yojaz_referrals_${user?.id}`) || '[]') } catch { return [] }
  })

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const REWARDS = [
    { friends: 1, reward: '+500 XP', desc: 'First friend joins' },
    { friends: 3, reward: '1 Month 10% Off', desc: 'Three referrals' },
    { friends: 5, reward: '+2000 XP + Badge', desc: 'Five referrals' },
    { friends: 10, reward: '1 Month Free', desc: 'Ten referrals — full month on us' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Gift size={24} className="text-pink-400" /> Referral Program
        </h1>
        <p className="text-slate-400 text-sm mt-1">Share your link. Earn XP and subscription discounts when friends sign up.</p>
      </div>

      {/* Referral code card */}
      <div className="card-bg rounded-2xl p-8 mb-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest mb-3">
          <Tag size={12} /> Your Referral Code
        </div>
        <p className="text-3xl font-black tracking-widest gradient-text mb-6">{code}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
          <button onClick={() => copy(code)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-bold text-white transition-all">
            {copied ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
            Copy Code
          </button>
          <button onClick={() => copy(referralLink)}
            className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm">
            <Copy size={16} /> Copy Referral Link
          </button>
        </div>

        <p className="text-xs text-slate-600 break-all">{referralLink}</p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Gift, label: 'Share your link', desc: 'Send your referral link or code to friends who want to improve at Fortnite.' },
          { icon: Users, label: 'Friend signs up', desc: 'They get 10% off their first month when they use your code at checkout.' },
          { icon: Zap, label: 'You earn rewards', desc: 'You get XP and subscription discounts for every friend that subscribes.' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="card-bg rounded-xl p-5">
            <Icon size={20} className="text-pink-400 mb-3" />
            <p className="text-sm font-bold text-white mb-1">{label}</p>
            <p className="text-xs text-slate-400">{desc}</p>
          </div>
        ))}
      </div>

      {/* Reward tiers */}
      <div className="card-bg rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-white mb-4">Reward Milestones</h2>
        <div className="space-y-3">
          {REWARDS.map((r, i) => {
            const reached = referrals.length >= r.friends
            return (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${reached ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/5'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${reached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                  {r.friends}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{r.reward}</p>
                  <p className="text-xs text-slate-400">{r.desc}</p>
                </div>
                {reached && <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-bg rounded-xl p-5 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Referrals</p>
          <p className="text-3xl font-black text-white">{referrals.length}</p>
        </div>
        <div className="card-bg rounded-xl p-5 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">XP Earned</p>
          <p className="text-3xl font-black text-pink-400">{referrals.length * 500}</p>
        </div>
      </div>
    </div>
  )
}
