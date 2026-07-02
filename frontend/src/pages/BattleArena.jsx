import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const defaultPlayer = {
  displayName: '',
  leetcodeUsername: '',
  codeforcesUsername: '',
  codechefUsername: '',
}

const CompareBar = ({ label, v1, v2, max }) => {
  const p1 = max ? Math.min((v1 / max) * 100, 100) : 0
  const p2 = max ? Math.min((v2 / max) * 100, 100) : 0
  const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0
  return (
    <div className="py-3 border-b border-stone-700/20 last:border-0">
      <div className="flex justify-between text-sm mb-2">
        <span className={`font-bold tracking-wide ${winner === 1 ? 'text-gold-400' : 'text-stone-200'}`}>
          {v1 ?? 0}
        </span>
        <span className="text-stone-500 text-xs font-semibold tracking-[0.08em] uppercase">{label}</span>
        <span className={`font-bold tracking-wide ${winner === 2 ? 'text-gold-400' : 'text-stone-200'}`}>
          {v2 ?? 0}
        </span>
      </div>
      <div className="flex gap-1.5 h-2.5">
        <div className="flex-1 bg-stone-700 rounded-sm overflow-hidden flex justify-end">
          <div className="transition-all duration-700 rounded-sm"
            style={{ width: `${p1}%`, background: 'linear-gradient(90deg, #8f7218, #d4b65a)' }} />
        </div>
        <div className="flex-1 bg-stone-700 rounded-sm overflow-hidden">
          <div className="transition-all duration-700 rounded-sm"
            style={{ width: `${p2}%`, background: 'linear-gradient(90deg, #7e1e1e, #c06020)' }} />
        </div>
      </div>
    </div>
  )
}

