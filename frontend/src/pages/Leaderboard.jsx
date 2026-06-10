import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/leaderboard')
      .then(res => setLeaderboard(res.data.data))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="page max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">🏆 Global Leaderboard</h1>
          <p className="page-subtitle">Top coders ranked by CodeArena Skill Score</p>
        </div>
      </div>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-800/50 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 font-semibold text-center w-16">Rank</th>
                <th className="p-4 font-semibold">Coder</th>
                <th className="p-4 font-semibold text-center">Skill Score</th>
                <th className="p-4 font-semibold text-center hidden sm:table-cell">Total Solved</th>
                <th className="p-4 font-semibold text-center hidden md:table-cell">CF Rating</th>
                <th className="p-4 font-semibold text-center hidden md:table-cell">CC Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderboard.map((entry) => {
                const isMe = user?._id === entry.userId || user?.email === entry.email
                return (
                  <tr key={entry.userId} className={`transition-colors hover:bg-white/5 ${isMe ? 'bg-brand-500/10' : ''}`}>
                    <td className="p-4 text-center">
                      {entry.rank === 1 ? <span className="text-2xl" title="1st Place">🥇</span> :
                       entry.rank === 2 ? <span className="text-2xl" title="2nd Place">🥈</span> :
                       entry.rank === 3 ? <span className="text-2xl" title="3rd Place">🥉</span> :
                       <span className="font-mono text-gray-400">{entry.rank}</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-brand-500 text-white' : 'bg-surface-600 text-gray-300'}`}>
                          {entry.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {entry.name}
                            {isMe && <span className="badge-purple text-[10px] px-1.5 py-0.5">You</span>}
                          </div>
                          <div className="flex gap-1 mt-1">
                            {entry.connectedPlatforms.includes('leetcode') && <span className="text-[10px] text-yellow-400">LC</span>}
                            {entry.connectedPlatforms.includes('codeforces') && <span className="text-[10px] text-blue-400">CF</span>}
                            {entry.connectedPlatforms.includes('codechef') && <span className="text-[10px] text-orange-400">CC</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-surface-700 font-black gradient-text">
                        {entry.skillScore}
                      </span>
                    </td>
                    <td className="p-4 text-center hidden sm:table-cell text-gray-300">{entry.totalSolved}</td>
                    <td className="p-4 text-center hidden md:table-cell text-gray-300">{entry.cfRating}</td>
                    <td className="p-4 text-center hidden md:table-cell text-gray-300">{entry.ccRating}</td>
                  </tr>
                )
              })}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No coders found. Be the first to connect your platforms!
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
