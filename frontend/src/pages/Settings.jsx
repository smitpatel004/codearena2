import { useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [savingName, setSavingName] = useState(false)
  const [savingPass, setSavingPass] = useState(false)

  const handleUpdateName = async e => {
    e.preventDefault()
    if (!name.trim()) return
    setSavingName(true)
    try {
      await api.put('/auth/update', { name })
      await refreshUser()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally { setSavingName(false) }
  }

  const handleUpdatePassword = async e => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) return toast.error('New passwords do not match')
    if (passwords.new.length < 6) return toast.error('Password must be at least 6 characters')
    setSavingPass(true)
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.new })
      toast.success('Password changed')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setSavingPass(false) }
  }

  return (
    <div className="page max-w-2xl">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Manage your account preferences</p>

      <div className="space-y-6">
        <section className="card-stone p-6">
          <h2 className="font-serif font-bold text-lg text-stone-100 tracking-wide mb-5">Account Details</h2>
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input bg-stone-700 text-stone-400 cursor-not-allowed border-stone-600/30" value={user?.email || ''} disabled />
              <p className="text-xs text-stone-600 mt-1.5 font-medium">Email cannot be changed.</p>
            </div>
            <div>
              <label className="label">Warrior Name</label>
              <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <button type="submit" disabled={savingName || name === user?.name} className="btn-primary py-2.5 px-6 text-sm">
              {savingName ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </section>

        <section className="card-stone p-6">
          <h2 className="font-serif font-bold text-lg text-stone-100 tracking-wide mb-5">Change Password</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" value={passwords.current}
                onChange={e => setPasswords({ ...passwords, current: e.target.value })} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input" value={passwords.new}
                  onChange={e => setPasswords({ ...passwords, new: e.target.value })} required />
              </div>
              <div>
                <label className="label">Confirm New</label>
                <input type="password" className="input" value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} required />
              </div>
            </div>
            <button type="submit" disabled={savingPass} className="btn-primary py-2.5 px-6 text-sm"
              style={{ background: 'linear-gradient(180deg, rgba(200,100,80,0.9) 0%, rgba(160,60,40,0.9) 100%)' }}>
              {savingPass ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </section>

        <section className="card-stone p-6 border-crimson-500/15 bg-crimson-500/2">
          <h2 className="font-serif font-bold text-lg text-crimson-400 tracking-wide mb-1">Danger Zone</h2>
          <p className="text-sm text-stone-400 font-medium mb-4">Once you delete your account, there is no going back.</p>
          <button className="btn-danger" onClick={() => toast.error('Account deletion is disabled in demo mode')}>
            Delete Account
          </button>
        </section>
      </div>
    </div>
  )
}
