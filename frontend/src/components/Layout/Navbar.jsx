import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import ChallengeNotification from '../Challenge/ChallengeNotification'

const titles = {
  '/dashboard':   { title: 'Dashboard',   sub: 'Your coding stats at a glance' },
  '/battle':      { title: 'Battle Arena', sub: 'Challenge and compare profiles' },
  '/analytics':   { title: 'Analytics',   sub: 'Deep-dive into your performance' },
  '/leaderboard': { title: 'Leaderboard', sub: 'Top warriors of CodeArena' },
  '/friends':     { title: 'War Council', sub: 'Your network of allies' },
  '/profile':     { title: 'Profile',     sub: 'Manage connected platforms' },
  '/settings':    { title: 'Settings',    sub: 'Account preferences' },
}

export default function Navbar({ onMenuClick }) {
  const location = useLocation()
  const { user } = useAuth()
  const { pendingChallenges, activeChallenges, dismissChallenge } = useSocket()
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()
  const info = titles[location.pathname] || { title: 'CodeArena', sub: '' }

  // Hide active-challenge notification for the challenge currently being viewed
  const currentChallengeId = location.pathname.startsWith('/challenge/')
    ? location.pathname.split('/')[2]
    : null;
  const filteredActive = currentChallengeId
    ? activeChallenges.filter(c => c.challengeId !== currentChallengeId)
    : activeChallenges;
  const totalNotifications = pendingChallenges.length + filteredActive.length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-stone-900/85 backdrop-blur-xl border-b border-stone-700/30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-sm hover:bg-stone-700/40 text-stone-400 transition-colors border border-transparent hover:border-stone-600/30"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-serif font-bold text-stone-100 tracking-wider">{info.title}</h1>
          {info.sub && (
            <p className="text-[10px] text-stone-500 tracking-wide font-medium">{info.sub}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-sm border transition-all ${
              totalNotifications > 0
                ? 'border-gold-500/30 bg-gold-500/5 text-gold-400'
                : 'border-stone-600/30 text-stone-400 hover:border-stone-500/40'
            }`}
          >
            <span className="font-serif text-sm">⚔</span>
            {totalNotifications > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-crimson-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 z-50 space-y-2 max-h-[32rem] overflow-y-auto">
                {/* Incoming challenges */}
                {pendingChallenges.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-stone-500 tracking-[0.15em] uppercase font-bold px-1">
                      Incoming Challenges
                    </p>
                    {pendingChallenges.map((c) => (
                      <ChallengeNotification
                        key={c.challengeId}
                        challenge={c}
                        onDismiss={(id) => {
                          dismissChallenge(id);
                          if (pendingChallenges.length <= 1 && filteredActive.length === 0) {
                            setShowNotifications(false);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Active battles (sent challenges that are now live) */}
                {filteredActive.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-stone-500 tracking-[0.15em] uppercase font-bold px-1">
                      Active Battles
                    </p>
                    {filteredActive.map((c) => {
                      const isChallenger = c.challenger.id === user?._id;
                      const otherName = isChallenger ? c.opponent.name : c.challenger.name;
                      return (
                        <div
                          key={c.challengeId}
                          onClick={() => {
                            navigate(`/challenge/${c.challengeId}`);
                            setShowNotifications(false);
                          }}
                          className="card-stone p-4 border-gold-500/15 cursor-pointer hover:bg-stone-800/80 transition-all animate-slide-up"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-stone-100 text-sm tracking-wide">
                                vs {otherName}
                              </p>
                              <p className="text-stone-400 text-xs font-medium mt-0.5">
                                {c.difficulty} · {c.timeLimit} min
                              </p>
                            </div>
                            <span className="badge badge-gold text-[10px]">
                              {isChallenger ? 'YOUR TURN' : 'LIVE'}
                            </span>
                          </div>
                          <p className="text-gold-400 text-xs font-bold mt-2 tracking-wide">
                            Click to enter →
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Empty state */}
                {pendingChallenges.length === 0 && filteredActive.length === 0 && (
                  <div className="card-stone p-6 text-center">
                    <p className="text-stone-500 text-sm font-medium">No challenges</p>
                    <p className="text-stone-600 text-xs mt-1 font-medium">
                      Challenge a friend from the War Council
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Live badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-gold-500/4 border border-gold-500/12">
          <div className="live-dot" />
          <span className="text-[10px] text-gold-400 font-bold tracking-[0.12em] uppercase">Live</span>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-md bg-gold-gradient flex items-center justify-center text-sm font-bold text-stone-900 shadow-stone">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
