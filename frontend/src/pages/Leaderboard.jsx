import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/leaderboard').then(res => setLeaderboard(res.data.data))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="page flex items-center justify-center min-h-[60vh]">
        <div className="dot-loader"><span /><span /><span /></div>
      </div>
    )

  return (
    <div className="page max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="page-title">Global Leaderboard</h1>
          <p className="text-stone-400 text-sm tracking-wide font-medium mt-1">Top warriors ranked by skill score</p>
        </div>
      </div>

      <div className="card-stone overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-800/50 border-b border-stone-600/20 text-[10px] uppercase tracking-[0.12em] text-stone-400 font-bold">
                <th className="p-4 font-bold text-center w-16">Rank</th>
                <th className="p-4 font-bold">Warrior</th>
                <th className="p-4 font-bold text-center">Skill Score</th>
                <th className="p-4 font-bold text-center hidden sm:table-cell">Total Solved</th>
                <th className="p-4 font-bold text-center hidden md:table-cell">CF Rating</th>
                <th className="p-4 font-bold text-center hidden md:table-cell">CC Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-700/20">
              {leaderboard.map(entry => {
                const isMe = user?._id === entry.userId || user?.email === entry.email
                return (
                  <tr key={entry.userId}
                    className={`transition-colors hover:bg-stone-700/20 ${isMe ? 'bg-gold-500/3 border-l-2 border-l-gold-500/40' : ''}`}>
                    <td className="p-4 text-center">
                      {entry.rank <= 3 ? (
                        <span className="font-serif text-xl font-bold gradient-text">{entry.rank === 1 ? 'I' : entry.rank === 2 ? 'II' : 'III'}</span>
                      ) : (
                        <span className="font-mono text-stone-400 font-bold text-sm">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-sm flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-gold-gradient text-stone-900 shadow-stone' : 'bg-stone-700 text-stone-300 border border-stone-600/40'}`}>
                          {entry.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-100 flex items-center gap-2 tracking-wide">
                            {entry.name}
                            {isMe && <span className="badge badge-gold">You</span>}
                          </div>
                          <div className="flex gap-1.5 mt-1">
                            {entry.connectedPlatforms.includes('leetcode') && <span className="text-[10px] text-amber-400 font-bold tracking-wide">LC</span>}
                            {entry.connectedPlatforms.includes('codeforces') && <span className="text-[10px] text-blue-400 font-bold tracking-wide">CF</span>}
                            {entry.connectedPlatforms.includes('codechef') && <span className="text-[10px] text-orange-400 font-bold tracking-wide">CC</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-sm bg-gold-500/6 font-bold gradient-text tracking-tight border border-gold-500/10">{entry.skillScore}</span>
                    </td>
                    <td className="p-4 text-center hidden sm:table-cell text-stone-300 font-semibold">{entry.totalSolved}</td>
                    <td className="p-4 text-center hidden md:table-cell text-stone-300 font-semibold">{entry.cfRating}</td>
                    <td className="p-4 text-center hidden md:table-cell text-stone-300 font-semibold">{entry.ccRating}</td>
                  </tr>
                )
              })}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-14 text-center text-stone-500">
                    <div className="text-4xl mb-4 font-serif text-stone-600">◆</div>
                    <p className="font-serif font-bold text-stone-300 mb-1 tracking-wide text-lg">The arena awaits</p>
                    <p className="text-sm font-medium">Be the first to claim the throne</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
