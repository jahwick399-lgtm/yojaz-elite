import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  Users, DollarSign, Shield, Trash2, Ban, TrendingUp,
  Search, Crown, ChevronDown, BarChart2
} from 'lucide-react'
import toast from 'react-hot-toast'

const TIER_PRICES = { basic: 7.99, premium: 12.99, extreme: 19.99 }

function StatCard({ icon: Icon, label, value, sub, color = 'cyan' }) {
  const cls = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  }[color]
  return (
    <div className="card-bg rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${cls}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

const TIER_BADGE = {
  basic: 'tier-basic',
  premium: 'tier-premium',
  extreme: 'tier-extreme',
}

export default function AdminPage() {
  const { allUsers, setUsers } = useAuth()
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [editingUser, setEditingUser] = useState(null)

  const users = allUsers.filter(u => {
    const matchSearch = !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchTier = filterTier === 'all' || u.tier === filterTier
    return matchSearch && matchTier
  })

  const revenue = allUsers.reduce((s, u) => s + (TIER_PRICES[u.tier] || 0), 0)
  const tierCounts = { basic: 0, premium: 0, extreme: 0 }
  allUsers.forEach(u => { if (tierCounts[u.tier] !== undefined) tierCounts[u.tier]++ })

  const banUser = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, banned: !u.banned } : u))
    toast.success('User status updated')
  }

  const deleteUser = (id) => {
    if (!confirm('Delete this user permanently?')) return
    setUsers(prev => prev.filter(u => u.id !== id))
    toast.success('User deleted')
  }

  const changeTier = (id, tier) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, tier } : u))
    setEditingUser(null)
    toast.success('Tier updated')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
          <Shield size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Manage users, subscriptions, and platform data.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={allUsers.length} color="cyan" />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={`$${revenue.toFixed(2)}`} sub="est. MRR" color="green" />
        <StatCard icon={Crown} label="Extreme Tier" value={tierCounts.extreme} sub="highest tier" color="pink" />
        <StatCard icon={TrendingUp} label="Premium Tier" value={tierCounts.premium} color="purple" />
      </div>

      {/* Tier breakdown */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card-bg rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <BarChart2 size={18} className="text-cyan-400" />
          Tier Distribution
        </h2>
        <div className="space-y-3">
          {[
            { tier: 'extreme', label: 'Extreme', count: tierCounts.extreme, color: '#ec4899' },
            { tier: 'premium', label: 'Premium', count: tierCounts.premium, color: '#a855f7' },
            { tier: 'basic', label: 'Basic', count: tierCounts.basic, color: '#3b82f6' },
          ].map(({ tier, label, count, color }) => (
            <div key={tier}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{label}</span>
                <span className="font-bold" style={{ color }}>{count} users</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${allUsers.length ? (count / allUsers.length) * 100 : 0}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Users table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="card-bg rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-base font-bold text-white">Users ({users.length})</h2>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="input-dark rounded-lg pl-8 pr-3 py-2 text-xs w-44"
              />
            </div>
            <select
              value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
              className="input-dark rounded-lg px-3 py-2 text-xs cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="extreme">Extreme</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                <th className="pb-3 text-left">User</th>
                <th className="pb-3 text-left">Tier</th>
                <th className="pb-3 text-left">Level</th>
                <th className="pb-3 text-left">XP</th>
                <th className="pb-3 text-left">Revenue</th>
                <th className="pb-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className={`${u.banned ? 'opacity-40' : ''}`}>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                        {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover rounded-lg" /> : u.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white text-xs">{u.username}</p>
                        <p className="text-slate-500 text-xs">{u.email}</p>
                      </div>
                      {u.role === 'admin' && <Shield size={12} className="text-red-400" />}
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    {editingUser === u.id ? (
                      <select
                        defaultValue={u.tier}
                        onChange={e => changeTier(u.id, e.target.value)}
                        className="input-dark rounded-lg px-2 py-1 text-xs cursor-pointer"
                        autoFocus
                      >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="extreme">Extreme</option>
                      </select>
                    ) : (
                      <button onClick={() => setEditingUser(u.id)}>
                        <span className={`${TIER_BADGE[u.tier]} text-xs font-bold px-2 py-0.5 rounded-full uppercase hover:opacity-80`}>
                          {u.tier}
                        </span>
                      </button>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 text-slate-300 text-xs">{u.level}</td>
                  <td className="py-3.5 pr-4 text-slate-300 text-xs">{u.xp?.toLocaleString()}</td>
                  <td className="py-3.5 pr-4 text-emerald-400 text-xs font-bold">${TIER_PRICES[u.tier]}/mo</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => banUser(u.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        title={u.banned ? 'Unban' : 'Ban'}
                      >
                        <Ban size={14} />
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center text-slate-500 py-8 text-sm">No users found.</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
