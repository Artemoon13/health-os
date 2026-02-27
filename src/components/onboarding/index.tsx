import { useState, useEffect } from 'react'
import { C, F } from '../../constants/theme'
import { INTEGRATIONS } from '../../constants/data'
import type { GoalType, ActivityLevel } from '../../types'

// ─── ConnectScreen ────────────────────────────────────────────────────────────

interface ConnectScreenProps { onNext: () => void }

export function ConnectScreen({ onNext }: ConnectScreenProps) {
  const [connected, setConnected] = useState<Record<string, boolean>>({})
  const [connecting, setConnecting] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t) }, [])

  function handleConnect(id: string) {
    setConnecting(id)
    setTimeout(() => { setConnected(p => ({ ...p, [id]: true })); setConnecting(null) }, 1200)
  }

  const connectedCount = Object.keys(connected).length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px 36px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: C.purple, filter: 'blur(80px)', opacity: .07, pointerEvents: 'none' }} />

      <div style={{ paddingTop: 56, marginBottom: 20, opacity: visible ? 1 : 0, transition: 'opacity .4s ease .1s' }}>
        <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '.2em', color: C.purple, textTransform: 'uppercase', marginBottom: 10 }}>STEP 1 OF 3</div>
        <h1 style={{ fontFamily: F.display, fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.05 }}>Connect your<br/>devices & apps</h1>
        <p style={{ fontSize: 14, color: C.sub, marginTop: 10, lineHeight: 1.6 }}>Import your data automatically. Skip any — you can add manually.</p>
      </div>

      <div className="scroll-hidden" style={{ flex: 1, overflowY: 'auto', opacity: visible ? 1 : 0, transition: 'opacity .4s ease .2s' }}>
        {INTEGRATIONS.map((ig, i) => {
          const isConn = connected[ig.id]
          const isConnecting = connecting === ig.id
          return (
            <div key={ig.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px',
              background: isConn ? `${ig.color}0E` : C.card,
              border: `1px solid ${isConn ? ig.color + '30' : C.b}`,
              borderRadius: 16, marginBottom: 10, transition: 'all .4s',
              opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(8px)',
              transitionDelay: `${i * 0.06 + 0.2}s`,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${ig.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {ig.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600 }}>{ig.name}</span>
                  {ig.note && <span style={{ fontFamily: F.mono, fontSize: 8, color: C.sub, padding: '2px 6px', background: 'rgba(255,255,255,.05)', borderRadius: 99 }}>{ig.note}</span>}
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{ig.desc}</div>
              </div>
              <button onClick={() => !isConn && handleConnect(ig.id)} style={{
                padding: '7px 14px', borderRadius: 10,
                border: `1px solid ${isConn ? ig.color + '40' : C.bHi}`,
                background: isConn ? `${ig.color}18` : 'transparent',
                color: isConn ? ig.color : C.sub,
                fontFamily: F.mono, fontSize: 10, letterSpacing: '.06em',
                cursor: isConn ? 'default' : 'pointer', transition: 'all .3s',
                whiteSpace: 'nowrap', minWidth: 72, textAlign: 'center',
              }}>
                {isConnecting ? '···' : isConn ? '✓ Done' : 'Connect'}
              </button>
            </div>
          )
        })}
      </div>

      <button onClick={onNext} style={{
        width: '100%', padding: '16px', marginTop: 12,
        background: `linear-gradient(135deg,${C.blue},${C.purple})`,
        border: 'none', borderRadius: 16, color: '#fff',
        fontFamily: F.display, fontSize: 17, fontWeight: 700, cursor: 'pointer',
        boxShadow: `0 8px 32px ${C.blue}30`,
        opacity: visible ? 1 : 0, transition: 'opacity .4s ease .5s',
      }}>
        {connectedCount > 0 ? `Continue with ${connectedCount} connected →` : 'Skip for now →'}
      </button>
    </div>
  )
}

// ─── SetupGoals ───────────────────────────────────────────────────────────────

interface SetupGoalsProps {
  onNext: (data: { weight: string; height: string; age: string; goal: GoalType; activity: ActivityLevel }) => void
}

