import { Link, useNavigate } from 'react-router-dom'

const features = [
  { icon: '⚡', title: 'Unified Dashboard', desc: 'See all your LeetCode, Codeforces & CodeChef stats in one beautiful view.' },
  { icon: '⚔️', title: 'Battle Arena', desc: 'Challenge any coder head-to-head with our skill-scoring algorithm.' },
  { icon: '📊', title: 'Deep Analytics', desc: 'Charts and insights revealing your strengths and growth patterns.' },
  { icon: '🤖', title: 'AI Coaching', desc: 'Gemini AI analyzes your profile and gives personalized improvement tips.' },
  { icon: '🏆', title: 'Leaderboard', desc: 'Compete globally. Rise through the ranks based on your skill score.' },
  { icon: '👥', title: 'Friend Network', desc: 'Add friends, compare profiles, and push each other to improve.' },
]

const platforms = [
  { name: 'LeetCode', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', emoji: '🟡' },
  { name: 'Codeforces', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', emoji: '🔵' },
  { name: 'CodeChef', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', emoji: '🟠' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-surface-900 text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 bg-surface-900/80 backdrop-blur-xl border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">⚔️</div>
          <span className="text-lg font-bold gradient-text">CodeArena</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600/10 border border-brand-500/30 text-brand-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            The Ultimate Competitive Programming Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Code. Compete.{' '}
            <span className="gradient-text">Conquer.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect your coding profiles, battle friends head-to-head, analyze your strengths,
            and get AI-powered suggestions to level up your competitive programming game.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="btn-primary text-base px-8 py-4">
              🚀 Start Your Journey
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary text-base px-8 py-4">
              Sign In
            </button>
          </div>

          {/* Platform badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
            {platforms.map(p => (
              <div key={p.name} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${p.bg} ${p.color} text-sm font-medium`}>
                <span>{p.emoji}</span> {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 border-y border-white/8 bg-surface-800/40">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '3', label: 'Platforms' },
            { value: '0–100', label: 'Skill Score' },
            { value: 'AI', label: 'Powered Analysis' },
            { value: '∞', label: 'Battles' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black gradient-text">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to <span className="gradient-text">dominate</span></h2>
            <p className="text-gray-400 text-lg">A complete platform built for competitive programmers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="glass p-6 hover:border-brand-500/40 hover:-translate-y-1 transition-all duration-300 group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto glass p-12 glow-brand">
          <h2 className="text-4xl font-black mb-4">Ready to <span className="gradient-text">battle?</span></h2>
          <p className="text-gray-400 mb-8">Join CodeArena and start your competitive programming journey today.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-4 inline-flex">
            ⚔️ Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-6 text-center text-gray-500 text-sm">
        <p>© 2024 CodeArena. Built for competitive programmers, by competitive programmers.</p>
      </footer>
    </div>
  )
}
