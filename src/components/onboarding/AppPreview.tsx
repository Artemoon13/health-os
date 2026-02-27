import { useState, useEffect } from 'react'
import { C, F } from '../../constants/theme'

type PreviewType = 'balance' | 'decisions' | 'recovery' | 'sleep'

interface AppPreviewProps {
  type: PreviewType
}

// Ticks every 1200ms to animate values
function useTick() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1200)
    return () => clearInterval(t)
  }, [])
  return tick
}

export function AppPreview({ type }: AppPreviewProps) {
  const tick = useTick()
  const p0 = tick % 2 === 0
  const p1 = tick % 3 === 0
  const p2 = tick % 4 === 0
  const p3 = tick % 5 === 0
  const p4 = tick % 2 === 1

  if (type === 'balance') return (
    <div style={{ width: '100%', background: C.card, borderRadius: 20, padding: 18, border: `1px solid ${C.b}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: C.green, borderRadius: '50%', filter: 'blur(50px)', opacity: .12 }} />
      <div style={{ fontSize: 10, fontFamily: F.mono, color: C.sub, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 8 }}>Energy Balance</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
        <span style={{ fontFamily: F.display, fontSize: 40, fontWeight: 800, color: C.green, letterSpacing: '-.04em', transition: 'all .6s' }}>
          ↓ {p0 ? '420' : '380'}
        </span>
        <span style={{ fontFamily: F.mono, fontSize: 14, color: C.sub }}>kcal deficit</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: p0 ? '68%' : '62%', background: `linear-gradient(90deg,${C.green},${C.blue})`, borderRadius: 99, transition: 'width 1.2s ease', boxShadow: `0 0 10px ${C.green}60` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        {([['Consumed', p1 ? '1,840' : '1,920', 'kcal', C.text], ['Burned', p0 ? '2,260' : '2,220', 'kcal', C.orange], ['Goal', p2 ? '2,400' : '2,350', 'kcal', C.sub]] as [string, string, string, string][]).map(([l, v, u, c]) => (
          <div key={l}>
            <div style={{ fontSize: 9, fontFamily: F.mono, color: C.sub, textTransform: 'uppercase', letterSpacing: '.1em' }}>{l}</div>
            <div style={{ fontSize: 13, fontFamily: F.display, fontWeight: 700, color: c, marginTop: 2, transition: 'color .6s' }}>{v} {u}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{ fontFamily: F.mono, fontSize: 10, color: C.sub }}>Protein <span style={{ color: C.blue, fontWeight: 600 }}>{p3 ? '142' : '138'}g</span></span>
        <span style={{ fontFamily: F.mono, fontSize: 10, color: C.sub }}>· Steps <span style={{ color: C.purple, fontWeight: 600 }}>{p4 ? '8,420' : '7,890'}</span></span>
      </div>
    </div>
  )

  if (type === 'recovery') return (
    <div style={{ width: '100%', background: C.card, borderRadius: 20, padding: 18, border: `1px solid ${C.b}`, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
        <svg width={80} height={80}>
          <circle cx={40} cy={40} r={32} stroke="rgba(255,255,255,.05)" strokeWidth={7} fill="none" />
          <circle cx={40} cy={40} r={32} stroke={p0 ? C.green : C.blue} strokeWidth={7} fill="none"
            strokeDasharray={201} strokeDashoffset={p0 ? 36 : 50} strokeLinecap="round"
            transform="rotate(-90 40 40)"
            style={{ transition: 'all 1.2s ease', filter: `drop-shadow(0 0 6px ${C.green}80)` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 800, color: p0 ? C.green : C.blue, transition: 'color 1.2s' }}>{p0 ? '82%' : '79%'}</span>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: F.mono, fontSize: 9, color: C.sub, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>System Readiness</div>
        <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, marginBottom: 4, transition: 'opacity .6s' }}>{p1 ? 'Optimal' : 'Ready'}</div>
        <div style={{ fontSize: 12, color: C.sub }}>
          HRV <span style={{ color: C.green, fontWeight: 600 }}>{p2 ? '64' : '61'}ms</span> · RHR <span style={{ color: C.pink, fontWeight: 600 }}>{p3 ? '52' : '54'}bpm</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: C.muted }}>Sleep {p4 ? '7h 42m' : '7h 28m'}</div>
        <div style={{ marginTop: 8, padding: '5px 10px', background: `${C.green}15`, border: `1px solid ${C.green}30`, borderRadius: 8, display: 'inline-block' }}>
          <span style={{ fontSize: 11, color: C.green, fontFamily: F.mono, letterSpacing: '.06em' }}>{p0 ? 'Strength training ✓' : 'Light cardio ✓'}</span>
        </div>
      </div>
    </div>
  )

  if (type === 'decisions') return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { icon: '💪', title: `Train at ${p0 ? '85' : '80'}% intensity`, sub: 'HRV supports heavy load today', c: C.blue, active: true },
        { icon: '🥗', title: `${p1 ? '560' : '480'} kcal remaining`, sub: `High protein · ${p2 ? '142' : '138'}g today`, c: C.green, active: p1 },
        { icon: '💧', title: `Drink ${p3 ? '2' : '3'} more glasses`, sub: `You're at ${p4 ? '75' : '68'}% hydration`, c: C.blue, active: false },
      ].map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px',
          background: item.active ? `${item.c}12` : C.card,
          border: `1px solid ${item.active ? item.c + '30' : C.b}`,
          borderRadius: 14, transition: 'all .6s',
        }}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <div>
            <div style={{ fontFamily: F.display, fontSize: 13, fontWeight: 600 }}>{item.title}</div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )

  if (type === 'sleep') return (
    <div style={{ width: '100%', background: C.card, borderRadius: 20, padding: 18, border: `1px solid ${C.b}` }}>
      <div style={{ fontFamily: F.mono, fontSize: 9, color: C.sub, textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 8 }}>Sleep Architecture</div>
      <div style={{ fontSize: 14, fontFamily: F.display, fontWeight: 700, color: C.blue, marginBottom: 12, transition: 'opacity .6s' }}>Total {p0 ? '7h 42m' : '7h 28m'}</div>
      {([
        ['Deep', p1 ? '22' : '20', C.purple, p1 ? 22 : 20],
        ['REM', p2 ? '27' : '25', C.blue, p2 ? 27 : 25],
        ['Light', p3 ? '46' : '48', C.sub, p3 ? 46 : 48],
        ['Awake', p4 ? '5' : '7', C.orange, p4 ? 5 : 7],
      ] as [string, string, string, number][]).map(([s, p, c, w]) => (
        <div key={s} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: C.sub }}>{s}</span>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: c, transition: 'color .6s' }}>{p}%</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,.04)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${w}%`, background: c, borderRadius: 99, boxShadow: `0 0 5px ${c}60`, transition: 'width 1.2s ease' }} />
          </div>
        </div>
      ))}
    </div>
  )

  return null
}