export function SetupGoals({ onNext }: SetupGoalsProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ weight: '', height: '', age: '', goal: 'lose' as GoalType, activity: 'moderate' as ActivityLevel })
  const [visible, setVisible] = useState(false)

  useEffect(() => { setVisible(false); const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t) }, [step])

  const goals = [
    { id: 'lose' as GoalType,        label: 'Lose Weight',  icon: '📉', desc: 'Caloric deficit focus' },
    { id: 'maintain' as GoalType,    label: 'Stay Lean',    icon: '⚖️', desc: 'Maintenance calories' },
    { id: 'gain' as GoalType,        label: 'Gain Muscle',  icon: '💪', desc: 'Caloric surplus + protein' },
    { id: 'performance' as GoalType, label: 'Performance',  icon: '🏆', desc: 'Optimize for training' },
  ]

  const activities = [
    { id: 'sedentary' as ActivityLevel, label: 'Sedentary', desc: 'Desk job, no sport' },
    { id: 'light' as ActivityLevel,     label: 'Light',     desc: '1–3x per week' },
    { id: 'moderate' as ActivityLevel,  label: 'Moderate',  desc: '3–5x per week' },
    { id: 'active' as ActivityLevel,    label: 'Very Active', desc: '6–7x or physical job' },
  ]

  const steps = [
    {
      title: 'Your body\nright now.',
      sub:   'Used to calculate your TDEE — total daily calorie burn.',
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {([['Weight (kg)', 'weight', '84'], ['Height (cm)', 'height', '182']] as [string, keyof typeof data, string][]).map(([l, k, ph]) => (
              <div key={k}>
                <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>{l}</label>
                <input value={data[k] as string} onChange={e => setData(p => ({ ...p, [k]: e.target.value }))}
                  placeholder={ph} type="number"
                  style={{ width: '100%', padding: '13px 16px', background: C.card, border: `1px solid ${C.b}`, borderRadius: 12, color: C.text, fontFamily: F.display, fontSize: 18, fontWeight: 700, outline: 'none' }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>Age</label>
            <input value={data.age} onChange={e => setData(p => ({ ...p, age: e.target.value }))}
              placeholder="28" type="number"
              style={{ width: '100%', padding: '13px 16px', background: C.card, border: `1px solid ${C.b}`, borderRadius: 12, color: C.text, fontFamily: F.display, fontSize: 18, fontWeight: 700, outline: 'none' }} />
          </div>
        </div>
      ),
    },
    {
      title: "What's your\nmain goal?",
      sub:   'This sets your calorie target and macro split.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {goals.map(g => (
            <div key={g.id} onClick={() => setData(p => ({ ...p, goal: g.id }))} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              background: data.goal === g.id ? `${C.blue}12` : C.card,
              border: `1px solid ${data.goal === g.id ? C.blue + '40' : C.b}`,
              borderRadius: 14, cursor: 'pointer', transition: 'all .2s',
            }}>
              <span style={{ fontSize: 24 }}>{g.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700 }}>{g.label}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{g.desc}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${data.goal === g.id ? C.blue : C.b}`, background: data.goal === g.id ? C.blue : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                {data.goal === g.id && <span style={{ fontSize: 10, color: '#fff' }}>✓</span>}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'How active\nare you?',
      sub:   'This multiplies your base metabolism for accurate calorie targets.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activities.map(a => (
            <div key={a.id} onClick={() => setData(p => ({ ...p, activity: a.id }))} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px',
              background: data.activity === a.id ? `${C.green}10` : C.card,
              border: `1px solid ${data.activity === a.id ? C.green + '40' : C.b}`,
              borderRadius: 14, cursor: 'pointer', transition: 'all .2s',
            }}>
              <div>
                <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{a.desc}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${data.activity === a.id ? C.green : C.b}`, background: data.activity === a.id ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                {data.activity === a.id && <span style={{ fontSize: 10, color: '#fff' }}>✓</span>}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ]

  const isLast = step === steps.length - 1
  const current = steps[step]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px 36px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: C.green, filter: 'blur(80px)', opacity: .06, pointerEvents: 'none' }} />

      {/* Progress bar */}
      <div style={{ paddingTop: 56, display: 'flex', gap: 6, marginBottom: 20, opacity: visible ? 1 : 0, transition: 'opacity .3s' }}>
        {steps.map((_, i) => (
          <div key={i} style={{ height: 4, flex: i === step ? 3 : 1, background: i === step ? C.green : i < step ? `${C.green}60` : C.b, borderRadius: 99, transition: 'all .4s ease' }} />
        ))}
      </div>

      <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateX(20px)', transition: 'all .4s ease', marginBottom: 16 }}>
        <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '.18em', color: C.green, textTransform: 'uppercase', marginBottom: 8 }}>
          STEP {step + 2} OF 3
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.05, whiteSpace: 'pre-line' }}>
          {current.title}
        </h1>
        <p style={{ fontSize: 14, color: C.sub, marginTop: 8, lineHeight: 1.6 }}>{current.sub}</p>
      </div>

      <div className="scroll-hidden" style={{ flex: 1, overflowY: 'auto', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)', transition: 'all .4s ease .1s' }}>
        {current.content}
      </div>

      <button onClick={() => isLast ? onNext(data) : setStep(s => s + 1)} style={{
        width: '100%', padding: '16px', marginTop: 16,
        background: isLast ? `linear-gradient(135deg,${C.green},${C.blue})` : `linear-gradient(135deg,${C.blue},#2563EB)`,
        border: 'none', borderRadius: 16, color: '#fff',
        fontFamily: F.display, fontSize: 17, fontWeight: 700, cursor: 'pointer',
        boxShadow: `0 8px 32px ${C.blue}30`,
      }}>
        {isLast ? 'Build My Plan →' : 'Next →'}
      </button>
    </div>
  )
}

