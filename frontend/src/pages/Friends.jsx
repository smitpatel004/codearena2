import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChallengeModal from '../components/Challenge/ChallengeModal'

export default function Friends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [challengeFriend, setChallengeFriend] = useState(null)
  const [tab, setTab] = useState('allies') // 'allies' | 'history'
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchFriends() }, [])

  const fetchFriends = () => {
    api.get('/friends').then(res => setFriends(res.data.data))
      .catch(() => toast.error('Failed to load friends'))
      .finally(() => setLoading(false))
  }

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const [completedRes, expiredRes, declinedRes, cancelledRes] = await Promise.allSettled([
        api.get('/challenges/my', { params: { status: 'completed', limit: 20 } }),
        api.get('/challenges/my', { params: { status: 'expired', limit: 20 } }),
        api.get('/challenges/my', { params: { status: 'declined', limit: 10 } }),
        api.get('/challenges/my', { params: { status: 'cancelled', limit: 10 } }),
      ])
      const all = []
      if (completedRes.status === 'fulfilled') all.push(...completedRes.value.data.data)
      if (expiredRes.status === 'fulfilled') all.push(...expiredRes.value.data.data)
      if (declinedRes.status === 'fulfilled') all.push(...declinedRes.value.data.data)
      if (cancelledRes.status === 'fulfilled') all.push(...cancelledRes.value.data.data)
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setHistory(all)
    } catch {
      toast.error('Failed to load battle history')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'history') fetchHistory()
  }, [tab])

  const handleAdd = async e => {
    e.preventDefault()
    if (!email) return
    setAdding(true)
    try {
      await api.post('/friends', { email })
      toast.success('Ally added to your war council')
      setEmail('')
      fetchFriends()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add friend')
    } finally { setAdding(false) }
  }

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your war council?`)) return
    try {
      await api.delete(`/friends/${id}`)
      toast.success('Friend removed')
      setFriends(friends.filter(f => f.userId !== id))
    } catch (err) { toast.error('Failed to remove friend') }
  }

  const battleFriend = () => {
    toast('Head to Battle Arena to challenge them')
    navigate('/battle')
  }

  return (
    <div className="page max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">War Council</h1>
          <p className="text-stone-400 text-sm tracking-wide font-medium mt-1">Your network of coding allies</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-6 border-b border-stone-700/30">
        {[
          { key: 'allies', label: 'Allies', sym: '❦' },
          { key: 'history', label: 'Battle History', sym: '⚔' },
        ].map(({ key, label, sym }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-bold tracking-wide border-b-2 transition-all ${
              tab === key
                ? 'border-gold-500 text-gold-400'
                : 'border-transparent text-stone-500 hover:text-stone-300'
            }`}
          >
            <span className="font-serif mr-2 text-xs">{sym}</span>
            {label}
          </button>
        ))}
      </div>

      {/* ── Allies Tab ── */}
      {tab === 'allies' && (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card-stone p-6 sticky top-24">
            <h3 className="font-serif font-bold text-lg text-stone-100 tracking-wide mb-1">Recruit an Ally</h3>
            <p className="text-sm text-stone-400 font-medium mb-5">Enter their CodeArena email to add them to your council.</p>
            <form onSubmit={handleAdd} className="space-y-3">
              <input type="email" className="input text-sm" placeholder="ally@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" disabled={adding} className="btn-primary w-full py-2.5 text-sm">
                {adding ? 'Recruiting...' : 'Recruit Ally'}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center p-12"><div className="dot-loader"><span /><span /><span /></div></div>
          ) : friends.length === 0 ? (
            <div className="card-stone p-14 text-center border-dashed border-stone-600/30">
              <div className="font-serif text-5xl text-stone-600 mb-5">◆</div>
              <h3 className="font-serif font-bold text-stone-100 text-lg mb-2 tracking-wide">No allies yet</h3>
              <p className="text-stone-400 text-sm font-medium">Recruit allies to compare and challenge</p>
            </div>
          ) : (
            friends.map(friend => (
              <div key={friend.userId} className="card-stone p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-sm bg-stone-700 text-stone-300 flex items-center justify-center text-lg font-bold border border-stone-600/40 shrink-0">
                    {friend.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-100 text-lg tracking-wide">{friend.name}</h4>
                    <p className="text-xs text-stone-400 font-medium">{friend.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="badge badge-gold">Score {friend.skillScore}</span>
                      <span className="badge badge-orange">Solved {friend.totalSolved}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setChallengeFriend(friend)} className="btn-primary px-4 py-2 text-sm">
                    Challenge
                  </button>
                  <button onClick={battleFriend} className="btn-secondary px-4 py-2 text-sm">
                    Compare
                  </button>
                  <button onClick={() => handleRemove(friend.userId, friend.name)} className="btn-danger px-3 py-2 text-sm" title="Remove">x</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}

      {/* ── Battle History Tab ── */}
      {tab === 'history' && (
        <div>
          {historyLoading ? (
            <div className="flex justify-center p-12"><div className="dot-loader"><span /><span /><span /></div></div>
          ) : history.length === 0 ? (
            <div className="card-stone p-14 text-center border-dashed border-stone-600/30">
              <div className="font-serif text-5xl text-stone-600 mb-5">⚔</div>
              <h3 className="font-serif font-bold text-stone-100 text-lg mb-2 tracking-wide">No battles yet</h3>
              <p className="text-stone-400 text-sm font-medium">Challenge an ally to start your battle history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((battle) => {
                const userId = String(user?._id);
                const challengerId = String(battle.challengerId?._id || battle.challengerId);
                const opponentId = String(battle.opponentId?._id || battle.opponentId);
                const winnerId = String(battle.winner?._id || battle.winner || '');
                const isChallenger = challengerId === userId;
                const opponentName = isChallenger
                  ? battle.opponentId?.name
                  : battle.challengerId?.name;
                const iWon = winnerId === userId;
                const isDraw = battle.result === 'draw';
                const isDeclined = battle.status === 'declined';
                const isCancelled = battle.status === 'cancelled';
                const isExpired = battle.status === 'expired';

                let resultLabel, resultColor, resultBg;
                if (isDeclined) {
                  resultLabel = 'Declined'; resultColor = 'text-stone-500'; resultBg = 'bg-stone-700/40';
                } else if (isCancelled) {
                  resultLabel = 'Cancelled'; resultColor = 'text-stone-500'; resultBg = 'bg-stone-700/40';
                } else if (isDraw || (isExpired && !battle.challengerSubmission?.submittedAt && !battle.opponentSubmission?.submittedAt)) {
                  resultLabel = 'Draw'; resultColor = 'text-amber-400'; resultBg = 'bg-amber-500/10';
                } else if (iWon) {
                  resultLabel = 'Victory'; resultColor = 'text-emerald-400'; resultBg = 'bg-emerald-500/10';
                } else {
                  resultLabel = 'Defeat'; resultColor = 'text-crimson-400'; resultBg = 'bg-crimson-500/10';
                }

                return (
                  <div
                    key={battle._id}
                    onClick={() => navigate(`/challenge/${battle._id}`)}
                    className="card-stone p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold shrink-0 ${
                        iWon ? 'bg-gold-gradient text-stone-900' : 'bg-stone-700 text-stone-400'
                      }`}>
                        {opponentName?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-stone-100 text-sm tracking-wide truncate">
                            vs {opponentName || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`badge text-[10px] ${
                            battle.difficulty === 'Easy' ? 'badge-green' :
                            battle.difficulty === 'Medium' ? 'badge-orange' : 'badge-red'
                          }`}>{battle.difficulty}</span>
                          <span className="text-[11px] text-stone-500 font-medium">{battle.timeLimit} min</span>
                          <span className="text-[11px] text-stone-600">
                            {new Date(battle.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`badge text-[10px] font-bold ${resultColor} ${resultBg} border-current/20 shrink-0`}>
                      {resultLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Challenge Modal */}
      {challengeFriend && (
        <ChallengeModal
          friend={challengeFriend}
          onClose={() => setChallengeFriend(null)}
        />
      )}
    </div>
  )
}
