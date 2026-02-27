import { describe, it, expect } from 'vitest'
import { computeBalance, computeRecovery, computeMacros } from './useStore'
import type { AppState } from '../types'

const baseState: AppState = {
  screen: 'app',
  tab: 'dashboard',
  modal: null,
  profile: {
    name: 'Test',
    weight: 80,
    height: 180,
    age: 30,
    goal: 'maintain',
    activityLevel: 'moderate',
    isPro: false,
  },
  goals: {
    calorieGoal: 2400,
    proteinGoal: 150,
    stepsGoal: 10000,
    waterGoal: 2500,
    sleepGoal: 8,
  },
  sleep: {
    hours: 7,
    mins: 30,
    quality: 75,
    hrv: 55,
    rhr: 58,
  },
  foodLog: [
    { id: 1, name: 'Oatmeal', kcal: 350, protein: 12, carbs: 60, fat: 6, mealType: 'Breakfast', time: '08:00' },
    { id: 2, name: 'Chicken', kcal: 450, protein: 45, carbs: 0, fat: 25, mealType: 'Lunch', time: '13:00' },
  ],
  activities: [
    { id: 1, type: 'Run', duration: 30, intensity: 'Moderate', kcalBurned: 280, time: '07:00' },
  ],
  water: 6,
  weightLog: [],
  lastDaySummary: null,
  dailySummaries: [],
}

describe('computeBalance', () => {
  it('sums intake from food log', () => {
    const { intake } = computeBalance(baseState)
    expect(intake).toBe(350 + 450)
  })

  it('includes base 350 + activity burn', () => {
    const { burned } = computeBalance(baseState)
    expect(burned).toBe(350 + 280)
  })

  it('computes balance as intake - burned', () => {
    const { balance } = computeBalance(baseState)
    expect(balance).toBe(800 - 630)
  })

  it('isOverGoal when intake > calorieGoal', () => {
    const over: AppState = { ...baseState, foodLog: [...baseState.foodLog, { id: 3, name: 'X', kcal: 3000, protein: 0, carbs: 0, fat: 0, mealType: 'Snack', time: '12:00' }] }
    const { isOverGoal } = computeBalance(over)
    expect(isOverGoal).toBe(true)
  })
})

describe('computeRecovery', () => {
  it('returns number between 0 and 95', () => {
    const score = computeRecovery(baseState)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(95)
  })

  it('increases with more sleep hours', () => {
    const low = computeRecovery({ ...baseState, sleep: { ...baseState.sleep, hours: 4 } })
    const high = computeRecovery({ ...baseState, sleep: { ...baseState.sleep, hours: 8 } })
    expect(high).toBeGreaterThan(low)
  })

  it('increases with higher HRV', () => {
    const low = computeRecovery({ ...baseState, sleep: { ...baseState.sleep, hrv: 30 } })
    const high = computeRecovery({ ...baseState, sleep: { ...baseState.sleep, hrv: 80 } })
    expect(high).toBeGreaterThan(low)
  })
})

describe('computeMacros', () => {
  it('sums protein, carbs, fat from food log', () => {
    const { protein, carbs, fat } = computeMacros(baseState.foodLog)
    expect(protein).toBe(12 + 45)
    expect(carbs).toBe(60 + 0)
    expect(fat).toBe(6 + 25)
  })
})