// ─── Paywall ──────────────────────────────────────────────────────────────────

interface PaywallProps {
  onStartTrial: () => void
  onSkip: () => void
}

export function Paywall({ onStartTrial, onSkip }: PaywallProps) {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [visible, setVisible] = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t) }, [])

  const features = [
    { icon: '🧠', text: 'AI-powered daily decisions' },
    { icon: '📊', text: 'Full analytics & trend charts' },
    { icon: '🔄', text: 'Wearable & app sync' },
    { icon: '💡', text: 'Recovery score & fatigue model' },
    { icon: '🍽', text: 'Smart food logging' },
    { icon: '📈', text: 'Weight trend & body comp' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 0 36px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg,rgba(59,130,246,.08) 0%,transparent 50%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 340, height: 340, borderRadius: '50%', background: C.blue, filter: 'blur(100px)', opacity: .08, pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ padding: '56px 24px 0', opacity: visible ? 1 : 0, transition: 'opacity .4s ease', textAlign: 'center', marginBottom: 6 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg,${C.blue},${C.purple})`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: `0 8px 24px ${C.blue}40` }}>⚡</div>
        <h1 style={{ fontFamily: F.display, fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.05, marginBottom: 10 }}>
          Health OS{' '}
          <span style={{ backgroundImage: `linear-gradient(135deg,${C.blue},${C.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pro</span>
        </h1>
        <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.6 }}>Less than a cup of coffee a month.<br/>More than a personal trainer ever could.</p>
      </div>

      {/* Feature grid + Plan toggle */}
      <div className="scroll-hidden" style={{ padding: '16px 24px 0', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: '12px', background: C.card, border: `1px solid ${C.b}`, borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(8px)',
              transition: `all .4s ease ${i * 0.05 + 0.2}s`,
            }}>
              <span style={{ fontSize: 18 }}>{f.icon}</span>
              <span style={{ fontSize: 12, color: C.sub, lineHeight: 1.4 }}>{f.text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {([
            { id: 'monthly' as const, price: '$2.99', period: '/month', label: 'Monthly', badge: null, total: null },
            { id: 'yearly'  as const, price: '$1.99', period: '/month', label: 'Yearly',  badge: 'SAVE 33%', total: '$23.99/year' },
          ]).map(p => (
            <div key={p.id} onClick={() => setPlan(p.id)} style={{
              flex: 1, padding: '14px',
              background: plan === p.id ? `${C.blue}15` : C.card,
              border: `2px solid ${plan === p.id ? C.blue : C.b}`,
              borderRadius: 16, cursor: 'pointer', transition: 'all .2s',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              {p.badge && <div style={{ position: 'absolute', top: 0, right: 0, background: C.green, padding: '3px 8px', borderRadius: '0 14px 0 10px', fontSize: 8, fontFamily: F.mono, color: '#fff', fontWeight: 600 }}>{p.badge}</div>}
              <div style={{ fontFamily: F.mono, fontSize: 9, color: C.sub, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{p.label}</div>
              <div style={{ fontFamily: F.display, fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', color: plan === p.id ? C.blue : C.text }}>{p.price}</div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: C.sub }}>{p.period}</div>
              {p.total && <div style={{ fontSize: 10, color: C.sub, marginTop: 4 }}>{p.total}</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <button onClick={onStartTrial} style={{
          width: '100%', padding: '17px', marginBottom: 10,
          background: `linear-gradient(135deg,${C.blue},${C.purple})`,
          border: 'none', borderRadius: 16, color: '#fff',
          fontFamily: F.display, fontSize: 17, fontWeight: 700, cursor: 'pointer',
          boxShadow: `0 8px 32px ${C.blue}40`,
          opacity: visible ? 1 : 0, transition: 'opacity .4s ease .6s',
        }}>
          Start Free 7-Day Trial →
        </button>
        <button onClick={onSkip} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: C.sub, fontFamily: F.mono, fontSize: 11, letterSpacing: '.06em', cursor: 'pointer', textTransform: 'uppercase' }}>
          Continue with free plan
        </button>
        <p style={{ textAlign: 'center', fontSize: 10, color: C.muted, marginTop: 8, fontFamily: F.mono, lineHeight: 1.6 }}>
          Cancel anytime · No charge during trial
        </p>
      </div>
    </div>
  )
}
