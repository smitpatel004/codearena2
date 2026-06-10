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
      setForm({
        leetcodeUsername: p.leetcodeUsername || '',
        codeforcesUsername: p.codeforcesUsername || '',
        codechefUsername: p.codechefUsername || '',
      })
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/profile', form)
      toast.success('Profile updated! Refresh dashboard to see new stats.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const platforms = [
    {
      key: 'leetcodeUsername', label: 'LeetCode', icon: '🟡', color: 'text-yellow-400',
      border: 'focus:border-yellow-500 focus:ring-yellow-500/20',
      desc: 'Your LeetCode profile username (from leetcode.com/u/username)',
      placeholder: 'e.g. neal_wu',
      link: 'https://leetcode.com',
    },
    {
      key: 'codeforcesUsername', label: 'Codeforces', icon: '🔵', color: 'text-blue-400',
      border: 'focus:border-blue-500 focus:ring-blue-500/20',
      desc: 'Your Codeforces handle (from codeforces.com/profile/handle)',
      placeholder: 'e.g. tourist',
      link: 'https://codeforces.com',
    },
    {
      key: 'codechefUsername', label: 'CodeChef', icon: '🟠', color: 'text-orange-400',
      border: 'focus:border-orange-500 focus:ring-orange-500/20',
      desc: 'Your CodeChef username (from codechef.com/users/username)',
      placeholder: 'e.g. gennady',
      link: 'https://codechef.com',
    },
  ]

  if (loading) return (
    <div className="page flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="page max-w-2xl">
      <h1 className="page-title">Connect Platforms</h1>
      <p className="page-subtitle">Add your usernames to fetch live stats from each platform.</p>

      <form onSubmit={handleSave} className="space-y-6">
        {platforms.map(p => (
          <div key={p.key} className="glass p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <h3 className={`font-bold ${p.color}`}>{p.label}</h3>
                <p className="text-xs text-gray-500">{p.desc}</p>
              </div>
              {form[p.key] && <span className="badge-green ml-auto">Connected</span>}
            </div>
            <div className="flex gap-3">
              <input
                id={`platform-${p.key}`}
                type="text"
                className={`input ${p.border}`}
                placeholder={p.placeholder}
                value={form[p.key]}
                onChange={e => setForm({ ...form, [p.key]: e.target.value })}
              />
              {form[p.key] && (
                <a href={`${p.link}`} target="_blank" rel="noreferrer"
                  className="btn-ghost px-3 text-xs whitespace-nowrap">
                  Visit ↗
                </a>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-4">
          <button id="profile-save" type="submit" disabled={saving} className="btn-primary flex-1 py-3.5">
            {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : '💾 Save Profile'}
          </button>
          <button type="button" onClick={() => setForm({ leetcodeUsername: '', codeforcesUsername: '', codechefUsername: '' })}
            className="btn-secondary px-6">Clear All</button>
        </div>
      </form>

      {/* Tips */}
      <div className="glass border border-brand-500/20 bg-brand-500/5 p-5 rounded-2xl mt-8">
        <h4 className="font-semibold text-brand-400 mb-2">💡 Tips</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Your username is the part after the last "/" in your profile URL</li>
          <li>• Stats are fetched live from each platform when you refresh the dashboard</li>
          <li>• All usernames are case-sensitive on Codeforces</li>
        </ul>
      </div>
    </div>
  )
}
