import { useState, useCallback, useEffect } from 'react'
import type { AppState, AppActions, FoodEntry, ActivityEntry, WeightEntry, MorningFeeling, LastDaySummary } from '../types'
import { C } from '../constants/theme'
import {
  DEFAULT_GOALS, DEFAULT_PROFILE, DEFAULT_SLEEP,
  DEFAULT_FOOD_LOG, DEFAULT_ACTIVITIES, DEFAULT_WEIGHT_LOG,
} from '../constants/data'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'health-os-state'

function loadFromStorage(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveToStorage(state: Partial<AppState>) {
  try {
    const { foodLog, activities, water, weightLog, profile, goals, sleep, lastDaySummary, dailySummaries } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      foodLog, activities, water, weightLog, profile, goals, sleep,
      lastDaySummary: lastDaySummary ?? undefined,
      dailySummaries: dailySummaries ?? [],
    }))
  } catch {
    // Storage full or unavailable — silent fail
  }
}

function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

function currentTime(): string {
  return new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// ─── Initial State ────────────────────────────────────────────────────────────

function buildInitialState(): AppState {
  const saved = loadFromStorage()
  return {
    // UI — never persisted
    screen: 'onboarding',
    tab:    'dashboard',
    modal:  null,

    // Data — merge from localStorage or use defaults
    profile:     { ...DEFAULT_PROFILE,    ...(saved.profile    || {}) },
    goals:       { ...DEFAULT_GOALS,      ...(saved.goals      || {}) },
    sleep:       { ...DEFAULT_SLEEP,      ...(saved.sleep      || {}) },
    foodLog:     saved.foodLog     ?? DEFAULT_FOOD_LOG,
    activities:  saved.activities  ?? DEFAULT_ACTIVITIES,
    water:       saved.water       ?? 5,
    weightLog:   saved.weightLog   ?? DEFAULT_WEIGHT_LOG,
    lastDaySummary: saved.lastDaySummary ?? null,
    dailySummaries: Array.isArray(saved.dailySummaries) ? saved.dailySummaries : [],
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStore(): AppState & AppActions {
  const [state, setState] = useState<AppState>(buildInitialState)

  // Auto-save whenever relevant data changes
  useEffect(() => {
    saveToStorage(state)
  }, [state.foodLog, state.activities, state.water, state.weightLog, state.profile, state.goals, state.sleep, state.lastDaySummary, state.dailySummaries])

  // Keep lastDaySummary = today's snapshot (only when we're still on the same day)
  useEffect(() => {
    const todayIso = new Date().toISOString().slice(0, 10)
    setState(s => {
      if (s.lastDaySummary && s.lastDaySummary.date !== todayIso) return s
      const { balance } = computeBalance(s)
      const sleepHours = s.sleep.hours + s.sleep.mins / 60
      const waterPct = s.goals.waterGoal > 0 ? (s.water * 250 / s.goals.waterGoal) * 100 : 100
      return {
        ...s,
        lastDaySummary: {
          date: todayIso,
          sleepHours,
          balance,
          hadActivity: s.activities.length > 0,
          waterPct,
        },
      }
    })
  }, [state.foodLog, state.activities, state.water, state.sleep, state.goals.waterGoal])

  // Navigation
  const setScreen = useCallback((screen: AppState['screen']) => {
    setState(s => ({ ...s, screen }))
  }, [])

  const setTab = useCallback((tab: AppState['tab']) => {
    setState(s => ({ ...s, tab }))
  }, [])

  const setModal = useCallback((modal: AppState['modal']) => {
    setState(s => ({ ...s, modal }))
  }, [])

  // Food
  const addFood = useCallback((entry: Omit<FoodEntry, 'id'>) => {
    setState(s => ({
      ...s,
      foodLog: [...s.foodLog, { ...entry, id: generateId() }],
    }))
  }, [])

  const updateFood = useCallback((id: number, patch: Partial<Omit<FoodEntry, 'id'>>) => {
    setState(s => ({
      ...s,
      foodLog: s.foodLog.map(f => f.id === id ? { ...f, ...patch } : f),
    }))
  }, [])

  const removeFood = useCallback((id: number) => {
    setState(s => ({ ...s, foodLog: s.foodLog.filter(f => f.id !== id) }))
  }, [])

  // Activity
  const addActivity = useCallback((entry: Omit<ActivityEntry, 'id'>) => {
    setState(s => ({
      ...s,
      activities: [...s.activities, { ...entry, id: generateId() }],
    }))
  }, [])

  const updateActivity = useCallback((id: number, patch: Partial<Omit<ActivityEntry, 'id'>>) => {
    setState(s => ({
      ...s,
      activities: s.activities.map(a => a.id === id ? { ...a, ...patch } : a),
    }))
  }, [])

  const removeActivity = useCallback((id: number) => {
    setState(s => ({ ...s, activities: s.activities.filter(a => a.id !== id) }))
  }, [])

  // Water
  const setWater = useCallback((value: number | ((prev: number) => number)) => {
    setState(s => ({
      ...s,
      water: typeof value === 'function' ? value(s.water) : value,
    }))
  }, [])

  // Profile / Goals
  const updateProfile = useCallback((patch: Partial<AppState['profile']>) => {
    setState(s => ({ ...s, profile: { ...s.profile, ...patch } }))
  }, [])

  const updateGoals = useCallback((patch: Partial<AppState['goals']>) => {
    setState(s => ({ ...s, goals: { ...s.goals, ...patch } }))
  }, [])

  // Weight
  const logWeight = useCallback((weight: number) => {
    const date = new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' })
    setState(s => ({
      ...s,
      weightLog: [...s.weightLog, { id: generateId(), date, weight }],
    }))
  }, [])

  const updateWeightEntry = useCallback((id: number, patch: Partial<{ weight: number; date: string }>) => {
    setState(s => ({
      ...s,
      weightLog: s.weightLog.map(w => w.id === id ? { ...w, ...patch } : w),
    }))
  }, [])

  const removeWeightEntry = useCallback((id: number) => {
    setState(s => ({ ...s, weightLog: s.weightLog.filter(w => w.id !== id) }))
  }, [])

  // Sleep
  const updateSleep = useCallback((patch: Partial<AppState['sleep']>) => {
    setState(s => ({ ...s, sleep: { ...s.sleep, ...patch } }))
  }, [])

  const setMorningCheck = useCallback((date: string, feeling: MorningFeeling) => {
    setState(s => ({
      ...s,
      profile: { ...s.profile, lastMorningCheckDate: date, morningFeeling: feeling },
    }))
  }, [])

  function isDayStable(summary: LastDaySummary): boolean {
    if (summary.sleepHours < 5) return false
    if (summary.balance > 500) return false
    if (!summary.hadActivity) return false
    return true
  }

  const closeDayAndUpdateStability = useCallback((todayIso: string) => {
    setState(s => {
      const prev = s.lastDaySummary
      if (!prev || prev.date >= todayIso) return s
      const stable = isDayStable(prev)
      const dailySummaries = [...s.dailySummaries, { date: prev.date, stable }]
        .sort((a, b) => a.date.localeCompare(b.date))
        .filter((e, i, arr) => i === 0 || e.date !== arr[i - 1].date)
      return {
        ...s,
        lastDaySummary: null,
        dailySummaries,
      }
    })
  }, [])

  const hydrate = useCallback((data: Partial<Pick<AppState, 'profile' | 'goals' | 'sleep' | 'foodLog' | 'activities' | 'water' | 'weightLog' | 'lastDaySummary' | 'dailySummaries'>>) => {
    setState(s => ({
      ...s,
      ...(data.profile && { profile: { ...s.profile, ...data.profile } }),
      ...(data.goals && { goals: { ...s.goals, ...data.goals } }),
      ...(data.sleep && { sleep: { ...s.sleep, ...data.sleep } }),
      ...(data.foodLog !== undefined && { foodLog: data.foodLog }),
      ...(data.activities !== undefined && { activities: data.activities }),
      ...(data.water !== undefined && { water: data.water }),
      ...(data.weightLog !== undefined && { weightLog: data.weightLog }),
      ...(data.lastDaySummary !== undefined && { lastDaySummary: data.lastDaySummary }),
      ...(data.dailySummaries !== undefined && { dailySummaries: data.dailySummaries }),
    }))
  }, [])

  return {
    ...state,
    setScreen,
    setTab,
    setModal,
    addFood,
    updateFood,
    removeFood,
    addActivity,
    updateActivity,
    removeActivity,
    setWater,
    updateProfile,
    updateGoals,
    logWeight,
    updateWeightEntry,
    removeWeightEntry,
    updateSleep,
    setMorningCheck,
    closeDayAndUpdateStability,
    hydrate,
  }
}

// ─── Derived / computed values ────────────────────────────────────────────────

export function computeBalance(state: AppState) {
  const intake  = state.foodLog.reduce((s, f) => s + f.kcal, 0)
  const burned  = 350 + state.activities.reduce((s, a) => s + a.kcalBurned, 0)
  const balance = intake - burned
  const remaining = state.goals.calorieGoal - intake
  const isDeficit = balance <= 0
  const isOverGoal = intake > state.goals.calorieGoal
  const goalPct = Math.min((intake / state.goals.calorieGoal) * 100, 130)
  return { intake, burned, balance, remaining, isDeficit, isOverGoal, goalPct }
}

export function computeRecovery(state: AppState): number {
  const { hours, quality, hrv } = state.sleep
  return Math.round(Math.min(95, 50 + hours * 4 + quality * 0.15 + (hrv - 40) * 0.3))
}

export function computeMacros(foodLog: FoodEntry[]) {
  return {
    protein: foodLog.reduce((s, f) => s + (f.protein || 0), 0),
    carbs:   foodLog.reduce((s, f) => s + (f.carbs   || 0), 0),
    fat:     foodLog.reduce((s, f) => s + (f.fat     || 0), 0),
  }
}

/** Daily System Score 0–100 from sleep, recovery, balance, activity, hydration, consistency */
export function computeDailyScore(state: AppState): { score: number; label: string } {
  const recovery = computeRecovery(state)
  const { goalPct, isOverGoal, balance } = computeBalance(state)
  const { protein } = computeMacros(state.foodLog)
  const sleepHours = state.sleep.hours + state.sleep.mins / 60
  const sleepPct = Math.min(100, (sleepHours / state.goals.sleepGoal) * 100)
  const waterPct = state.goals.waterGoal > 0
    ? Math.min(100, (state.water * 250 / state.goals.waterGoal) * 100)
    : 100
  const proteinPct = state.goals.proteinGoal > 0
    ? Math.min(100, (protein / state.goals.proteinGoal) * 100)
    : 100
  const activityOk = state.activities.length > 0 ? 100 : 50
  const balanceScore = isOverGoal
    ? Math.max(0, 100 - (goalPct - 100) * 2)
    : Math.min(100, 50 + goalPct * 0.5)
  const score = Math.round(
    (recovery * 0.25) +
    (sleepPct * 0.2) +
    (balanceScore * 0.2) +
    (waterPct * 0.15) +
    (proteinPct * 0.1) +
    (activityOk * 0.1)
  )
  const clamped = Math.max(0, Math.min(100, score))
  const label = clamped >= 80 ? 'Good Day' : clamped >= 60 ? 'Okay' : clamped >= 40 ? 'Needs attention' : 'Rest day'
  return { score: clamped, label }
}

/** Single priority for today (one main action) */
export function getTodayPriority(state: AppState): {
  id: string
  title: string
  subtitle: string
  color: string
  action: 'sleep' | 'food' | 'activity' | 'weight' | null
} {
  const recovery = computeRecovery(state)
  const { isOverGoal, remaining, intake } = computeBalance(state)
  const { protein } = computeMacros(state.foodLog)
  const sleepHours = state.sleep.hours + state.sleep.mins / 60

  if (sleepHours < 5) {
    return { id: 'sleep', title: 'Fix Sleep Debt', subtitle: 'Under 5h — recovery will be limited. Aim for 7–8h tonight.', color: C.purple, action: 'sleep' }
  }
  if (state.sleep.quality < 40 && recovery < 70) {
    return { id: 'sleep-q', title: 'Prioritize Sleep Quality', subtitle: 'Low quality last night. Focus on wind-down tonight.', color: C.blue, action: 'sleep' }
  }
  if (recovery < 50) {
    return { id: 'rest', title: 'Rest Day', subtitle: 'System needs recovery. Light movement only.', color: C.orange, action: null }
  }
  if (isOverGoal && intake - state.goals.calorieGoal > 300) {
    return { id: 'cal', title: 'Reduce Intake', subtitle: `${(intake - state.goals.calorieGoal).toLocaleString()} kcal over goal. Cut next meal.`, color: C.orange, action: 'food' }
  }
  if (protein < state.goals.proteinGoal * 0.8) {
    return { id: 'protein', title: 'Increase Protein', subtitle: `${Math.round(protein)}g / ${state.goals.proteinGoal}g. Add a high-protein meal.`, color: C.blue, action: 'food' }
  }
  if (state.activities.length === 0 && recovery >= 65) {
    return { id: 'train', title: 'Train Today', subtitle: `Recovery ${recovery}%. Good day for a workout.`, color: C.green, action: 'activity' }
  }
  if (Math.abs(remaining) < 200 && !isOverGoal) {
    return { id: 'balance', title: 'Hit Your Target', subtitle: `${Math.abs(remaining).toLocaleString()} kcal left. One smart meal.`, color: C.green, action: 'food' }
  }
  return {
    id: 'default',
    title: recovery >= 75 ? 'Stay on Track' : 'Log Your Day',
    subtitle: recovery >= 75 ? 'System optimal. Keep consistency.' : 'Log meals and activity to get a full score.',
    color: C.blue,
    action: 'food',
  }
}

function getStabilityStreak(dailySummaries: { date: string; stable: boolean }[]): number {
  const byDate = Object.fromEntries(dailySummaries.map(e => [e.date, e.stable]))
  const sortedDates = [...new Set(dailySummaries.map(e => e.date))].sort((a, b) => b.localeCompare(a))
  if (sortedDates.length === 0) return 0
  let streak = 0
  let check = sortedDates[0]
  while (byDate[check] === true) {
    streak++
    const next = new Date(check + 'T12:00:00Z')
    next.setDate(next.getDate() - 1)
    const prev = next.toISOString().slice(0, 10)
    if (!(prev in byDate)) break
    check = prev
  }
  return streak
}

export function getStabilityStreakFromState(state: AppState): number {
  return getStabilityStreak(state.dailySummaries)
}

export { currentTime, generateId }
