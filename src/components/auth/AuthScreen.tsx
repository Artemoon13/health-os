import { useState } from 'react'
import { C, F } from '../../constants/theme'
import { Input } from '../ui'
import { track } from '../../lib/analytics'
import type { OAuthProvider } from '../../lib/useAuth'

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>
  onSignUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>
  onSignInWithOAuth?: (provider: OAuthProvider) => Promise<{ error: Error | null }>
}

export function AuthScreen({ onSignIn, onSignUp, onSignInWithOAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleOAuth(provider: OAuthProvider) {
    if (!onSignInWithOAuth) return
    setError(null)
    setOauthLoading(provider)
    const { error: err } = await onSignInWithOAuth(provider)
    if (err) {
      setError(err.message)
      setOauthLoading(null)
    }
    // else: redirect happens
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'in') {
        const { error: err } = await onSignIn(email, password)
        if (err) setError(err.message)
      } else {
        const { error: err } = await onSignUp(email, password, name || undefined)
        if (err) setError(err.message)
        else {
          track('sign_up', { method: 'email' })
          setMessage('Check your email to confirm, then sign in.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: 24, maxWidth: 360, margin: '0 auto',
    }}>
      <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        Health OS
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 11, color: C.sub, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>
        Sign in to sync across devices
      </div>

      {onSignInWithOAuth && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => handleOAuth('apple')}
            disabled={!!oauthLoading}
            style={{
              width: '100%', padding: 14, background: '#000', color: '#fff', border: 'none', borderRadius: 14,
              fontFamily: F.display, fontSize: 16, fontWeight: 700, cursor: oauthLoading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {oauthLoading === 'apple' ? '…' : '🍎 Continue with Apple'}
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={!!oauthLoading}
            style={{
              width: '100%', padding: 14, background: C.card, color: C.text, border: `1px solid ${C.b}`, borderRadius: 14,
              fontFamily: F.display, fontSize: 16, fontWeight: 700, cursor: oauthLoading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {oauthLoading === 'google' ? '…' : 'Continue with Google'}
          </button>
        </div>
      )}

      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.sub, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>
        Or with email
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'up' && (
          <div style={{ marginBottom: 14 }}>
            <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div style={{ marginBottom: 20 }}>
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: 12, background: `${C.red}18`, border: `1px solid ${C.red}40`, borderRadius: 12, fontSize: 13, color: C.red }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ marginBottom: 16, padding: 12, background: `${C.green}18`, border: `1px solid ${C.green}40`, borderRadius: 12, fontSize: 13, color: C.green }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: 14, background: C.blue, border: 'none', borderRadius: 14,
            color: '#fff', fontFamily: F.display, fontSize: 16, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? '…' : mode === 'in' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => { setMode(m => m === 'in' ? 'up' : 'in'); setError(null); setMessage(null); }}
        style={{
          marginTop: 20, background: 'none', border: 'none', color: C.sub, fontFamily: F.mono, fontSize: 12,
          cursor: 'pointer', textDecoration: 'underline',
        }}
      >
        {mode === 'in' ? 'Create account' : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}
