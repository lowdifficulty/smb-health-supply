import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateLogin } from '../lib/authCredentials'

type LoginMode = 'client' | 'admin'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginAsClient, loginAsAdmin } = useAuth()
  const [mode, setMode] = useState<LoginMode>('client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Enter your username and password.')
      return
    }

    if (!validateLogin(email, password, mode)) {
      setError('Invalid username or password.')
      return
    }

    if (mode === 'admin') {
      loginAsAdmin()
    } else {
      loginAsClient()
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <p className="text-center mb-6">
            <Link to="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              ← Back to SMB Health Supply
            </Link>
          </p>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg mx-auto">
              ASG
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              {mode === 'admin' ? 'Admin Sign In' : 'ASG Portal'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {mode === 'admin'
                ? 'Sign in to manage ASG accounts and platform activity.'
                : 'Sign in to your ASG wound care ordering portal.'}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4"
          >
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Username</span>
              <input
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1.5"
                placeholder={mode === 'admin' ? 'admin@smbhealth.com' : 'SMB'}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1.5"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {mode === 'client' ? (
              <>
                SMB Health Supply administrator?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('admin')
                    setError('')
                  }}
                  className="text-brand-600 font-medium hover:text-brand-700"
                >
                  Admin sign in
                </button>
              </>
            ) : (
              <>
                ASG client user?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('client')
                    setError('')
                  }}
                  className="text-brand-600 font-medium hover:text-brand-700"
                >
                  Client sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} SMB Health Supply · ASG Client Portal</p>
      </footer>
    </div>
  )
}
