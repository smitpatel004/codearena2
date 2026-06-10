import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const titles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your coding stats at a glance' },
  '/battle': { title: 'Battle Arena', subtitle: 'Challenge and compare coding profiles' },
  '/analytics': { title: 'Analytics', subtitle: 'Deep-dive into your performance' },
  '/leaderboard': { title: 'Leaderboard', subtitle: 'Top coders on CodeArena' },
  '/friends': { title: 'Friends', subtitle: 'Your coding network' },
  '/profile': { title: 'Profile', subtitle: 'Manage connected platforms' },
  '/settings': { title: 'Settings', subtitle: 'Account preferences' },
}

export default function Navbar({ onMenuClick }) {
  const location = useLocation()
  const { user } = useAuth()
  const info = titles[location.pathname] || { title: 'CodeArena', subtitle: '' }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-surface-900/80 backdrop-blur-xl border-b border-white/8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{info.title}</h1>
          {info.subtitle && <p className="text-xs text-gray-500">{info.subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-sm font-bold shadow-lg">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
