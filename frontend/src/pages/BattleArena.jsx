import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const defaultPlayer = { displayName: '', leetcodeUsername: '', codeforcesUsername: '', codechefUsername: '' }

const CompareBar = ({ label, v1, v2, max }) => {
  const p1 = max ? Math.min((v1 / max) * 100, 100) : 0
  const p2 = max ? Math.min((v2 / max) * 100, 100) : 0
  const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0
  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <div className="flex justify-between text-sm mb-2">
        <span className={`font-bold ${winner === 1 ? 'text-emerald-400' : 'text-white'}`}>{v1 ?? 0}</span>
        <span className="text-gray-500 text-xs">{label}</span>
        <span className={`font-bold ${winner === 2 ? 'text-emerald-400' : 'text-white'}`}>{v2 ?? 0}</span>
      </div>
      <div className="flex gap-1 h-2">
        <div className="flex-1 bg-surface-600 rounded-full overflow-hidden flex justify-end">
          <div className="bg-gradient-to-l from-brand-500 to-violet-600 rounded-full transition-all duration-700" style={{ width: `${p1}%` }} />
        </div>
        <div className="flex-1 bg-surface-600 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-full transition-all duration-700" style={{ width: `${p2}%` }} />
        </div>
      </div>
    </div>
  )
}

