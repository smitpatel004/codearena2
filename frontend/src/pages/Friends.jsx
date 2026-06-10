import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = () => {
    api.get('/friends')
      .then(res => setFriends(res.data.data))
      .catch(() => toast.error('Failed to load friends'))
      .finally(() => setLoading(false))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!email) return
    setAdding(true)
    try {
      await api.post('/friends', { email })
      toast.success('Friend added!')
      setEmail('')
      fetchFriends()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add friend')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove ${name} from friends?`)) return
    try {
      await api.delete(`/friends/${id}`)
      toast.success('Friend removed')
      setFriends(friends.filter(f => f.userId !== id))
    } catch (err) {
      toast.error('Failed to remove friend')
    }
  }

  const battleFriend = (friend) => {
    // Navigate to battle arena, we could pass state but they can easily type the username
    // For a smoother flow, we just tell them to copy username
    toast('Copy their username and head to Battle Arena!', { icon: '⚔️' })
    navigate('/battle')
  }

  return (
    <div className="page max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">👥 Friends Network</h1>
          <p className="page-subtitle">Connect and compare with your coding peers</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Add Friend Panel */}
        <div className="md:col-span-1">
          <div className="glass p-6 sticky top-24">
            <h3 className="section-title text-lg mb-2">Add a Friend</h3>
            <p className="text-sm text-gray-400 mb-4">Enter their CodeArena email address to add them to your network.</p>
            <form onSubmit={handleAdd} className="space-y-3">
              <input 
                type="email" 
                className="input text-sm" 
                placeholder="friend@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={adding} className="btn-primary w-full py-2.5 text-sm">
                {adding ? 'Adding...' : '➕ Add Friend'}
              </button>
            </form>
          </div>
        </div>

        {/* Friend List */}
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : friends.length === 0 ? (
            <div className="glass p-12 text-center border border-dashed border-white/20">
              <div className="text-4xl mb-4">👻</div>
              <h3 className="text-lg font-bold text-white mb-2">No friends yet</h3>
              <p className="text-gray-400 text-sm">Add some friends to compare stats and battle!</p>
            </div>
          ) : (
            friends.map(friend => (
              <div key={friend.userId} className="glass p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-500/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-600 flex items-center justify-center text-lg font-bold text-gray-300 shrink-0">
                    {friend.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{friend.name}</h4>
                    <p className="text-xs text-gray-500">{friend.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="badge bg-surface-700 text-brand-400 border border-brand-500/20">
                        Score: {friend.skillScore}
                      </span>
                      <span className="badge bg-surface-700 text-yellow-400 border border-yellow-500/20">
                        Solved: {friend.totalSolved}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => battleFriend(friend)} className="btn-secondary px-4 py-2 text-sm text-brand-400 hover:bg-brand-500/10 hover:border-brand-500/30">
                    ⚔️ Battle
                  </button>
                  <button onClick={() => handleRemove(friend.userId, friend.name)} className="btn-danger px-3 py-2 text-sm" title="Remove Friend">
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
