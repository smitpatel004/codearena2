import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back, warrior')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-gold-500/2 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{
        backgroundImage: 'radial-gradient(circle, rgba(180,150,100,0.05) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 35%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 35%, transparent 70%)',
      }} />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-md bg-gold-gradient flex items-center justify-center shadow-stone mb-2">
              <span className="font-serif font-bold text-stone-900 text-sm">CA</span>
            </div>
            <span className="text-xl font-serif font-bold gradient-text tracking-wider">CODEARENA</span>
          </Link>
          <h2 className="text-2xl font-serif font-bold text-stone-100 mt-6 mb-2 tracking-wide">Welcome back</h2>
          <p className="text-stone-400 font-medium">Enter the arena once more</p>
        </div>

        <div className="card-marble p-8 relative">
          <span className="absolute top-3 left-3 w-1.5 h-1.5 bg-gold-500/15" />
          <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-gold-500/15" />
          <span className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-gold-500/15" />
          <span className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-gold-500/15" />

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="label">Email</label>
              <input id="login-email" type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input id="login-password" type="password" className="input" placeholder="········"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button id="login-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 mt-3 text-sm">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />Entering...</>
              ) : 'Enter Arena'}
            </button>
          </form>

          <div className="divider-ornament relative z-10">
            <span className="text-[10px] text-stone-500 font-semibold tracking-[0.15em] uppercase px-2">or</span>
          </div>

          <p className="text-center text-stone-400 text-sm relative z-10">
            New to the arena?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">
              Join the ranks
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
