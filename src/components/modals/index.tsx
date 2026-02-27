import { useState, useEffect, useRef } from 'react'
import { C, F } from '../../constants/theme'
import { FOOD_DATABASE, ACTIVITY_TYPES, INTENSITY_MULTIPLIER } from '../../constants/data'
import { Modal, Input } from '../ui'
import type { FoodEntry, ActivityEntry, MealType, Intensity, UserGoals, SleepData } from '../../types'
import { currentTime } from '../../store/useStore'
import { searchFatSecret, type FatSecretFood } from '../../lib/fatsecret'
import { track } from '../../lib/analytics'

// ─── Food Modal ───────────────────────────────────────────────────────────────

interface FoodModalProps {
  onClose: () => void
  onAdd:   (entry: Omit<FoodEntry, 'id'>) => void
  onUpdate?: (id: number, patch: Partial<Omit<FoodEntry, 'id'>>) => void
  editEntry?: FoodEntry | null
}

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const SEARCH_DEBOUNCE_MS = 400

export function FoodModal({ onClose, onAdd, onUpdate, editEntry }: FoodModalProps) {
  const isEdit = Boolean(editEntry && onUpdate)
  const [tab, setTab] = useState<'quick' | 'custom'>(isEdit ? 'custom' : 'quick')
  const [mealType, setMealType] = useState<MealType>(editEntry?.mealType ?? 'Lunch')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name:   editEntry?.name ?? '',
    kcal:   editEntry != null ? String(editEntry.kcal) : '',
    protein: editEntry != null ? String(editEntry.protein) : '',
    carbs:  editEntry != null ? String(editEntry.carbs) : '',
    fat:    editEntry != null ? String(editEntry.fat) : '',
  })
  const [fatSecretResults, setFatSecretResults] = useState<FatSecretFood[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const localFiltered = FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (search.trim().length < 2) {
      setFatSecretResults([])
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    debounceRef.current = setTimeout(() => {
      searchFatSecret(search).then((foods) => {
        setFatSecretResults(foods)
        setSearchLoading(false)
      }).catch(() => {
        setFatSecretResults([])
        setSearchLoading(false)
      })
      debounceRef.current = null
    }, SEARCH_DEBOUNCE_MS)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const showFatSecret = fatSecretResults.length > 0
  const listToShow = showFatSecret ? fatSecretResults : localFiltered

  function handleQuickAdd(food: { name: string; kcal: number; protein: number; carbs: number; fat: number }) {
    onAdd({ ...food, mealType, time: currentTime() })
    track('add_food', { source: 'quick' })
    onClose()
  }

  function handleCustomAdd() {
    if (!form.name || !form.kcal) return
    onAdd({
      name: form.name,
      kcal: +form.kcal,
      protein: +(form.protein || 0),
      carbs:   +(form.carbs   || 0),
      fat:     +(form.fat     || 0),
      mealType,
      time: currentTime(),
    })
    track('add_food', { source: 'custom' })
    onClose()
  }

  function handleCustomUpdate() {
    if (!editEntry || !onUpdate || !form.name || !form.kcal) return
    onUpdate(editEntry.id, {
      name: form.name,
      kcal: +form.kcal,
      protein: +(form.protein || 0),
      carbs:   +(form.carbs   || 0),
      fat:     +(form.fat     || 0),
      mealType,
    })
    onClose()
  }

  return (
    <Modal onClose={onClose} title={isEdit ? 'Edit Food' : 'Log Food'}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['quick', 'custom'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 14px', borderRadius: 10,
            background: tab === t ? `${C.blue}22` : C.card,
            border: `1px solid ${tab === t ? C.blue + '66' : C.b}`,
            color: tab === t ? C.blue : C.sub,
            fontFamily: F.mono, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
            {t === 'quick' ? 'Quick Add' : 'Custom'}
          </button>
        ))}
      </div>

      {/* Meal type selector */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>Meal Type</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {MEAL_TYPES.map(m => (
            <button key={m} onClick={() => setMealType(m)} style={{
              flex: 1, padding: '7px 4px',
              background: mealType === m ? `${C.blue}22` : C.card,
              border: `1px solid ${mealType === m ? C.blue + '66' : C.b}`,
              color: mealType === m ? C.blue : C.sub,
              fontFamily: F.mono, fontSize: 9, cursor: 'pointer', borderRadius: 10,
            }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {tab === 'quick' ? (
        <>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              style={{ width: '100%', padding: '13px 16px', background: C.card, border: `1px solid ${C.b}`, borderRadius: 12, color: C.text, fontFamily: F.body, fontSize: 15, outline: 'none' }}
              placeholder="Search foods… (FatSecret or local)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {searchLoading && (
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: F.mono, fontSize: 10, color: C.sub }}>…</div>
            )}
          </div>
          <div className="scroll-hidden" style={{ maxHeight: 260, overflowY: 'auto', borderRadius: 14, border: `1px solid ${C.b}`, background: C.card }}>
            {listToShow.length === 0 && !searchLoading ? (
              <div style={{ padding: 20, textAlign: 'center', color: C.sub, fontSize: 13 }}>
                {search.trim().length < 2 ? (
                  'Type 2+ characters to search'
                ) : (
                  'No results — try another query or add manually in Custom'
                )}
              </div>
            ) : (
              listToShow.map((f, i) => (
                <div key={showFatSecret ? (f as FatSecretFood).id : `local-${i}`} onClick={() => handleQuickAdd(f)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: i < listToShow.length - 1 ? `1px solid ${C.b}` : 'none',
                  cursor: 'pointer',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{f.name}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 10, color: C.sub, marginTop: 2 }}>
                      P:{f.protein}g · C:{f.carbs}g · F:{f.fat}g
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, color: C.orange }}>{f.kcal}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 9, color: C.sub }}>kcal</div>
                  </div>
                </div>
              ))
            )}
          </div>
          {showFatSecret && (
            <div style={{ marginTop: 8, fontFamily: F.mono, fontSize: 9, color: C.sub, letterSpacing: '.06em' }}>
              Results from FatSecret
            </div>
          )}
        </>
      ) : (
        <>
          <Input label="Food Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Grilled Salmon" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="Calories (kcal) *" type="number" value={form.kcal} onChange={e => setForm(p => ({ ...p, kcal: e.target.value }))} placeholder="0" />
            <Input label="Protein (g)"       type="number" value={form.protein} onChange={e => setForm(p => ({ ...p, protein: e.target.value }))} placeholder="0" />
            <Input label="Carbs (g)"         type="number" value={form.carbs} onChange={e => setForm(p => ({ ...p, carbs: e.target.value }))} placeholder="0" />
            <Input label="Fat (g)"           type="number" value={form.fat}   onChange={e => setForm(p => ({ ...p, fat: e.target.value }))}   placeholder="0" />
          </div>
          <button onClick={isEdit ? handleCustomUpdate : handleCustomAdd} style={{ width: '100%', padding: '14px', background: C.blue, border: 'none', borderRadius: 14, color: '#fff', fontFamily: F.display, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
            {isEdit ? 'Save Changes' : 'Add to Log'}
          </button>
        </>
      )}
    </Modal>
  )
}

