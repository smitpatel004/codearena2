import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const StatCard = ({ icon, label, value, sub, color = 'brand' }) => {
  const colors = {
    brand: 'from-brand-500/20 to-violet-500/20 border-brand-500/30',
    yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    green: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  }
  return (
    <div className={`glass bg-gradient-to-br ${colors[color]} p-6 hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{sub}</span>}
      </div>
      <div className="text-3xl font-black text-white mb-1">{value ?? '—'}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  )
}

const PlatformSection = ({ title, emoji, color, children, connected }) => (
  <div className="glass p-6">
    <div className="flex items-center gap-3 mb-5">
      <span className="text-2xl">{emoji}</span>
      <h3 className={`text-lg font-bold ${color}`}>{title}</h3>
      {connected
        ? <span className="badge-green ml-auto">Connected</span>
        : <span className="badge bg-gray-500/20 text-gray-400 border border-gray-500/30 ml-auto">Not Connected</span>}
    </div>
    {children}
  </div>
)

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-white">{value ?? '—'}</span>
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, dashRes] = await Promise.allSettled([
          api.get('/profile'),
          api.get('/dashboard'),
        ])
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.data)
        if (dashRes.status === 'fulfilled') setData(dashRes.value.data.data)
        else if (dashRes.reason?.response?.status !== 404) toast.error('Failed to load some stats')
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard')
      setData(res.data.data)
      toast.success('Stats refreshed!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Refresh failed')
    } finally {
      setLoading(false)
    }
  }

  const noProfile = !profile?.leetcodeUsername && !profile?.codeforcesUsername && !profile?.codechefUsername

  return (
    <div className="page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400">Here's your coding performance overview</p>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} disabled={loading} className="btn-secondary gap-2">
            <span className={loading ? 'animate-spin' : ''}>🔄</span> Refresh Stats
          </button>
          <Link to="/battle" className="btn-primary">⚔️ Battle</Link>
        </div>
      </div>

      {/* No profile warning */}
      {noProfile && (
        <div className="glass border border-yellow-500/30 bg-yellow-500/5 p-5 rounded-2xl mb-8 flex items-center gap-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-300">No platforms connected</p>
            <p className="text-sm text-gray-400">Connect your LeetCode, Codeforces, or CodeChef username to see your stats.</p>
          </div>
          <Link to="/profile" className="btn-primary ml-auto whitespace-nowrap text-sm">Connect Now</Link>
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="⭐" label="Skill Score" value={loading ? '...' : (data?.skillScore ?? 0)} sub="/100" color="brand" />
        <StatCard icon="💡" label="Total Solved" value={loading ? '...' : (data?.leetcode?.totalSolved ?? 0)} sub="LeetCode" color="yellow" />
        <StatCard icon="🔵" label="CF Rating" value={loading ? '...' : (data?.codeforces?.currentRating ?? 0)} sub="Codeforces" color="blue" />
        <StatCard icon="🟠" label="CC Rating" value={loading ? '...' : (data?.codechef?.currentRating ?? 0)} sub="CodeChef" color="green" />
      </div>

      {/* Platform details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* LeetCode */}
        <PlatformSection title="LeetCode" emoji="🟡" color="text-yellow-400" connected={!!profile?.leetcodeUsername}>
          {data?.leetcode ? (
            <>
              <Row label="Total Solved" value={data.leetcode.totalSolved} />
              <Row label="Easy" value={<span className="text-emerald-400">{data.leetcode.easySolved}</span>} />
              <Row label="Medium" value={<span className="text-yellow-400">{data.leetcode.mediumSolved}</span>} />
              <Row label="Hard" value={<span className="text-red-400">{data.leetcode.hardSolved}</span>} />
              <Row label="Contest Rating" value={data.leetcode.contestRating || 'N/A'} />
              <Row label="Global Rank" value={data.leetcode.ranking ? `#${data.leetcode.ranking.toLocaleString()}` : 'N/A'} />
            </>
          ) : <p className="text-gray-500 text-sm py-2">{profile?.leetcodeUsername ? 'Loading...' : 'Add username in Profile'}</p>}
        </PlatformSection>

        {/* Codeforces */}
        <PlatformSection title="Codeforces" emoji="🔵" color="text-blue-400" connected={!!profile?.codeforcesUsername}>
          {data?.codeforces ? (
            <>
              <Row label="Current Rating" value={data.codeforces.currentRating} />
              <Row label="Max Rating" value={data.codeforces.maxRating} />
              <Row label="Rank" value={<span className="capitalize">{data.codeforces.rank}</span>} />
              <Row label="Max Rank" value={<span className="capitalize">{data.codeforces.maxRank}</span>} />
            </>
          ) : <p className="text-gray-500 text-sm py-2">{profile?.codeforcesUsername ? 'Loading...' : 'Add username in Profile'}</p>}
        </PlatformSection>

        {/* CodeChef */}
        <PlatformSection title="CodeChef" emoji="🟠" color="text-orange-400" connected={!!profile?.codechefUsername}>
          {data?.codechef ? (
            <>
              <Row label="Current Rating" value={data.codechef.currentRating} />
              <Row label="Highest Rating" value={data.codechef.highestRating} />
              <Row label="Stars" value={data.codechef.stars} />
              <Row label="Global Rank" value={data.codechef.globalRank ? `#${data.codechef.globalRank}` : 'N/A'} />
            </>
          ) : <p className="text-gray-500 text-sm py-2">{profile?.codechefUsername ? 'Loading...' : 'Add username in Profile'}</p>}
        </PlatformSection>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          { icon: '📊', title: 'View Analytics', desc: 'Charts & insights', to: '/analytics', color: 'hover:border-violet-500/40' },
          { icon: '🏆', title: 'Leaderboard', desc: 'See top coders', to: '/leaderboard', color: 'hover:border-yellow-500/40' },
          { icon: '🤖', title: 'AI Analysis', desc: 'Get improvement tips', to: '/analytics', color: 'hover:border-emerald-500/40' },
        ].map(a => (
          <Link key={a.title} to={a.to} className={`glass p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 ${a.color}`}>
            <span className="text-2xl">{a.icon}</span>
            <div>
              <p className="font-semibold text-white">{a.title}</p>
              <p className="text-xs text-gray-500">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
