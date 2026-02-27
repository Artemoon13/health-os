// ─── Core Data Types ────────────────────────────────────────────────────────

export interface FoodEntry {
  id: number
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  mealType: MealType
  time: string
}

export interface ActivityEntry {
  id: number
  type: string
  duration: number
  intensity: Intensity
  kcalBurned: number
  time: string
}

export interface SleepData {
  hours: number
  mins: number
  quality: number  // 0–100
  hrv: number      // ms
  rhr: number      // bpm
}

export interface WeightEntry {
  id: number
  date: string
  weight: number
}

export interface UserGoals {
  calorieGoal: number
  proteinGoal: number
  stepsGoal: number
  waterGoal: number    // ml
  sleepGoal: number    // hours
}

export type MorningFeeling = 'energized' | 'normal' | 'tired' | 'exhausted'

export interface UserProfile {
  name: string
  weight: number
  height: number
  age: number
  goal: GoalType
  activityLevel: ActivityLevel
  isPro: boolean
  /** After login with Supabase: show onboarding until user completes paywall */
  onboardingDone?: boolean
  /** Last date (YYYY-MM-DD) user completed morning check */
  lastMorningCheckDate?: string
  morningFeeling?: MorningFeeling
}

export interface DayStabilityEntry {
  date: string  // YYYY-MM-DD
  stable: boolean
}

export interface LastDaySummary {
  date: string
  sleepHours: number
  balance: number
  hadActivity: boolean
  waterPct: number
}

// ─── Enums / Unions ──────────────────────────────────────────────────────────

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
export type Intensity = 'Light' | 'Moderate' | 'High'
export type GoalType = 'lose' | 'maintain' | 'gain' | 'performance'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'

export type AppScreen = 'onboarding' | 'connect' | 'goals' | 'paywall' | 'app'
export type AppTab = 'dashboard' | 'nutrition' | 'activity' | 'recovery' | 'stats' | 'profile'
export type ModalType = 'food' | 'activity' | 'weight' | 'sleep' | 'goalEditor' | null

// ─── Store Types ─────────────────────────────────────────────────────────────

export interface AppState {
  // Flow
  screen: AppScreen
  tab: AppTab
  modal: ModalType

  // User
  profile: UserProfile
  goals: UserGoals
  sleep: SleepData

  // Daily logs
  foodLog: FoodEntry[]
  activities: ActivityEntry[]
  water: number           // glasses (250ml each)
  weightLog: WeightEntry[]

  // System stability & morning check
  lastDaySummary: LastDaySummary | null
  dailySummaries: DayStabilityEntry[]
}

export interface AppActions {
  // Navigation
  setScreen: (screen: AppScreen) => void
  setTab: (tab: AppTab) => void
  setModal: (modal: ModalType) => void

  // Data mutations
  addFood: (entry: Omit<FoodEntry, 'id'>) => void
  updateFood: (id: number, patch: Partial<Omit<FoodEntry, 'id'>>) => void
  removeFood: (id: number) => void
  addActivity: (entry: Omit<ActivityEntry, 'id'>) => void
  updateActivity: (id: number, patch: Partial<Omit<ActivityEntry, 'id'>>) => void
  removeActivity: (id: number) => void
  setWater: (glasses: number | ((prev: number) => number)) => void
  updateProfile: (profile: Partial<UserProfile>) => void
  updateGoals: (goals: Partial<UserGoals>) => void
  logWeight: (weight: number) => void
  updateWeightEntry: (id: number, patch: Partial<Pick<WeightEntry, 'weight' | 'date'>>) => void
  removeWeightEntry: (id: number) => void
  updateSleep: (sleep: Partial<SleepData>) => void
  setMorningCheck: (date: string, feeling: MorningFeeling) => void
  closeDayAndUpdateStability: (todayIso: string) => void
  /** Fill state from Supabase (used when user logs in) */
  hydrate?: (data: Partial<Pick<AppState, 'profile' | 'goals' | 'sleep' | 'foodLog' | 'activities' | 'water' | 'weightLog' | 'lastDaySummary' | 'dailySummaries'>>) => void
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface RingProps {
  size?: number
  strokeWidth?: number
  percent: number
  color: string
  glow?: boolean
  children?: React.ReactNode
}

export interface BadgeProps {
  text: string
  color: string
  dot?: boolean
}

export interface FBarProps {
  label: string
  value: number
  color: string
}
