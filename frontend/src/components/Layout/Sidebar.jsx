import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    sym: '◆' },
  { to: '/battle',       label: 'Battle Arena',  sym: '◇' },
  { to: '/analytics',    label: 'Analytics',     sym: '◈' },
  { to: '/leaderboard',  label: 'Leaderboard',   sym: '✦' },
  { to: '/friends',      label: 'War Council',   sym: '❦' },
  { to: '/profile',      label: 'Profile',       sym: '▣' },
  { to: '/settings',     label: 'Settings',      sym: '▤' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 flex flex-col
          bg-stone-800/95 backdrop-blur-xl border-r border-stone-700/30
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-700/30">
          <div className="w-10 h-10 rounded-md bg-gold-gradient flex items-center justify-center shadow-stone flex-shrink-0">
            <span className="font-serif font-bold text-stone-900 text-sm">CA</span>
          </div>
          <div className="min-w-0">
            <span className="text-base font-serif font-bold gradient-text tracking-wider block truncate">
              CODEARENA
            </span>
            <span className="text-[9px] text-stone-500 tracking-[0.15em] uppercase font-semibold">
              Colosseum
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-stone-700/30">
          <div className="flex items-center gap-3 px-3 py-3 rounded-sm bg-stone-700/50 border border-stone-600/30 shadow-sm">
            <div className="w-10 h-10 rounded-md bg-gold-gradient flex items-center justify-center text-sm font-bold text-stone-900 flex-shrink-0 shadow-stone">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-semibold text-stone-100 truncate tracking-wide">{user?.name}</p>
              <p className="text-[11px] text-stone-400 truncate font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, sym }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium
                transition-all duration-200 border border-transparent tracking-wide
                ${isActive
                  ? 'bg-gold-500/6 text-gold-400 border-gold-500/15'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-700/30'
                }
              `}
            >
              <span className="text-xs w-5 text-center font-serif opacity-60">{sym}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-stone-700/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-stone-400 hover:text-crimson-400 hover:bg-crimson-500/6 border border-transparent hover:border-crimson-500/10 transition-all duration-200 tracking-wide"
          >
            <span className="text-xs w-5 text-center font-serif opacity-60">⏻</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
