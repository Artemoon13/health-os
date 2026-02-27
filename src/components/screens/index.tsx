import { C, F } from '../../constants/theme'
import { Ring, Badge, FBar, SectionLabel, Card, Button } from '../ui'
import { Icons } from '../ui/Icons'
import { EmptyState } from '../ui/EmptyState'
import type { AppState } from '../../types'
import { computeBalance, computeRecovery, computeMacros } from '../../store/useStore'
import { S } from '../../constants/strings'

// ─── Shared page header ───────────────────────────────────────────────────────

function PageHeader({ label, title, action }: { label: string; title: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: '52px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: C.sub, marginBottom: 5 }}>{label}</div>
        <h1 style={{ fontFamily: F.display, fontSize: 27, fontWeight: 800, letterSpacing: '-.025em', lineHeight: 1.05, whiteSpace: 'pre-line' }}>{title}</h1>
      </div>
      {action}
    </div>
  )
}

// ─── NUTRITION ────────────────────────────────────────────────────────────────

interface NutritionProps {
  state:     AppState
  onAddFood: () => void
  onEditFood?: (id: number) => void
  onDelete:  (id: number) => void
  setWater:  (v: number | ((p: number) => number)) => void
}

export function Nutrition({ state, onAddFood, onEditFood, onDelete, setWater }: NutritionProps) {
  const { intake, isOverGoal, goalPct } = computeBalance(state)
  const { protein, carbs, fat } = computeMacros(state.foodLog)

  // Group food log by meal type
  const groups: Record<string, typeof state.foodLog> = {}
  state.foodLog.forEach(f => { if (!groups[f.mealType]) groups[f.mealType] = []; groups[f.mealType].push(f) })

  return (
    <div style={{ paddingBottom: 24, animation: 'pageIn .3s ease-out' }}>
      <PageHeader
        label="Nutrition"
        title={`Energy\nControl`}
        action={
          <button onClick={onAddFood} style={{ width: 42, height: 42, borderRadius: '50%', background: C.blue, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Plus color="#fff" size={18} />
          </button>
        }
      />

      {/* Intake summary card */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <Card style={{ padding: 20, border: `1px solid ${isOverGoal ? 'rgba(239,68,68,.3)' : C.b}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: C.sub, marginBottom: 8 }}>Today's Intake</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: F.display, fontSize: 38, fontWeight: 800, letterSpacing: '-.03em', color: isOverGoal ? C.red : C.text }}>{intake.toLocaleString()}</span>
                <span style={{ fontFamily: F.mono, color: C.sub, fontSize: 14 }}>/ {state.goals.calorieGoal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <Badge text={isOverGoal ? `${(intake - state.goals.calorieGoal).toLocaleString()} OVER` : `${(state.goals.calorieGoal - intake).toLocaleString()} LEFT`} color={isOverGoal ? C.red : C.green} />
              </div>
            </div>
            <Ring size={80} strokeWidth={6} percent={Math.min(goalPct, 100)} color={isOverGoal ? C.red : C.green}>
              <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: isOverGoal ? C.red : C.green }}>{Math.round(goalPct)}%</span>
            </Ring>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ height: '100%', width: `${Math.min(goalPct, 100)}%`, background: isOverGoal ? `linear-gradient(90deg,${C.orange},${C.red})` : `linear-gradient(90deg,${C.green},${C.blue})`, borderRadius: 99, transition: 'width 1.2s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([['Protein', Math.round(protein) + 'g', C.blue], ['Carbs', Math.round(carbs) + 'g', C.orange], ['Fat', Math.round(fat) + 'g', C.purple]] as [string, string, string][]).map(([l, v, c]) => (
              <div key={l} style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: `1px solid ${C.b}`, borderRadius: 12, padding: 10, textAlign: 'center' }}>
                <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontFamily: F.mono, fontSize: 9, textTransform: 'uppercase', color: C.sub, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Water tracker */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <SectionLabel>{S.hydration}</SectionLabel>
        <Card style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 800 }}>
                {(state.water * 250).toLocaleString()}
                <span style={{ fontFamily: F.mono, fontSize: 12, color: C.sub }}> ml</span>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, marginLeft: 6 }}>({state.water} glasses)</span>
              </div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
                Goal: {state.goals.waterGoal.toLocaleString()} ml ({(state.goals.waterGoal / 250).toFixed(0)} glasses)
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setWater(w => Math.max(0, w - 1))} style={{ width: 38, height: 38, borderRadius: 10, background: C.card, border: `1px solid ${C.b}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.X color={C.sub} size={14} />
              </button>
              <button onClick={() => setWater(w => w + 1)} style={{ width: 38, height: 38, borderRadius: 10, background: `${C.blue}20`, border: `1px solid ${C.blue}50`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Drop color={C.blue} size={14} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: Math.ceil(state.goals.waterGoal / 250) }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 22, borderRadius: 6, background: i < state.water ? `${C.blue}70` : 'rgba(255,255,255,.04)', border: `1px solid ${i < state.water ? C.blue + '40' : C.b}`, transition: 'all .2s' }} />
            ))}
          </div>
        </Card>
      </div>

      {/* Food log */}
      <div style={{ padding: '0 20px' }}>
        <SectionLabel>{S.foodLog}</SectionLabel>
        {state.foodLog.length === 0 ? (
          <EmptyState emoji="🍽" title={S.noFoodLogged} subtitle={S.addFirstMeal} actionLabel={S.addMeal} onAction={onAddFood} />
        ) : (
          <Card style={{ overflow: 'hidden' }}>
            {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(mt => groups[mt] ? (
              <div key={mt}>
                <div style={{ padding: '10px 18px 6px', background: 'rgba(255,255,255,.02)' }}>
                  <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: C.blue }}>{mt}</span>
                </div>
                {groups[mt].map(f => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: `1px solid ${C.b}` }}>
                    <div style={{ flex: 1, cursor: onEditFood ? 'pointer' : undefined }} onClick={() => onEditFood?.(f.id)}>
                      <div style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600 }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: C.sub, marginTop: 2, fontFamily: F.mono }}>{f.time} · P:{f.protein}g · C:{f.carbs}g · F:{f.fat}g</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.orange }}>{f.kcal}</div>
                        <div style={{ fontSize: 10, fontFamily: F.mono, color: C.sub }}>kcal</div>
                      </div>
                      {onEditFood && (
                        <button onClick={(e) => { e.stopPropagation(); onEditFood(f.id) }} style={{ width: 28, height: 28, borderRadius: 8, background: `${C.blue}18`, border: `1px solid ${C.blue}40`, color: C.blue, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                          <Icons.Pencil color={C.blue} size={13} />
                        </button>
                      )}
                      <button onClick={() => onDelete(f.id)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: C.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.Trash color={C.red} size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null)}
          </Card>
        )}
      </div>
    </div>
  )
}

