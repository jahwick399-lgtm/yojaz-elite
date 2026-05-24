import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Target, Brain, TrendingUp, Shield, Star, ChevronRight, Check } from 'lucide-react'

const TIERS = [
  {
    name: 'Basic',
    price: '$7.99',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    badge: 'tier-basic',
    features: [
      'Daily routine generator',
      'Training maps library',
      'Progress tracking',
      'Achievement system',
      'Community access',
    ],
    cta: 'Start Basic',
    tier: 'basic',
  },
  {
    name: 'Premium',
    price: '$12.99',
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/40',
    badge: 'tier-premium',
    popular: true,
    features: [
      'Everything in Basic',
      'Advanced routine plans',
      'Priority training maps',
      'Weekly performance reports',
      'XP bonus multiplier',
    ],
    cta: 'Go Premium',
    tier: 'premium',
  },
  {
    name: 'Extreme',
    price: '$19.99',
    color: 'from-pink-500/20 to-pink-600/10',
    border: 'border-pink-500/40',
    badge: 'tier-extreme',
    features: [
      'Everything in Premium',
      'AI Clip Analysis (30s)',
      'AI Coach Chat',
      'Personalized strategies',
      'Direct coaching sessions',
    ],
    cta: 'Go Extreme',
    tier: 'extreme',
  },
]

const FEATURES = [
  { icon: Target, title: 'Smart Routine Generator', desc: 'AI-built daily training plans based on your hours, skill level, and goals.' },
  { icon: Brain, title: 'AI Coach', desc: 'Get real-time advice, strategy tips, and motivation from your personal AI Fortnite coach.' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Daily, weekly, monthly charts showing your improvement across all mechanics.' },
  { icon: Zap, title: 'Clip Analysis', desc: 'Upload 30-second clips and get AI analysis of aim, builds, positioning, and decisions.' },
  { icon: Shield, title: 'XP & Achievements', desc: 'Level up as you train. Unlock achievements and flex your progress to the community.' },
  { icon: Star, title: 'Training Maps', desc: 'Curated Creative maps for aim, edits, piece control, mechanics, and ranked prep.' },
]

function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020408] overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020408]/80 backdrop-blur-md border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap size={16} className="text-black" />
            </div>
            <span className="font-black text-lg">
              <span className="gradient-text">YoJaz</span>
              <span className="text-white"> Elite</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
              Log in
            </Link>
            <Link
              to="/signup"
              className="btn-primary text-sm px-4 py-2 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 text-center overflow-hidden">
        {/* BG glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative max-w-4xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 tier-extreme text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Zap size={12} />
            THE #1 FORTNITE COACHING PLATFORM
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight">
            <span className="text-white">Dominate</span>
            <br />
            <span className="gradient-text text-glow-cyan">Every Game.</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            YoJaz Elite delivers elite-level AI coaching, smart training routines, and detailed performance analytics.
            Built for players who refuse to lose.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/signup" className="btn-primary text-base px-8 py-3 rounded-xl flex items-center gap-2 pulse-glow">
              Start Training <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3 rounded-xl">
              Log In
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 pt-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-cyan-400" /> No free tier</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-cyan-400" /> Cancel anytime</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-cyan-400" /> Real results</span>
          </div>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Everything you need to <span className="gradient-text">level up</span>
          </h2>
          <p className="text-slate-400">Tools built for serious players.</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div className="card-bg rounded-xl p-6 h-full transition-all duration-300 hover:transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-cyan-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Choose your <span className="gradient-text">tier</span>
          </h2>
          <p className="text-slate-400">No free plans. Pure elite training.</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map(({ name, price, color, border, badge, popular, features, cta, tier }, i) => (
            <FadeIn key={name} delay={i * 0.1}>
              <div className={`relative rounded-2xl bg-gradient-to-b ${color} border ${border} p-6 h-full flex flex-col transition-all duration-300 hover:transform hover:-translate-y-1 ${popular ? 'ring-2 ring-purple-500/50' : ''}`}>
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 tier-premium text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-5">
                  <span className={`${badge} text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>{name}</span>
                  <div className="mt-3">
                    <span className="text-4xl font-black text-white">{price}</span>
                    <span className="text-slate-400 text-sm">/mo</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check size={14} className="text-cyan-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/signup?tier=${tier}`}
                  className="btn-primary text-sm py-3 px-6 rounded-xl text-center block w-full"
                >
                  {cta}
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/10 py-8 px-4 text-center text-slate-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap size={14} className="text-cyan-400" />
          <span className="font-black gradient-text">YoJaz Elite</span>
        </div>
        <p>© 2025 YoJaz Elite. All rights reserved.</p>
      </footer>
    </div>
  )
}
