import { Link, useNavigate } from 'react-router-dom'

const features = [
  { symbol: '◆', title: 'Unified Dashboard', desc: 'All your LeetCode, Codeforces and CodeChef stats in one commanding view.' },
  { symbol: '◇', title: 'Battle Arena', desc: 'Challenge any coder head-to-head. Our skill-scoring algorithm crowns the victor.' },
  { symbol: '◈', title: 'Deep Analytics', desc: 'Charts and insights revealing your strengths, weaknesses, and growth patterns.' },
  { symbol: '❦', title: 'AI Coaching', desc: 'Gemini analyzes your profile and delivers personalized strategies for improvement.' },
  { symbol: '✦', title: 'Global Leaderboard', desc: 'Compete worldwide. Rise through the ranks. Claim your place among legends.' },
  { symbol: '◆', title: 'War Council', desc: 'Build your network of allies, compare profiles, and push each other forward.' },
]

const platforms = [
  { name: 'LeetCode', color: 'text-amber-400', ring: 'ring-amber-500/20' },
  { name: 'Codeforces', color: 'text-blue-400', ring: 'ring-blue-500/20' },
  { name: 'CodeChef', color: 'text-orange-400', ring: 'ring-orange-500/20' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 overflow-x-hidden font-sans">
      {/* ═══════════════════════════════════════
          NAV
          ═══════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-14 py-4 bg-stone-900/85 backdrop-blur-xl border-b border-stone-700/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gold-gradient flex items-center justify-center text-stone-900 shadow-stone">
            <span className="font-serif font-bold text-sm">CA</span>
          </div>
          <div>
            <span className="text-lg font-serif font-bold gradient-text tracking-wider">CODEARENA</span>
            <span className="text-[9px] text-stone-500 block leading-none tracking-[0.2em] uppercase">Competitive Colosseum</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-stone-400 hover:text-stone-200 transition-colors tracking-wide">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary text-sm px-5 py-2.5">
            Enter the Arena
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          HERO
          ═══════════════════════════════════════ */}
      <section className="relative pt-40 pb-28 px-6 text-center overflow-hidden">
        {/* Warm stone glow */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-24 left-1/4 w-[600px] h-[600px] bg-gold-500/2 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
        <div className="absolute top-24 right-1/4 w-[600px] h-[600px] bg-ember-500/2 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        {/* Stone grain texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(180,150,100,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 25%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 25%, transparent 70%)',
        }} />

        <div className="relative max-w-4xl mx-auto animate-slide-up">
          {/* Status banner */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-sm bg-gold-500/5 border border-gold-500/15 text-gold-400 text-xs font-bold tracking-[0.15em] uppercase mb-10">
            <span className="live-dot" />
            The Colosseum Awaits
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold leading-[1.08] text-stone-100 mb-8 tracking-wide">
            Code.<br className="sm:hidden" /> Compete.{' '}
            <span className="text-shimmer">Conquer.</span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto mb-14 leading-relaxed font-[450]">
            Connect your coding profiles. Battle opponents head-to-head.
            Analyze your strengths. Rise through the ranks with AI-powered strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/register')} className="btn-primary px-8 py-3 text-sm">
              Enter the Arena
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary px-8 py-3 text-sm">
              Sign In
            </button>
          </div>

          {/* Platform badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-16">
            {platforms.map(p => (
              <div key={p.name} className={`flex items-center gap-2 px-4 py-2 rounded-sm border ${p.color} border-current/20 bg-stone-800/40 text-xs font-bold tracking-[0.1em] uppercase`}>
                <span className={`w-1.5 h-1.5 rounded-full ${p.color} bg-current`} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ARCH ARCADER — architectural divider
          ═══════════════════════════════════════ */}
      <div className="arch-arcade">
        {Array.from({ length: 11 }).map((_, i) => (
          <span key={i} style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>

      {/* ═══════════════════════════════════════
          STATS — stone-textured bar
          ═══════════════════════════════════════ */}
      <section className="py-16 border-y border-stone-700/20 bg-stone-800/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(180,150,100,0.015) 3px, rgba(180,150,100,0.015) 6px)',
        }} />
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center relative z-10">
          {[
            { value: '3', label: 'Platforms' },
            { value: '0–100', label: 'Skill Score' },
            { value: 'AI', label: 'Powered Analysis' },
            { value: '∞', label: 'Battles' },
          ].map(s => (
            <div key={s.label} className="animate-card-rise group">
              <div className="text-4xl font-serif font-bold gradient-text mb-2 tracking-wider">{s.value}</div>
              <div className="text-[10px] text-stone-500 tracking-[0.15em] uppercase font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES — stone card grid
          ═══════════════════════════════════════ */}
      <section className="py-28 px-6 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(180,150,100,0.06) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-18">
            <span className="text-[10px] tracking-[0.2em] uppercase text-stone-500 font-bold mb-4 block">
              The Arsenal
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-stone-100 mb-5 tracking-wide">
              Everything you need to{' '}
              <span className="gradient-text">dominate</span>
            </h2>
            <p className="text-stone-400 text-lg font-[450]">
              A complete platform forged for competitive programmers
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={f.title} className="card-stone p-7 group" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="text-gold-400/60 text-2xl mb-5 font-serif group-hover:text-gold-400 transition-colors duration-300">
                  {f.symbol}
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-100 mb-3 group-hover:text-gold-300 transition-colors tracking-wide">
                  {f.title}
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed font-[450]">{f.desc}</p>
                {/* Subtle bottom accent line */}
                <div className="mt-5 h-px w-0 group-hover:w-full bg-gradient-to-r from-gold-500/30 to-transparent transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA — marble card
          ═══════════════════════════════════════ */}
      <section className="py-28 px-6 text-center relative">
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, rgba(180,150,100,0.03) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="card-marble p-16 relative overflow-hidden">
            {/* Corner marks */}
            <span className="absolute top-4 left-4 w-2 h-2 bg-gold-500/20" />
            <span className="absolute top-4 right-4 w-2 h-2 bg-gold-500/20" />
            <span className="absolute bottom-4 left-4 w-2 h-2 bg-gold-500/20" />
            <span className="absolute bottom-4 right-4 w-2 h-2 bg-gold-500/20" />

            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-stone-100 mb-5 tracking-wide">
              Ready to{' '}
              <span className="gradient-text">battle?</span>
            </h2>
            <p className="text-stone-400 text-lg mb-12 font-[450] leading-relaxed">
              Join CodeArena and begin your journey through the ranks
              of competitive programming.
            </p>
            <Link to="/register" className="btn-primary px-10 py-3 text-sm inline-flex shadow-glow-gold">
              Enter the Arena — Free
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
      <footer className="border-t border-stone-700/20 py-10 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-15" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(180,150,100,0.02) 2px, rgba(180,150,100,0.02) 4px)',
        }} />
        <p className="text-stone-600 text-xs tracking-[0.12em] uppercase font-semibold relative z-10">
          CodeArena — Forged for warriors of the code
        </p>
      </footer>
    </div>
  )
}
