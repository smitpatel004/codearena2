import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

function CountUp({ end, duration = 800 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (end == null || isNaN(end)) { setVal(end); return }
    let start = 0
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration])
  return <span>{val != null && !isNaN(val) ? val.toLocaleString() : end}</span>
}

const StatCard = ({ sym, label, value, sub, tone = 'gold' }) => {
  const borders = {
    gold: 'border-gold-500/15 hover:border-gold-500/30',
    amber: 'border-amber-500/12 hover:border-amber-500/25',
    blue: 'border-blue-500/12 hover:border-blue-500/25',
    emerald: 'border-emerald-500/12 hover:border-emerald-500/25',
  }
  return (
    <div className={`card-stone p-5 border ${borders[tone]} group`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-gold-400/50 font-serif text-lg group-hover:text-gold-400 transition-colors">{sym}</span>
        {sub && (
          <span className="badge badge-gold">{sub}</span>
        )}
      </div>
      <div className="text-3xl font-bold text-stone-100 mb-1 tracking-tight">
        {typeof value === 'number' ? <CountUp end={value} /> : (value ?? '—')}
      </div>
      <div className="text-[10px] text-stone-500 tracking-[0.1em] uppercase font-semibold">{label}</div>
    </div>
  )
}

const PlatformSection = ({ title, color, children, connected }) => (
  <div className="card-column p-6 border-l-2 border-l-transparent hover:border-l-gold-500/30 transition-all duration-300">
    <div className="flex items-center gap-3 mb-5">
      <h3 className={`font-serif font-bold text-lg tracking-wide ${color}`}>{title}</h3>
      {connected ? (
        <span className="badge badge-gold ml-auto">Connected</span>
      ) : (
        <span className="badge text-stone-400 border-stone-500/30 bg-stone-700/40 ml-auto">Not Connected</span>
      )}
    </div>
    {children}
  </div>
)

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-stone-700/20 last:border-0">
    <span className="text-sm text-stone-400 font-medium">{label}</span>
    <span className="text-sm font-semibold text-stone-200">{value ?? '—'}</span>
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
      toast.success('Stats refreshed')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Refresh failed')
    } finally {
      setLoading(false)
    }
  }

  const noProfile =
    !profile?.leetcodeUsername && !profile?.codeforcesUsername && !profile?.codechefUsername

  return (
    <div className="page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="page-title">
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-stone-400 text-sm tracking-wide font-medium mt-1">
            Your coding performance at a glance
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} disabled={loading} className="btn-secondary gap-2 text-sm">
            <span className={loading ? 'animate-spin' : ''}>⟳</span> Refresh
          </button>
          <Link to="/battle" className="btn-primary text-sm">
            Battle
          </Link>
        </div>
      </div>

      {/* No profile warning */}
      {noProfile && (
        <div className="card-stone border-amber-500/15 bg-amber-500/2 p-5 mb-10 flex items-center gap-4">
          <span className="text-2xl font-serif text-amber-400">!</span>
          <div className="flex-1">
            <p className="font-bold text-amber-400 tracking-wide">No platforms connected</p>
            <p className="text-sm text-amber-400/50 font-medium mt-0.5">
              Connect LeetCode, Codeforces, or CodeChef to see your stats.
            </p>
          </div>
          <Link to="/profile" className="btn-primary text-sm whitespace-nowrap">
            Connect Now
          </Link>
        </div>
      )}

      {/* Overview stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard sym="◆" label="Skill Score" value={loading ? null : (data?.skillScore ?? 0)} sub="/100" tone="gold" />
        <StatCard sym="◇" label="Total Solved" value={loading ? null : (data?.leetcode?.totalSolved ?? 0)} sub="LeetCode" tone="amber" />
        <StatCard sym="◈" label="CF Rating" value={loading ? null : (data?.codeforces?.currentRating ?? 0)} sub="Codeforces" tone="blue" />
        <StatCard sym="▣" label="CC Rating" value={loading ? null : (data?.codechef?.currentRating ?? 0)} sub="CodeChef" tone="emerald" />
      </div>

      {/* Platform details */}
      <div className="grid lg:grid-cols-3 gap-5 mb-10">
        <PlatformSection title="LeetCode" color="text-amber-400" connected={!!profile?.leetcodeUsername}>
          {data?.leetcode ? (
            <>
              <Row label="Total Solved" value={data.leetcode.totalSolved} />
              <Row label="Easy" value={<span className="text-emerald-400 font-semibold">{data.leetcode.easySolved}</span>} />
              <Row label="Medium" value={<span className="text-amber-400 font-semibold">{data.leetcode.mediumSolved}</span>} />
              <Row label="Hard" value={<span className="text-red-400 font-semibold">{data.leetcode.hardSolved}</span>} />
              <Row label="Contest Rating" value={data.leetcode.contestRating || 'N/A'} />
              <Row label="Global Rank" value={data.leetcode.ranking ? `#${data.leetcode.ranking.toLocaleString()}` : 'N/A'} />
            </>
          ) : (
            <p className="text-stone-600 text-sm py-3 font-medium">
              {profile?.leetcodeUsername ? 'Loading...' : 'Add username in Profile'}
            </p>
          )}
        </PlatformSection>

        <PlatformSection title="Codeforces" color="text-blue-400" connected={!!profile?.codeforcesUsername}>
          {data?.codeforces ? (
            <>
              <Row label="Current Rating" value={data.codeforces.currentRating} />
              <Row label="Max Rating" value={data.codeforces.maxRating} />
              <Row label="Rank" value={<span className="capitalize">{data.codeforces.rank}</span>} />
              <Row label="Max Rank" value={<span className="capitalize">{data.codeforces.maxRank}</span>} />
            </>
          ) : (
            <p className="text-stone-600 text-sm py-3 font-medium">
              {profile?.codeforcesUsername ? 'Loading...' : 'Add username in Profile'}
            </p>
          )}
        </PlatformSection>

        <PlatformSection title="CodeChef" color="text-orange-400" connected={!!profile?.codechefUsername}>
          {data?.codechef ? (
            <>
              <Row label="Current Rating" value={data.codechef.currentRating} />
              <Row label="Highest Rating" value={data.codechef.highestRating} />
              <Row label="Stars" value={data.codechef.stars} />
              <Row label="Global Rank" value={data.codechef.globalRank ? `#${data.codechef.globalRank}` : 'N/A'} />
            </>
          ) : (
            <p className="text-stone-600 text-sm py-3 font-medium">
              {profile?.codechefUsername ? 'Loading...' : 'Add username in Profile'}
            </p>
          )}
        </PlatformSection>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          { sym: '◈', title: 'View Analytics', desc: 'Charts and insights', to: '/analytics' },
          { sym: '✦', title: 'Leaderboard', desc: 'See the top ranks', to: '/leaderboard' },
          { sym: '❦', title: 'AI Analysis', desc: 'Get improvement strategy', to: '/analytics' },
        ].map(a => (
          <Link
            key={a.title}
            to={a.to}
            className="card-stone p-5 flex items-center gap-4 group"
          >
            <span className="text-gold-400/50 font-serif text-xl group-hover:text-gold-400 transition-colors">
              {a.sym}
            </span>
            <div>
              <p className="font-semibold text-stone-100 group-hover:text-gold-300 transition-colors tracking-wide">
                {a.title}
              </p>
              <p className="text-xs text-stone-400 font-medium">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
