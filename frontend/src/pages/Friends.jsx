import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import ChallengeModal from '../components/Challenge/ChallengeModal'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [challengeFriend, setChallengeFriend] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchFriends() }, [])

  const fetchFriends = () => {
    api.get('/friends').then(res => setFriends(res.data.data))
      .catch(() => toast.error('Failed to load friends'))
      .finally(() => setLoading(false))
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="page-title">War Council</h1>
          <p className="text-stone-400 text-sm tracking-wide font-medium mt-1">Your network of coding allies</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card-stone p-6 sticky top-24">
            <h3 className="font-serif font-bold text-lg text-stone-100 tracking-wide mb-1">Recruit an Ally</h3>
            <p className="text-sm text-stone-400 font-medium mb-5">Enter their Codex Arena email to add them to your council.</p>
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