const PlayerInput = ({ title, color, gradient, form, onChange }) => (
  <div className={`glass p-6 border ${color}`}>
    <h3 className={`font-bold text-lg mb-4 bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>{title}</h3>
    <div className="space-y-3">
      {[
        { key: 'displayName', placeholder: 'Display name (optional)', icon: '👤' },
        { key: 'leetcodeUsername', placeholder: 'LeetCode username', icon: '🟡' },
        { key: 'codeforcesUsername', placeholder: 'Codeforces handle', icon: '🔵' },
        { key: 'codechefUsername', placeholder: 'CodeChef username', icon: '🟠' },
      ].map(f => (
        <div key={f.key} className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">{f.icon}</span>
          <input className="input pl-9 text-sm" placeholder={f.placeholder}
            value={form[f.key]} onChange={e => onChange({ ...form, [f.key]: e.target.value })} />
        </div>
      ))}
    </div>
  </div>
)

export default function BattleArena() {
  const [p1, setP1] = useState(defaultPlayer)
  const [p2, setP2] = useState(defaultPlayer)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    api.get('/battle/history').then(r => setHistory(r.data.data?.slice(0, 5) || [])).catch(() => {})
    // Pre-fill P1 from user profile
    api.get('/profile').then(r => {
      const p = r.data.data
      setP1(prev => ({
        ...prev,
        leetcodeUsername: p.leetcodeUsername || '',
        codeforcesUsername: p.codeforcesUsername || '',
        codechefUsername: p.codechefUsername || '',
        displayName: 'Me',
      }))
    }).catch(() => {})
  }, [])

  const handleBattle = async () => {
    if (!p1.leetcodeUsername && !p1.codeforcesUsername && !p1.codechefUsername)
      return toast.error('Player 1 needs at least one platform username')
    if (!p2.leetcodeUsername && !p2.codeforcesUsername && !p2.codechefUsername)
      return toast.error('Player 2 needs at least one platform username')
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/battle', { player1: p1, player2: p2 })
      setResult(res.data.data)
      toast.success('Battle complete! ⚔️')
      // Refresh history
      api.get('/battle/history').then(r => setHistory(r.data.data?.slice(0, 5) || [])).catch(() => {})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Battle failed. Check usernames.')
    } finally {
      setLoading(false)
    }
  }

  const lc1 = result?.player1?.stats?.leetcode
  const lc2 = result?.player2?.stats?.leetcode
  const cf1 = result?.player1?.stats?.codeforces
  const cf2 = result?.player2?.stats?.codeforces
  const cc1 = result?.player1?.stats?.codechef
  const cc2 = result?.player2?.stats?.codechef

  return (
    <div className="page max-w-5xl">
      <h1 className="page-title">⚔️ Battle Arena</h1>
      <p className="page-subtitle">Compare two coding profiles head-to-head</p>

      {/* Player inputs */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <PlayerInput title="⚡ Player 1" color="border-brand-500/30" gradient="from-brand-400 to-violet-400" form={p1} onChange={setP1} />
        <PlayerInput title="🔥 Player 2" color="border-pink-500/30" gradient="from-pink-400 to-orange-400" form={p2} onChange={setP2} />
      </div>

      <div className="flex justify-center mb-10">
        <button id="battle-start" onClick={handleBattle} disabled={loading}
          className="btn-primary text-lg px-12 py-4 shadow-2xl shadow-brand-900/50">
          {loading
            ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Fetching stats...</>
            : '⚔️ Start Battle!'}
        </button>
      </div>

      {/* Battle Result */}
      {result && (
        <div className="animate-slide-up space-y-6">
          {/* Winner banner */}
          <div className={`glass p-6 text-center border ${result.winner === 'tie' ? 'border-yellow-500/40' : 'border-emerald-500/40'}`}>
            <div className="text-5xl mb-3">{result.winner === 'tie' ? '🤝' : '🏆'}</div>
            <h2 className="text-2xl font-black text-white mb-1">
              {result.winner === 'tie' ? "It's a Tie!" : `${result.winner === 'player1' ? (p1.displayName || 'Player 1') : (p2.displayName || 'Player 2')} Wins!`}
            </h2>
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-center">
                <div className="text-3xl font-black gradient-text">{result.player1.score}</div>
                <div className="text-xs text-gray-400">{p1.displayName || 'Player 1'}</div>
              </div>
              <div className="text-2xl text-gray-500 self-center">vs</div>
              <div className="text-center">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">{result.player2.score}</div>
                <div className="text-xs text-gray-400">{p2.displayName || 'Player 2'}</div>
              </div>
            </div>
          </div>

          {/* Comparison sections */}
          {(lc1 || lc2) && (
            <div className="glass p-6">
              <h3 className="text-yellow-400 font-bold mb-4">🟡 LeetCode Comparison</h3>
              <CompareBar label="Total Solved" v1={lc1?.totalSolved} v2={lc2?.totalSolved} max={500} />
              <CompareBar label="Easy" v1={lc1?.easySolved} v2={lc2?.easySolved} max={200} />
              <CompareBar label="Medium" v1={lc1?.mediumSolved} v2={lc2?.mediumSolved} max={200} />
              <CompareBar label="Hard" v1={lc1?.hardSolved} v2={lc2?.hardSolved} max={100} />
              <CompareBar label="Contest Rating" v1={lc1?.contestRating} v2={lc2?.contestRating} max={3000} />
            </div>
          )}
          {(cf1 || cf2) && (
            <div className="glass p-6">
              <h3 className="text-blue-400 font-bold mb-4">🔵 Codeforces Comparison</h3>
              <CompareBar label="Current Rating" v1={cf1?.currentRating} v2={cf2?.currentRating} max={3000} />
              <CompareBar label="Max Rating" v1={cf1?.maxRating} v2={cf2?.maxRating} max={3000} />
            </div>
          )}
          {(cc1 || cc2) && (
            <div className="glass p-6">
              <h3 className="text-orange-400 font-bold mb-4">🟠 CodeChef Comparison</h3>
              <CompareBar label="Current Rating" v1={cc1?.currentRating} v2={cc2?.currentRating} max={2500} />
              <CompareBar label="Highest Rating" v1={cc1?.highestRating} v2={cc2?.highestRating} max={2500} />
            </div>
          )}
        </div>
      )}

      {/* Recent battles */}
      {history.length > 0 && (
        <div className="mt-10">
          <h2 className="section-title">Recent Battles</h2>
          <div className="space-y-3">
            {history.map((b, i) => (
              <div key={i} className="glass p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span>{b.winner === 'tie' ? '🤝' : '🏆'}</span>
                  <div>
                    <span className="font-medium text-sm">{b.player1?.username || 'P1'}</span>
                    <span className="text-gray-500 mx-2 text-xs">vs</span>
                    <span className="font-medium text-sm">{b.player2?.username || 'P2'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-brand-400">{b.score1} — {b.score2}</div>
                  <div className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