// ─── ACTIVITY ─────────────────────────────────────────────────────────────────

interface ActivityProps {
  state:         AppState
  onAddActivity: () => void
  onEditActivity?: (id: number) => void
  onDelete:      (id: number) => void
}

export function Activity({ state, onAddActivity, onEditActivity, onDelete }: ActivityProps) {
  const burned = 350 + state.activities.reduce((s, a) => s + a.kcalBurned, 0)

  return (
    <div style={{ paddingBottom: 24, animation: 'pageIn .3s ease-out' }}>
      <PageHeader
        label="Activity"
        title={`Burn\nAnalysis`}
        action={
          <button onClick={onAddActivity} style={{ width: 42, height: 42, borderRadius: '50%', background: `${C.orange}20`, border: `1px solid ${C.orange}40`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Plus color={C.orange} size={18} />
          </button>
        }
      />

      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontFamily: F.mono, fontSize: 9, color: C.sub, textTransform: 'uppercase', letterSpacing: '.18em', marginBottom: 8 }}>Total Burned Today</div>
          <div style={{ fontFamily: F.display, fontSize: 44, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1, color: C.orange }}>{burned.toLocaleString()}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Badge text="Base 350 kcal" color={C.sub} />
            <Badge text={`Activities +${burned - 350} kcal`} color={C.orange} />
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 20px' }}>
        <SectionLabel>{S.sessionLog}</SectionLabel>
        {state.activities.length === 0 ? (
          <EmptyState emoji="🏋️" title={S.noActivitiesToday} subtitle={S.logWorkoutHint} actionLabel={S.logActivity} onAction={onAddActivity} />
        ) : (
          <Card style={{ overflow: 'hidden' }}>
            {state.activities.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: i < state.activities.length - 1 ? `1px solid ${C.b}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: onEditActivity ? 'pointer' : undefined }} onClick={() => onEditActivity?.(a.id)}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${C.orange}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.Dumbbell color={C.orange} size={16} />
                  </div>
                  <div>
                    <div style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600 }}>{a.type}</div>
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{a.time} · {a.duration}min · {a.intensity}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: C.orange }}>{a.kcalBurned}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 9, color: C.sub }}>kcal</div>
                  </div>
                  {onEditActivity && (
                    <button onClick={(e) => { e.stopPropagation(); onEditActivity(a.id) }} style={{ width: 28, height: 28, borderRadius: 8, background: `${C.blue}18`, border: `1px solid ${C.blue}40`, color: C.blue, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                      <Icons.Pencil color={C.blue} size={13} />
                    </button>
                  )}
                  <button onClick={() => onDelete(a.id)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: C.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.Trash color={C.red} size={13} />
                  </button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}

// ─── RECOVERY ────────────────────────────────────────────────────────────────

interface RecoveryProps { state: AppState }

export function Recovery({ state }: RecoveryProps) {
  const score = computeRecovery(state)
  const color  = score >= 75 ? C.green : score >= 50 ? C.orange : C.red
  const status = score >= 75 ? 'Optimal' : score >= 50 ? 'Moderate' : 'Rest'

  return (
    <div style={{ paddingBottom: 24, animation: 'pageIn .3s ease-out' }}>
      <PageHeader label="Recovery" title={`System\nReadiness`} action={<Badge text={status} color={color} dot />} />

      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 20px', marginBottom: 22 }}>
        <Ring size={190} strokeWidth={13} percent={score} color={color}>
          <div>
            <div style={{ fontFamily: F.display, fontSize: 52, fontWeight: 800, letterSpacing: '-.04em', lineHeight: .9 }}>{score}%</div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 6 }}>{status}</div>
          </div>
        </Ring>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', gap: 10, marginBottom: 18 }}>
        {([['RHR', `${state.sleep.rhr} bpm`, C.pink], ['HRV', `${state.sleep.hrv}ms`, C.green], ['Sleep', `${state.sleep.quality}%`, C.blue], ['Hours', `${state.sleep.hours}h`, C.purple]] as [string, string, string][]).map(([l, v, c]) => (
          <div key={l} style={{ flex: 1, background: C.card, border: `1px solid ${C.b}`, borderRadius: 14, padding: '10px 6px', textAlign: 'center' }}>
            <div style={{ fontFamily: F.mono, fontSize: 8, color: C.sub, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>{l}</div>
            <div style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <Card style={{ padding: 20 }}>
          <SectionLabel>Fatigue Model</SectionLabel>
          <FBar label="CNS Fatigue"    value={20} color={C.green} />
          <FBar label="Muscular Load"  value={Math.min(65 + state.activities.length * 10, 90)} color={C.blue} />
          <FBar label="Stress Level"   value={30} color={C.orange} />
          <FBar label="Cardiovascular" value={45} color={C.purple} />
        </Card>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ background: `${color}0F`, border: `1px solid ${color}30`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontFamily: F.mono, fontSize: 9, color, textTransform: 'uppercase', letterSpacing: '.14em', marginBottom: 8 }}>Recommendation</div>
          <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            {getRecoveryTitle(score, state.sleep.hours)}
          </div>
          <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
            {getRecoverySubtext(score, state.sleep.hours, state.sleep.quality)}
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.b}`, fontSize: 11, color: C.muted }}>
            Connect Garmin (Profile → Integrations) for real HRV & sleep data.
          </div>
        </div>
      </div>
    </div>
  )
}

function getRecoveryTitle(score: number, sleepHours: number): string {
  if (sleepHours < 5) return 'Prioritize sleep first'
  if (score >= 75) return 'Strength Training OK'
  if (score >= 50) return 'Light Training Only'
  return 'Full Rest Day'
}

function getRecoverySubtext(score: number, sleepHours: number, quality: number): string {
  if (sleepHours < 5) return 'Under 5h sleep — recovery will be limited. Aim for 7–8h and re-check tomorrow.'
  if (quality < 40 && score < 70) return 'Sleep quality was low. Prefer light movement and avoid heavy loads.'
  if (score >= 75) return `Readiness ${score}%. Good day for compound lifts and intensity.`
  if (score >= 50) return 'Stick to light cardio or mobility. Avoid heavy loading.'
  return 'Focus on sleep and nutrition. Skip intense training today.'
}

// ─── STATS ────────────────────────────────────────────────────────────────────

interface StatsProps {
  state: AppState
  onEditWeight?: (id: number) => void
  onDeleteWeight?: (id: number) => void
}

export function Stats({ state, onEditWeight, onDeleteWeight }: StatsProps) {
  const { intake, burned, balance } = computeBalance(state)
  const weekData = [
    { d: 'M', rec: 40, bal: -250 }, { d: 'T', rec: 60, bal: -400 },
    { d: 'W', rec: 45, bal: 120  }, { d: 'T', rec: 90, bal: -600 },
    { d: 'F', rec: 85, bal: -450 }, { d: 'S', rec: 70, bal: -300 },
    { d: 'S', rec: computeRecovery(state), bal: balance },
  ]
  const weeklyBalance = weekData.reduce((s, d) => s + d.bal, 0)

  return (
    <div style={{ paddingBottom: 24, animation: 'pageIn .3s ease-out' }}>
      <PageHeader label="Analytics" title={`Long-term\nTrends`} />

      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        {([
          ['Consistency', '84%', C.green, '+6% this month'],
          ['Streak', '12 days', C.blue, 'Best ever 🔥'],
          ['Weekly Δ', `${weeklyBalance < 0 ? '−' : '+'} ${Math.abs(weeklyBalance).toLocaleString()}`, weeklyBalance < 0 ? C.green : C.orange, 'kcal balance'],
          ['Avg HRV', '61 ms', C.purple, '+4ms trend ↑'],
        ] as [string, string, string, string][]).map(([l, v, c, s]) => (
          <Card key={l} accentColor={c} style={{ padding: 16 }}>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: C.sub, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>{l}</div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>{s}</div>
          </Card>
        ))}
      </div>

      {/* Balance chart */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <Card style={{ padding: 20 }}>
          <SectionLabel>7-Day Caloric Balance</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 100, paddingTop: 8 }}>
            {weekData.map((d, i) => {
              const isPos = d.bal > 0
              const h = Math.abs(d.bal) / 600 * 80
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'center' }}>
                  {isPos && <div style={{ width: '80%', maxHeight: 46, height: `${Math.min(h, 46)}%`, background: `${C.orange}70`, borderRadius: '4px 4px 0 0' }} />}
                  <div style={{ height: 1, width: '100%', background: C.b }} />
                  {!isPos && <div style={{ width: '80%', maxHeight: 46, height: `${Math.min(h, 46)}%`, background: i === 6 ? `${C.green}90` : `${C.green}50`, borderRadius: '0 0 4px 4px', boxShadow: i === 6 ? `0 0 10px ${C.green}60` : undefined }} />}
                  <span style={{ fontFamily: F.mono, fontSize: 9, color: i === 6 ? C.blue : C.muted, marginTop: 2 }}>{d.d}</span>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            {[['Deficit', C.green], ['Surplus', C.orange]].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c + '60' }} />
                <span style={{ fontFamily: F.mono, fontSize: 9, color: C.sub }}>{l}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Weight log */}
      <div style={{ padding: '0 20px' }}>
        <SectionLabel>{S.weightTrend}</SectionLabel>
        <Card style={{ overflow: 'hidden' }}>
          {state.weightLog.length === 0 ? (
            <EmptyState emoji="📉" title={S.noWeightEntries} subtitle={S.logWeightHint} />
          ) : state.weightLog.map((entry, i, arr) => {
            const diff = i > 0 ? entry.weight - arr[i - 1].weight : 0
            return (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${C.b}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{entry.date}</div>
                  <div style={{ fontFamily: F.mono, fontSize: 10, color: C.sub }}>Body weight</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {diff !== 0 && <span style={{ fontFamily: F.mono, fontSize: 11, color: diff < 0 ? C.green : C.orange }}>{diff < 0 ? '' : '+'}{diff.toFixed(1)}kg</span>}
                  <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700 }}>{entry.weight} <span style={{ fontFamily: F.mono, fontSize: 11, color: C.sub }}>kg</span></span>
                  {onEditWeight && (
                    <button onClick={() => onEditWeight(entry.id)} style={{ width: 28, height: 28, borderRadius: 8, background: `${C.blue}18`, border: `1px solid ${C.blue}40`, color: C.blue, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                      <Icons.Pencil color={C.blue} size={13} />
                    </button>
                  )}
                  {onDeleteWeight && (
                    <button onClick={() => onDeleteWeight(entry.id)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: C.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icons.Trash color={C.red} size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────


interface ProfileProps {
  state:       AppState
  onEditGoals?: () => void
  onSignOut?:  () => void
}

export function Profile({ state, onEditGoals, onSignOut }: ProfileProps) {
  const lastWeight = state.weightLog[state.weightLog.length - 1]?.weight ?? 84

  return (
    <div style={{ paddingBottom: 24, animation: 'pageIn .3s ease-out' }}>
      <PageHeader label="Profile" title={`System\nConfig`} />

      {/* User card */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <Card style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#1e293b,#334155)', border: `2px solid ${C.b}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.display, fontSize: 20, fontWeight: 800 }}>
            {state.profile.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 800 }}>{state.profile.name}</div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: C.sub, letterSpacing: '.06em', marginTop: 3 }}>
              {lastWeight}kg · {state.profile.height}cm · {state.profile.age}y
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <Badge text="Advanced" color={C.blue} />
              {state.profile.isPro ? <Badge text="Pro ⚡" color={C.purple} dot /> : <Badge text="Free plan" color={C.sub} />}
            </div>
          </div>
        </Card>
      </div>

      {/* Upgrade banner for free users */}
      {!state.profile.isPro && (
        <div style={{ padding: '0 20px', marginBottom: 18 }}>
          <div style={{ background: `linear-gradient(135deg,${C.blue}18,${C.purple}12)`, border: `1px solid ${C.blue}30`, borderRadius: 18, padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: C.purple, filter: 'blur(40px)', opacity: .15 }} />
            <div style={{ fontFamily: F.display, fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Upgrade to Pro ⚡</div>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, marginBottom: 14 }}>AI decisions, full analytics, wearable sync — for less than $3/month.</div>
            <button style={{ padding: '11px 22px', background: `linear-gradient(135deg,${C.blue},${C.purple})`, border: 'none', borderRadius: 12, color: '#fff', fontFamily: F.display, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Start Free Trial →
            </button>
          </div>
        </div>
      )}

      {/* Goals */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <SectionLabel>{S.goals}</SectionLabel>
        <Card style={{ overflow: 'hidden' }} onClick={onEditGoals}>
          {([
            ['Daily Calories',  `${state.goals.calorieGoal.toLocaleString()} kcal`, C.orange],
            ['Protein',         `${state.goals.proteinGoal}g/day`,                  C.blue],
            ['Steps',           state.goals.stepsGoal.toLocaleString(),              C.purple],
            ['Water',           `${(state.goals.waterGoal / 1000).toFixed(1)}L`,    C.blue],
            ['Sleep',           `${state.goals.sleepGoal}h`,                         C.purple],
          ] as [string, string, string][]).map(([l, v, c], i, arr) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${C.b}` : 'none' }}>
              <span style={{ fontSize: 14, color: C.sub }}>{l}</span>
              <span style={{ fontFamily: F.mono, fontSize: 12, color: c, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Integrations */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <SectionLabel>{S.integrations}</SectionLabel>
        <Card style={{ overflow: 'hidden' }}>
          {[
            { name: 'Garmin Connect', icon: '⌚', status: 'Coming soon', sub: 'Steps, sleep, HR, HRV', color: C.sub },
            { name: 'Apple Health',   icon: '🍎', status: 'Coming soon', sub: 'iOS only', color: C.sub },
            { name: 'Strava',         icon: '🚴', status: 'Coming soon', sub: 'Workouts auto-import', color: C.sub },
            { name: 'FatSecret',      icon: '🥗', status: 'Optional', sub: 'Food search (needs static IP)', color: C.sub },
          ].map((ig, i, arr) => (
            <div key={ig.name} style={{ padding: '13px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${C.b}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{ig.icon}</span>
                  <span style={{ fontSize: 14 }}>{ig.name}</span>
                </div>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: ig.color }}>{ig.status}</span>
              </div>
              {ig.sub && <div style={{ fontSize: 11, color: C.sub, marginTop: 4, marginLeft: 30 }}>{ig.sub}</div>}
            </div>
          ))}
        </Card>
      </div>

      {onSignOut && (
        <div style={{ padding: '0 20px' }}>
          <button
            onClick={onSignOut}
            style={{
              width: '100%', padding: 14, background: 'transparent', border: `1px solid ${C.b}`,
              borderRadius: 14, color: C.sub, fontFamily: F.mono, fontSize: 11, letterSpacing: '.1em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