const PlayerInput = ({ title, colorClass, borderClass, form, onChange }) => (
  <div className={`card-stone p-6 border ${borderClass} transition-all duration-300`}>
    <div className="flex items-center gap-3 mb-5">
      <h3 className={`font-serif font-bold text-lg tracking-wider ${colorClass}`}>{title}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-current/15 to-transparent" />
    </div>
    <div className="space-y-3">
      {[
        { key: 'displayName', placeholder: 'Display name', label: 'Name' },
        { key: 'leetcodeUsername', placeholder: 'LeetCode username', label: 'LeetCode' },
        { key: 'codeforcesUsername', placeholder: 'Codeforces handle', label: 'Codeforces' },
        { key: 'codechefUsername', placeholder: 'CodeChef username', label: 'CodeChef' },
      ].map(f => (
        <div key={f.key}>
          <span className="text-[10px] text-stone-500 tracking-[0.08em] uppercase font-semibold block mb-1">{f.label}</span>
          <input
            className="input text-sm"
            placeholder={f.placeholder}
            value={form[f.key]}
            onChange={e => onChange({ ...form, [f.key]: e.target.value })}
          />
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
      toast.success('Battle complete')
      api.get('/battle/history').then(r => setHistory(r.data.data?.slice(0, 5) || [])).catch(() => {})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Battle failed. Check usernames.')
    } finally { setLoading(false) }
  }

  const lc1 = result?.player1?.stats?.leetcode
  const lc2 = result?.player2?.stats?.leetcode
  const cf1 = result?.player1?.stats?.codeforces
  const cf2 = result?.player2?.stats?.codeforces
  const cc1 = result?.player1?.stats?.codechef
  const cc2 = result?.player2?.stats?.codechef

  return (
    <div className="page max-w-5xl">
      <h1 className="page-title">Battle Arena</h1>
      <p className="page-subtitle">Compare two coding profiles head-to-head</p>

      {/* Player inputs */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <PlayerInput title="Champion" colorClass="text-gold-400" borderClass="border-stone-600/30 hover:border-gold-500/25" form={p1} onChange={setP1} />
        <PlayerInput title="Challenger" colorClass="text-crimson-400" borderClass="border-stone-600/30 hover:border-crimson-500/25" form={p2} onChange={setP2} />
      </div>

      {/* FIGHT button */}
      <div className="flex justify-center mb-12">
        <div className="relative">
          <div className="absolute inset-0 rounded bg-gold-500/6 blur-xl animate-glow-pulse" />
          <button id="battle-start" onClick={handleBattle} disabled={loading}
            className="btn-primary text-xl px-16 py-5 shadow-glow-gold relative z-10 tracking-[0.15em] uppercase font-bold">
            {loading ? (
              <><span className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />Fetching...</>
            ) : (
              'FIGHT'
            )}
          </button>
        </div>
      </div>

      {/* Battle Result */}
      {result && (
        <div className="animate-slide-up space-y-6">
          <div className={`card-marble p-10 text-center ${result.winner === 'tie' ? 'border-amber-500/15 bg-amber-500/2' : 'border-emerald-500/15 bg-emerald-500/2'}`}>
            <div className="text-6xl mb-5 font-serif">{result.winner === 'tie' ? '—' : '✦'}</div>
            <h2 className="text-3xl font-serif font-bold text-stone-100 mb-2 tracking-wider">
              {result.winner === 'tie'
                ? 'A Worthy Tie'
                : `${result.winner === 'player1' ? (p1.displayName || 'Champion') : (p2.displayName || 'Challenger')} Reigns Supreme`}
            </h2>
            <div className="flex justify-center items-center gap-12 mt-8">
              <div className="text-center">
                <div className="text-6xl font-bold gradient-text tracking-tight">{result.player1.score}</div>
                <div className="text-sm text-stone-400 mt-2 font-bold tracking-[0.08em] uppercase">{p1.displayName || 'Champion'}</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xl font-serif font-bold text-stone-600 tracking-[0.2em]">VS</span>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-stone-600 to-transparent" />
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold gradient-text-warm tracking-tight">{result.player2.score}</div>
                <div className="text-sm text-stone-400 mt-2 font-bold tracking-[0.08em] uppercase">{p2.displayName || 'Challenger'}</div>
              </div>
            </div>
          </div>

          {(lc1 || lc2) && (
            <div className="card-sand p-6">
              <h3 className="font-serif font-bold text-amber-400 mb-5 tracking-wider text-lg">LeetCode Comparison</h3>
              <CompareBar label="Total Solved" v1={lc1?.totalSolved} v2={lc2?.totalSolved} max={500} />
              <CompareBar label="Easy" v1={lc1?.easySolved} v2={lc2?.easySolved} max={200} />
              <CompareBar label="Medium" v1={lc1?.mediumSolved} v2={lc2?.mediumSolved} max={200} />
              <CompareBar label="Hard" v1={lc1?.hardSolved} v2={lc2?.hardSolved} max={100} />
              <CompareBar label="Contest Rating" v1={lc1?.contestRating} v2={lc2?.contestRating} max={3000} />
            </div>
          )}
          {(cf1 || cf2) && (
            <div className="card-sand p-6">
              <h3 className="font-serif font-bold text-blue-400 mb-5 tracking-wider text-lg">Codeforces Comparison</h3>
              <CompareBar label="Current Rating" v1={cf1?.currentRating} v2={cf2?.currentRating} max={3000} />
              <CompareBar label="Max Rating" v1={cf1?.maxRating} v2={cf2?.maxRating} max={3000} />
            </div>
          )}
          {(cc1 || cc2) && (
            <div className="card-sand p-6">
              <h3 className="font-serif font-bold text-orange-400 mb-5 tracking-wider text-lg">CodeChef Comparison</h3>
              <CompareBar label="Current Rating" v1={cc1?.currentRating} v2={cc2?.currentRating} max={2500} />
              <CompareBar label="Highest Rating" v1={cc1?.highestRating} v2={cc2?.highestRating} max={2500} />
            </div>
          )}
        </div>
      )}

      {/* Recent battles */}
      {history.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="section-title mb-0">Recent Battles</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-stone-600/40 to-transparent" />
          </div>
          <div className="space-y-3">
            {history.map((b, i) => (
              <div key={i} className="card-stone p-4 flex items-center justify-between hover:bg-stone-800/80 transition-all">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-gold-400/60">{b.winner === 'tie' ? '—' : '✦'}</span>
                  <div>
                    <span className="font-semibold text-sm text-stone-100 tracking-wide">{b.player1?.username || 'P1'}</span>
                    <span className="text-stone-600 mx-2 text-xs font-bold">vs</span>
                    <span className="font-semibold text-sm text-stone-100 tracking-wide">{b.player2?.username || 'P2'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold gradient-text">{b.score1} — {b.score2}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5 font-medium tracking-wide uppercase">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
