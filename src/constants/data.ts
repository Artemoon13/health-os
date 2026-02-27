import type { FoodEntry, ActivityEntry, UserGoals, UserProfile, SleepData, WeightEntry } from '../types'

// ─── Food Database ────────────────────────────────────────────────────────────

export interface FoodTemplate {
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export const FOOD_DATABASE: FoodTemplate[] = [
  { name: 'Chicken Breast 100g',    kcal: 165, protein: 31,   carbs: 0,  fat: 3.6 },
  { name: 'White Rice 100g',        kcal: 130, protein: 2.7,  carbs: 28, fat: 0.3 },
  { name: 'Egg (1 large)',           kcal: 72,  protein: 6,    carbs: 0.4,fat: 5   },
  { name: 'Oats 100g',              kcal: 389, protein: 17,   carbs: 66, fat: 7   },
  { name: 'Banana (1 medium)',       kcal: 89,  protein: 1.1,  carbs: 23, fat: 0.3 },
  { name: 'Greek Yogurt 150g',       kcal: 89,  protein: 15,   carbs: 6,  fat: 0.7 },
  { name: 'Whey Protein 30g',        kcal: 120, protein: 24,   carbs: 3,  fat: 1.5 },
  { name: 'Salmon 100g',             kcal: 208, protein: 20,   carbs: 0,  fat: 13  },
  { name: 'Avocado (half)',          kcal: 120, protein: 1.5,  carbs: 6,  fat: 11  },
  { name: 'Whole Grain Bread slice', kcal: 79,  protein: 3,    carbs: 15, fat: 1   },
  { name: 'Cottage Cheese 150g',     kcal: 142, protein: 17,   carbs: 6,  fat: 5   },
  { name: 'Sweet Potato 150g',       kcal: 129, protein: 2.9,  carbs: 30, fat: 0.1 },
  { name: 'Almonds 30g',             kcal: 174, protein: 6,    carbs: 6,  fat: 15  },
  { name: 'Tuna in water 85g',       kcal: 109, protein: 24,   carbs: 0,  fat: 2.5 },
  { name: 'Broccoli 100g',           kcal: 34,  protein: 2.8,  carbs: 7,  fat: 0.4 },
  { name: 'Olive Oil 1 tbsp',        kcal: 119, protein: 0,    carbs: 0,  fat: 14  },
  { name: 'Milk 200ml',              kcal: 99,  protein: 6.6,  carbs: 9.5,fat: 4   },
  { name: 'Pasta 100g (dry)',        kcal: 357, protein: 13,   carbs: 71, fat: 1.5 },
  { name: 'Black Beans 100g',        kcal: 132, protein: 8.9,  carbs: 24, fat: 0.5 },
  { name: 'Protein Bar (generic)',   kcal: 200, protein: 20,   carbs: 22, fat: 7   },
]

// ─── Activity Types ───────────────────────────────────────────────────────────

export const ACTIVITY_TYPES = [
  'Strength Training',
  'Running',
  'Cycling',
  'HIIT',
  'Swimming',
  'Walking',
  'Yoga',
  'Boxing',
] as const

export const INTENSITY_MULTIPLIER: Record<string, number> = {
  Light:    4,
  Moderate: 7,
  High:     10,
}

// ─── Default State ────────────────────────────────────────────────────────────

export const DEFAULT_GOALS: UserGoals = {
  calorieGoal: 2400,
  proteinGoal: 170,
  stepsGoal:   10000,
  waterGoal:   2500,   // ml
  sleepGoal:   8,
}

export const DEFAULT_PROFILE: UserProfile = {
  name:          'User',
  weight:        84,
  height:        182,
  age:           28,
  goal:          'lose',
  activityLevel: 'moderate',
  isPro:         false,
}

export const DEFAULT_SLEEP: SleepData = {
  hours:   7,
  mins:    42,
  quality: 88,
  hrv:     64,
  rhr:     52,
}

export const DEFAULT_FOOD_LOG: FoodEntry[] = [
  { id: 1, name: 'Oats + Protein',  kcal: 480, protein: 32, carbs: 62, fat: 9,  mealType: 'Breakfast', time: '07:45' },
  { id: 2, name: 'Chicken & Rice',  kcal: 720, protein: 48, carbs: 82, fat: 12, mealType: 'Lunch',     time: '13:20' },
  { id: 3, name: 'Greek Yogurt',    kcal: 150, protein: 15, carbs: 12, fat: 3,  mealType: 'Snack',     time: '16:00' },
]

export const DEFAULT_ACTIVITIES: ActivityEntry[] = [
  { id: 1, type: 'Strength Training', duration: 55, intensity: 'High', kcalBurned: 420, time: '10:30' },
]

export const DEFAULT_WEIGHT_LOG: WeightEntry[] = [
  { id: 1, date: 'Feb 20', weight: 84.8 },
  { id: 2, date: 'Feb 22', weight: 84.5 },
  { id: 3, date: 'Feb 24', weight: 84.3 },
  { id: 4, date: 'Feb 26', weight: 84.1 },
]

// ─── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingSlide {
  id:      string
  preview: 'balance' | 'decisions' | 'recovery' | 'sleep'
  tag:     string
  title:   string
  sub:     string
  cta:     string
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id:      'welcome',
    preview: 'balance',
    tag:     'ALL-IN-ONE HEALTH OS',
    title:   'One app.\nAll answers.',
    sub:     'Stop guessing. Know exactly where your body is — calories, recovery, fatigue, sleep — all unified in real time.',
    cta:     'Get Started',
  },
  {
    id:      'feature1',
    preview: 'decisions',
    tag:     'DAILY DECISIONS',
    title:   'Your coach\nin your pocket.',
    sub:     'Every morning, Health OS tells you exactly: train or rest? Eat more or cut? You always know the right move.',
    cta:     'Next',
  },
  {
    id:      'feature2',
    preview: 'recovery',
    tag:     'RECOVERY SCIENCE',
    title:   'Your body\nhas a score.',
    sub:     'HRV, resting heart rate, sleep quality — combined into one Recovery Score that tells you how hard to push today.',
    cta:     'Next',
  },
  {
    id:      'feature3',
    preview: 'sleep',
    tag:     'SLEEP TRACKING',
    title:   'Sleep is\nyour superpower.',
    sub:     'Track deep sleep, REM cycles, and HRV trends. See how last night directly impacts your performance today.',
    cta:     'Next',
  },
]

export const INTEGRATIONS = [
  { id: 'garmin',    name: 'Garmin Connect',  icon: '⌚', desc: 'Steps, HRV, sleep, heart rate',       color: '#3B82F6', note: ''        },
  { id: 'apple',     name: 'Apple Health',    icon: '🍎', desc: 'All health metrics from iPhone',       color: '#EC4899', note: 'iOS only' },
  { id: 'strava',    name: 'Strava',          icon: '🚴', desc: 'Workouts, runs, rides',                color: '#F59E0B', note: ''        },
  { id: 'fatsecret', name: 'FatSecret',       icon: '🥗', desc: 'Food database & nutrition log',        color: '#10B981', note: ''        },
  { id: 'googlefit', name: 'Google Fit',      icon: '📊', desc: 'Activity & heart data (Android)',      color: '#3B82F6', note: 'Android' },
] as const
