import { C, F } from '../../constants/theme'
import { Ring, Badge, SectionLabel, Card } from '../ui'
import { Icons } from '../ui/Icons'
import type { AppState } from '../../types'
import {
  computeBalance,
  computeRecovery,
  computeMacros,
  computeDailyScore,
  getTodayPriority,
  getStabilityStreakFromState,
} from '../../store/useStore'

interface DashboardProps {
  state:         AppState
  onAddFood:     () => void
  onAddActivity: () => void
  onAddWeight:   () => void
  onAddSleep:    () => void
}

export function Dashboard({ state, onAddFood, onAddActivity, onAddWeight, onAddSleep }: DashboardProps) {
  const { intake, burned, balance, remaining, isDeficit, isOverGoal, goalPct } = computeBalance(state)
  const { protein, carbs, fat } = computeMacros(state.foodLog)
  const recovery = computeRecovery(state)
  const dailyScore = computeDailyScore(state)
  const priority = getTodayPriority(state)
  const stabilityStreak = getStabilityStreakFromState(state)

  const balColor    = isDeficit ? C.green : C.orange
  const recovColor  = recovery >= 75 ? C.green : recovery >= 50 ? C.orange : C.red
  const recovStatus = recovery >= 75 ? 'Optimal' : recovery >= 50 ? 'Moderate' : 'Rest'
  const scoreColor  = dailyScore.score >= 80 ? C.green : dailyScore.score >= 60 ? C.blue : dailyScore.score >= 40 ? C.orange : C.red

  const days    = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const weekBars = [55, 70, 45, 88, 82, 68, recovery]

  const handlePriorityAction = () => {
    if (priority.action === 'sleep') onAddSleep()
    else if (priority.action === 'food') onAddFood()
    else if (priority.action === 'activity') onAddActivity()
    else if (priority.action === 'weight') onAddWeight()
  }

  return (
    <div style={{ paddingBottom: 24, animation: 'pageIn .3s ease-out' }}>

      {/* ── Header ── */}
      <div style={{ padding: '52px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: C.sub, marginBottom: 5 }}>
            {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: F.display, fontSize: 27, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.05 }}>
            System<br/>Overview
          </h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.card, border: `1px solid ${C.b}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.User color={C.sub} size={20} />
          </div>
          <Badge text={recovStatus} color={recovColor} dot />
        </div>
      </div>

      {/* ── Daily System Score ── */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <div style={{
          borderRadius: 20,
          padding: 20,
          background: `${scoreColor}12`,
          border: `1px solid ${scoreColor}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: C.sub, marginBottom: 6 }}>
              System Score
            </div>
            <div style={{ fontFamily: F.display, fontSize: 42, fontWeight: 800, letterSpacing: '-.04em', lineHeight: .95, color: scoreColor }}>
              {dailyScore.score}
              <span style={{ fontFamily: F.mono, fontSize: 18, color: C.sub, fontWeight: 500 }}> / 100</span>
            </div>
            <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: scoreColor, marginTop: 4 }}>
              {dailyScore.label}
            </div>
          </div>
          <Ring size={72} strokeWidth={6} percent={dailyScore.score} color={scoreColor}>
            <span style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 700, color: scoreColor }}>{dailyScore.score}%</span>
          </Ring>
        </div>
        {stabilityStreak > 0 && (
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: C.sub, letterSpacing: '.08em' }}>
              System Stability · <strong style={{ color: C.green }}>{stabilityStreak} days stable</strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Caloric Balance Hero ── */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <div style={{
          borderRadius: 24, padding: 22, position: 'relative', overflow: 'hidden',
          background: isDeficit
            ? 'linear-gradient(135deg,rgba(16,185,129,.1),rgba(59,130,246,.06))'
            : 'linear-gradient(135deg,rgba(245,158,11,.12),rgba(239,68,68,.08))',
          border: `1px solid ${isDeficit ? 'rgba(16,185,129,.3)' : 'rgba(245,158,11,.3)'}`,
        }}>
          {/* Glow blob */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: balColor, filter: 'blur(60px)', opacity: .1, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: C.sub, marginBottom: 8 }}>
                Energy Balance Today
              </div>
              {/* Status pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  padding: '4px 12px', borderRadius: 99,
                  background: isDeficit ? `${C.green}20` : `${C.orange}20`,
                  border: `1px solid ${balColor}40`,
                  fontFamily: F.mono, fontSize: 11, fontWeight: 600,
                  color: balColor, letterSpacing: '.1em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 14 }}>{isDeficit ? '📉' : '📈'}</span>
                  {isDeficit ? 'DEFICIT' : 'SURPLUS'}
                </div>
              </div>
              {/* Big number */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: F.display, fontSize: 50, fontWeight: 800, letterSpacing: '-.04em', lineHeight: .9, color: balColor }}>
                  {Math.abs(balance).toLocaleString()}
                </span>
                <span style={{ fontFamily: F.mono, fontSize: 15, color: C.sub, marginBottom: 4 }}>kcal</span>
              </div>
            </div>

            {/* Ring */}
            <Ring size={88} strokeWidth={7} percent={Math.min(goalPct, 100)} color={isOverGoal ? C.red : balColor}>
              <div>
                <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 800, color: isOverGoal ? C.red : balColor }}>{Math.round(goalPct)}%</div>
                <div style={{ fontFamily: F.mono, fontSize: 8, color: C.sub, textTransform: 'uppercase' }}>of goal</div>
              </div>
            </Ring>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ position: 'relative', height: 8, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                height: '100%',
                width: `${Math.min(goalPct, 100)}%`,
                background: isOverGoal
                  ? `linear-gradient(90deg,${C.orange},${C.red})`
                  : `linear-gradient(90deg,${C.green},${goalPct > 85 ? C.orange : C.blue})`,
                borderRadius: 99,
                transition: 'width 1.2s cubic-bezier(.4,0,.2,1)',
                boxShadow: `0 0 10px ${balColor}60`,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: F.mono, fontSize: 9, color: C.sub }}>0</span>
              <span style={{ fontFamily: F.mono, fontSize: 9, color: isOverGoal ? C.red : balColor, fontWeight: 600 }}>
                {isOverGoal
                  ? `${(intake - state.goals.calorieGoal).toLocaleString()} kcal OVER GOAL`
                  : `${Math.abs(remaining).toLocaleString()} kcal remaining`
                }
              </span>
              <span style={{ fontFamily: F.mono, fontSize: 9, color: C.sub }}>
                Goal {state.goals.calorieGoal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, paddingTop: 12, borderTop: `1px solid rgba(255,255,255,.06)` }}>
            {([
              ['🍽 Eaten',  `${intake.toLocaleString()} kcal`,                   C.text],
              ['🔥 Burned', `${burned.toLocaleString()} kcal`,                   C.orange],
              ['🎯 Target', `${state.goals.calorieGoal.toLocaleString()} kcal`,  C.sub],
            ] as [string, string, string][]).map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: C.sub, fontFamily: F.mono, marginBottom: 3, letterSpacing: '.06em' }}>{l}</div>
                <div style={{ fontFamily: F.display, fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Macro Row ── */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <SectionLabel>Macronutrients</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {([
            ['Protein', Math.round(protein), state.goals.proteinGoal, 'g', C.blue],
            ['Carbs',   Math.round(carbs),   300,                     'g', C.orange],
            ['Fat',     Math.round(fat),      80,                      'g', C.purple],
          ] as [string, number, number, string, string][]).map(([l, v, g, u, c]) => {
            const p = Math.min((v / g) * 100, 100)
            return (
              <Card key={l} accentColor={c} style={{ padding: '12px 10px' }}>
                <div style={{ fontFamily: F.mono, fontSize: 9, color: C.sub, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>{l}</div>
                <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: c }}>
                  {v}<span style={{ fontSize: 11, color: C.sub, fontFamily: F.mono }}>{u}</span>
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 9, color: C.sub, margin: '4px 0 8px' }}>/ {g}{u}</div>
                <div style={{ height: 3, background: 'rgba(255,255,255,.05)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${p}%`, background: c, borderRadius: 99, boxShadow: `0 0 5px ${c}60` }} />
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── 4 Metric Tiles ── */}
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Sleep',   icon: <Icons.Moon color={C.blue} size={13} />,    val: `${state.sleep.hours}h ${state.sleep.mins}m`, sub: `Quality ${state.sleep.quality}%`,          pct: state.sleep.quality,                              ac: C.blue, onClick: onAddSleep },
          { label: 'Fatigue', icon: <Icons.Zap color={C.green} size={13} />,    val: recovery >= 75 ? 'Low' : 'Moderate',          sub: `HRV: ${state.sleep.hrv}ms`,               pct: 20, ac: C.green, vc: recovColor },
          { label: 'Burned',  icon: <Icons.Flame color={C.orange} size={13} />, val: burned.toLocaleString(),                       sub: 'kcal total',                              pct: Math.min((burned / state.goals.calorieGoal) * 100, 100), ac: C.orange },
          { label: 'Protein', icon: <Icons.Drop color={C.purple} size={13} />,  val: `${Math.round(protein)}g`,                    sub: `/ ${state.goals.proteinGoal}g goal`,       pct: Math.min((protein / state.goals.proteinGoal) * 100, 100), ac: C.purple },
        ].map(({ label, icon, val, sub, pct, ac, vc, onClick }) => (
          <Card key={label} accentColor={ac} style={{ padding: 16 }} onClick={onClick}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: C.sub }}>
              {icon}
              <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase' }}>{label}</span>
            </div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1, color: vc ?? C.text }}>{val}</div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 5 }}>{sub}</div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden', marginTop: 12 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: ac, borderRadius: 99, boxShadow: `0 0 6px ${ac}`, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
            </div>
          </Card>
        ))}
      </div>

      {/* ── Recovery Trend ── */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <Card style={{ padding: 20 }}>
          <SectionLabel>7-Day Recovery</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 56 }}>
            {weekBars.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{
                    width: '100%', height: `${h}%`,
                    background: i === 6 ? C.blue : `${C.blue}25`,
                    borderRadius: '4px 4px 0 0',
                    boxShadow: i === 6 ? `0 0 10px ${C.blue}60` : undefined,
                    transition: 'height .8s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
                <span style={{ fontFamily: F.mono, fontSize: 9, color: i === 6 ? C.blue : C.muted }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── TODAY PRIORITY (single) ── */}
      <div style={{ padding: '0 20px' }}>
        <SectionLabel>Today Priority</SectionLabel>
        <Card
          onClick={priority.action ? handlePriorityAction : undefined}
          style={{
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            border: `1px solid ${priority.color}30`,
            background: `${priority.color}12`,
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${priority.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {priority.action === 'sleep' && <Icons.Moon color={priority.color} size={20} />}
            {priority.action === 'food' && <Icons.Food color={priority.color} size={20} />}
            {priority.action === 'activity' && <Icons.Dumbbell color={priority.color} size={20} />}
            {priority.action === 'weight' && <Icons.BarChart color={priority.color} size={20} />}
            {!priority.action && <Icons.Heart color={priority.color} size={20} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: priority.color }}>
              {priority.title}
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
              {priority.subtitle}
            </div>
          </div>
          {priority.action && <Icons.ChevronRight color={C.muted} size={15} />}
        </Card>
      </div>
    </div>
  )
}
