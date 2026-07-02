import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const [form, setForm] = useState({ leetcodeUsername: '', codeforcesUsername: '', codechefUsername: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/profile').then(res => {
      const p = res.data.data
      setForm({ leetcodeUsername: p.leetcodeUsername || '', codeforcesUsername: p.codeforcesUsername || '', codechefUsername: p.codechefUsername || '' })
    }).catch(() => toast.error('Failed to load profile'))
    .finally(() => setLoading(false))
  }, [])

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/profile', form)
      toast.success('Profile updated. Refresh dashboard to see new stats.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const platforms = [
    { key: 'leetcodeUsername', label: 'LeetCode', colorClass: 'text-amber-400', desc: 'Username from leetcode.com/u/username', placeholder: 'e.g. neal_wu', link: 'https://leetcode.com' },
    { key: 'codeforcesUsername', label: 'Codeforces', colorClass: 'text-blue-400', desc: 'Handle from codeforces.com/profile/handle', placeholder: 'e.g. tourist', link: 'https://codeforces.com' },
    { key: 'codechefUsername', label: 'CodeChef', colorClass: 'text-orange-400', desc: 'Username from codechef.com/users/username', placeholder: 'e.g. gennady', link: 'https://codechef.com' },
  ]

  if (loading)
    return (
      <div className="page flex items-center justify-center min-h-[60vh]">
        <div className="dot-loader"><span /><span /><span /></div>
      </div>
    )

  return (
    <div className="page max-w-2xl">
      <h1 className="page-title">Connect Platforms</h1>
      <p className="page-subtitle">Add your usernames to fetch live stats from each platform.</p>

      <form onSubmit={handleSave} className="space-y-5">
        {platforms.map(p => (
          <div key={p.key} className="card-stone p-6">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className={`font-serif font-bold tracking-wide ${p.colorClass}`}>{p.label}</h3>
                <p className="text-xs text-stone-400 font-medium">{p.desc}</p>
              </div>
              {form[p.key] && <span className="badge badge-gold ml-auto">Connected</span>}
            </div>
            <div className="flex gap-3">
              <input id={`platform-${p.key}`} type="text" className="input" placeholder={p.placeholder}
                value={form[p.key]} onChange={e => setForm({ ...form, [p.key]: e.target.value })} />
              {form[p.key] && (
                <a href={`${p.link}`} target="_blank" rel="noreferrer" className="btn-ghost px-3 text-xs whitespace-nowrap">
                  Visit
                </a>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-4 pt-2">
          <button id="profile-save" type="submit" disabled={saving} className="btn-primary flex-1 py-3.5">
            {saving ? <><span className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />Saving...</> : 'Save Profile'}
          </button>
          <button type="button" onClick={() => setForm({ leetcodeUsername: '', codeforcesUsername: '', codechefUsername: '' })} className="btn-secondary px-6">
            Clear All
          </button>
        </div>
      </form>

      <div className="card-stone p-5 border-gold-500/10 bg-gold-500/2 mt-8">
        <h4 className="font-serif font-bold text-gold-400 mb-3 tracking-wide">Tips</h4>
        <ul className="text-sm text-stone-400 space-y-1.5 font-medium">
          <li>Your username is the part after the last "/" in your profile URL</li>
          <li>Stats are fetched live from each platform when you refresh the dashboard</li>
          <li>All usernames are case-sensitive on Codeforces</li>
        </ul>
      </div>
    </div>
  )
}