// ─── Activity Modal ───────────────────────────────────────────────────────────

interface ActivityModalProps {
  onClose: () => void
  onAdd:   (entry: Omit<ActivityEntry, 'id'>) => void
  onUpdate?: (id: number, patch: Partial<Omit<ActivityEntry, 'id'>>) => void
  editEntry?: ActivityEntry | null
}

export function ActivityModal({ onClose, onAdd, onUpdate, editEntry }: ActivityModalProps) {
  const isEdit = Boolean(editEntry && onUpdate)
  const [type, setType] = useState<typeof ACTIVITY_TYPES[number]>((editEntry?.type as typeof ACTIVITY_TYPES[number]) ?? ACTIVITY_TYPES[0])
  const [duration, setDuration] = useState(editEntry?.duration ?? 60)
  const [intensity, setIntensity] = useState<Intensity>(editEntry?.intensity ?? 'Moderate')

  const kcalBurned = Math.round(duration * (INTENSITY_MULTIPLIER[intensity] ?? 7))

  function handleAdd() {
    onAdd({ type, duration, intensity, kcalBurned, time: currentTime() })
    onClose()
  }

  function handleUpdate() {
    if (!editEntry || !onUpdate) return
    onUpdate(editEntry.id, { type, duration, intensity, kcalBurned })
    onClose()
  }

  return (
    <Modal onClose={onClose} title={isEdit ? 'Edit Activity' : 'Log Activity'}>
      {/* Type */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>Activity Type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ACTIVITY_TYPES.map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: '8px 12px', borderRadius: 10,
              background: type === t ? `${C.blue}22` : C.card,
              border: `1px solid ${type === t ? C.blue + '66' : C.b}`,
              color: type === t ? C.blue : C.sub,
              fontFamily: F.mono, fontSize: 10, cursor: 'pointer',
            }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {/* Duration */}
        <div>
          <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>Duration (min)</label>
          <input type="number" value={duration} onChange={e => setDuration(+e.target.value)}
            style={{ width: '100%', padding: '13px 16px', background: C.card, border: `1px solid ${C.b}`, borderRadius: 12, color: C.text, fontFamily: F.display, fontSize: 18, fontWeight: 700, outline: 'none' }} />
        </div>
        {/* Intensity */}
        <div>
          <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>Intensity</label>
          <div style={{ display: 'flex', gap: 5 }}>
            {(['Light', 'Moderate', 'High'] as Intensity[]).map(i => (
              <button key={i} onClick={() => setIntensity(i)} style={{
                flex: 1, padding: '13px 4px', borderRadius: 10,
                background: intensity === i ? `${C.blue}22` : C.card,
                border: `1px solid ${intensity === i ? C.blue + '66' : C.b}`,
                color: intensity === i ? C.blue : C.sub,
                fontFamily: F.mono, fontSize: 9, cursor: 'pointer',
              }}>
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estimated burn */}
      <div style={{ background: `${C.orange}12`, border: `1px solid ${C.orange}30`, borderRadius: 12, padding: '14px 16px', marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: F.mono, fontSize: 10, color: C.sub, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Estimated Burn</div>
        <div style={{ fontFamily: F.display, fontSize: 32, fontWeight: 800, color: C.orange, letterSpacing: '-.02em' }}>
          {kcalBurned} <span style={{ fontFamily: F.mono, fontSize: 14, color: C.sub }}>kcal</span>
        </div>
      </div>

      <button onClick={isEdit ? handleUpdate : handleAdd} style={{ width: '100%', padding: '14px', background: C.orange, border: 'none', borderRadius: 14, color: '#fff', fontFamily: F.display, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
        {isEdit ? 'Save Changes' : 'Log Activity'}
      </button>
    </Modal>
  )
}

// ─── Weight Modal ─────────────────────────────────────────────────────────────

interface WeightModalProps {
  onClose: () => void
  onLog:   (weight: number) => void
  onUpdate?: (id: number, patch: { weight?: number; date?: string }) => void
  lastWeight?: number
  editEntry?: { id: number; date: string; weight: number } | null
}

export function WeightModal({ onClose, onLog, onUpdate, lastWeight, editEntry }: WeightModalProps) {
  const isEdit = Boolean(editEntry && onUpdate)
  const [weight, setWeight] = useState(String(editEntry?.weight ?? lastWeight ?? 80))

  function handleSubmit() {
    const w = parseFloat(weight.replace(',', '.'))
    if (!Number.isFinite(w) || w <= 0 || w >= 300) return
    if (isEdit && editEntry) {
      onUpdate?.(editEntry.id, { weight: w })
    } else {
      onLog(w)
    }
    onClose()
  }

  return (
    <Modal onClose={onClose} title={isEdit ? 'Edit Weight' : 'Log Weight'}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>Weight (kg)</label>
        <input
          type="number"
          step="0.1"
          min="20"
          max="300"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', padding: '16px 18px', background: C.card, border: `1px solid ${C.b}`, borderRadius: 14, color: C.text, fontFamily: F.display, fontSize: 28, fontWeight: 800, outline: 'none' }}
          placeholder="84.5"
          autoFocus
        />
      </div>
      <button onClick={handleSubmit} style={{ width: '100%', padding: '14px', background: C.blue, border: 'none', borderRadius: 14, color: '#fff', fontFamily: F.display, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
        {isEdit ? 'Save Changes' : 'Save Weight'}
      </button>
    </Modal>
  )
}

// ─── Sleep Modal ──────────────────────────────────────────────────────────────

interface SleepModalProps {
  onClose: () => void
  onSave:  (sleep: Partial<SleepData>) => void
  current: SleepData
}

export function SleepModal({ onClose, onSave, current }: SleepModalProps) {
  const [hours, setHours] = useState(current.hours)
  const [mins, setMins] = useState(current.mins)
  const [quality, setQuality] = useState(current.quality)

  function handleSave() {
    onSave({ hours, mins, quality })
    onClose()
  }

  return (
    <Modal onClose={onClose} title="Log Sleep">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>Hours</label>
          <input type="number" min={0} max={24} value={hours} onChange={e => setHours(+e.target.value)}
            style={{ width: '100%', padding: '13px 16px', background: C.card, border: `1px solid ${C.b}`, borderRadius: 12, color: C.text, fontFamily: F.display, fontSize: 18, fontWeight: 700, outline: 'none' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>Minutes</label>
          <input type="number" min={0} max={59} value={mins} onChange={e => setMins(+e.target.value)}
            style={{ width: '100%', padding: '13px 16px', background: C.card, border: `1px solid ${C.b}`, borderRadius: 12, color: C.text, fontFamily: F.display, fontSize: 18, fontWeight: 700, outline: 'none' }} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>Quality (0–100%)</label>
        <input type="range" min={0} max={100} value={quality} onChange={e => setQuality(+e.target.value)}
          style={{ width: '100%', accentColor: C.blue }} />
        <div style={{ textAlign: 'center', fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.blue, marginTop: 4 }}>{quality}%</div>
      </div>
      <button onClick={handleSave} style={{ width: '100%', padding: '14px', background: C.blue, border: 'none', borderRadius: 14, color: '#fff', fontFamily: F.display, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
        Save Sleep
      </button>
    </Modal>
  )
}

// ─── Goal Editor Modal ────────────────────────────────────────────────────────

interface GoalEditorModalProps {
  onClose: () => void
  onSave:  (goals: Partial<UserGoals>) => void
  goals:   UserGoals
}

export function GoalEditorModal({ onClose, onSave, goals }: GoalEditorModalProps) {
  const [form, setForm] = useState({
    calorieGoal: String(goals.calorieGoal),
    proteinGoal: String(goals.proteinGoal),
    stepsGoal:   String(goals.stepsGoal),
    waterGoal:   String(goals.waterGoal / 1000),
    sleepGoal:   String(goals.sleepGoal),
  })

  function handleSave() {
    onSave({
      calorieGoal: parseInt(form.calorieGoal, 10) || goals.calorieGoal,
      proteinGoal: parseInt(form.proteinGoal, 10) || goals.proteinGoal,
      stepsGoal:   parseInt(form.stepsGoal, 10)   || goals.stepsGoal,
      waterGoal:   Math.round((parseFloat(form.waterGoal) || goals.waterGoal / 1000) * 1000),
      sleepGoal:   parseInt(form.sleepGoal, 10)    || goals.sleepGoal,
    })
    onClose()
  }

  return (
    <Modal onClose={onClose} title="Edit Goals">
      <Input label="Daily Calories (kcal)" type="number" value={form.calorieGoal} onChange={e => setForm(p => ({ ...p, calorieGoal: e.target.value }))} placeholder="2400" />
      <Input label="Protein (g/day)" type="number" value={form.proteinGoal} onChange={e => setForm(p => ({ ...p, proteinGoal: e.target.value }))} placeholder="170" />
      <Input label="Steps" type="number" value={form.stepsGoal} onChange={e => setForm(p => ({ ...p, stepsGoal: e.target.value }))} placeholder="10000" />
      <Input label="Water (L)" type="number" step="0.5" value={form.waterGoal} onChange={e => setForm(p => ({ ...p, waterGoal: e.target.value }))} placeholder="2.5" />
      <Input label="Sleep (hours)" type="number" min={4} max={12} value={form.sleepGoal} onChange={e => setForm(p => ({ ...p, sleepGoal: e.target.value }))} placeholder="8" />
      <button onClick={handleSave} style={{ width: '100%', padding: '14px', background: C.blue, border: 'none', borderRadius: 14, color: '#fff', fontFamily: F.display, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
        Save Goals
      </button>
    </Modal>
  )
}
