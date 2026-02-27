import type { SupabaseClient } from '@supabase/supabase-js'
import type { AppState, FoodEntry, ActivityEntry, WeightEntry } from '../types'

type Tables = {
  profiles: { id: string; name: string; weight: number; height: number; age: number; goal: string; activity_level: string; is_pro: boolean; onboarding_done?: boolean }
  goals: { id: string; calorie_goal: number; protein_goal: number; steps_goal: number; water_goal: number; sleep_goal: number }
  sleep: { id: string; hours: number; mins: number; quality: number; hrv: number; rhr: number }
  food_entries: { id: number; name: string; kcal: number; protein: number; carbs: number; fat: number; meal_type: string; time: string; log_date: string }
  activity_entries: { id: number; type: string; duration: number; intensity: string; kcal_burned: number; time: string; log_date: string }
  weight_entries: { id: number; date: string; weight: number }
  water_log: { user_id: string; log_date: string; glasses: number }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export async function fetchUserState(
  supabase: SupabaseClient,
  userId: string
): Promise<Partial<Pick<AppState, 'profile' | 'goals' | 'sleep' | 'foodLog' | 'activities' | 'water' | 'weightLog'>>> {
  const date = todayISO()

  const [profiles, goals, sleep, foodRows, activityRows, weightRows, waterRows] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('goals').select('*').eq('id', userId).single(),
    supabase.from('sleep').select('*').eq('id', userId).single(),
    supabase.from('food_entries').select('*').eq('user_id', userId).eq('log_date', date).order('created_at'),
    supabase.from('activity_entries').select('*').eq('user_id', userId).eq('log_date', date).order('created_at'),
    supabase.from('weight_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
    supabase.from('water_log').select('glasses').eq('user_id', userId).eq('log_date', date).single(),
  ])

  const p = profiles.data as Tables['profiles'] | null
  const g = goals.data as Tables['goals'] | null
  const s = sleep.data as Tables['sleep'] | null
  const food = (foodRows.data ?? []) as Tables['food_entries'][]
  const activities = (activityRows.data ?? []) as Tables['activity_entries'][]
  const weights = (weightRows.data ?? []) as Tables['weight_entries'][]
  const waterRow = waterRows.data as Tables['water_log'] | null

  const profile = p ? {
    name: p.name,
    weight: Number(p.weight),
    height: p.height,
    age: p.age,
    goal: p.goal as AppState['profile']['goal'],
    activityLevel: p.activity_level as AppState['profile']['activityLevel'],
    isPro: p.is_pro,
    onboardingDone: p.onboarding_done ?? false,
  } : undefined

  const goalsData = g ? {
    calorieGoal: g.calorie_goal,
    proteinGoal: g.protein_goal,
    stepsGoal: g.steps_goal,
    waterGoal: g.water_goal,
    sleepGoal: g.sleep_goal,
  } : undefined

  const sleepData = s ? {
    hours: s.hours,
    mins: s.mins,
    quality: s.quality,
    hrv: s.hrv,
    rhr: s.rhr,
  } : undefined

  const foodLog: FoodEntry[] = food.map(f => ({
    id: f.id,
    name: f.name,
    kcal: f.kcal,
    protein: Number(f.protein),
    carbs: Number(f.carbs),
    fat: Number(f.fat),
    mealType: f.meal_type as FoodEntry['mealType'],
    time: f.time,
  }))

  const activitiesData: ActivityEntry[] = activities.map(a => ({
    id: a.id,
    type: a.type,
    duration: a.duration,
    intensity: a.intensity as ActivityEntry['intensity'],
    kcalBurned: a.kcal_burned,
    time: a.time,
  }))

  const weightLog: WeightEntry[] = weights.map(w => ({ id: w.id, date: w.date, weight: Number(w.weight) }))
  const water = waterRow?.glasses ?? 0

  return {
    ...(profile && { profile }),
    ...(goalsData && { goals: goalsData }),
    ...(sleepData && { sleep: sleepData }),
    foodLog,
    activities: activitiesData,
    weightLog,
    water,
  }
}

export async function persistUserState(
  supabase: SupabaseClient,
  userId: string,
  state: Pick<AppState, 'profile' | 'goals' | 'sleep' | 'foodLog' | 'activities' | 'water' | 'weightLog'>
) {
  const date = todayISO()

  await Promise.all([
    supabase.from('profiles').upsert({
      id: userId,
      name: state.profile.name,
      weight: state.profile.weight,
      height: state.profile.height,
      age: state.profile.age,
      goal: state.profile.goal,
      activity_level: state.profile.activityLevel,
      is_pro: state.profile.isPro,
      onboarding_done: state.profile.onboardingDone ?? false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' }),
    supabase.from('goals').upsert({
      id: userId,
      calorie_goal: state.goals.calorieGoal,
      protein_goal: state.goals.proteinGoal,
      steps_goal: state.goals.stepsGoal,
      water_goal: state.goals.waterGoal,
      sleep_goal: state.goals.sleepGoal,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' }),
    supabase.from('sleep').upsert({
      id: userId,
      hours: state.sleep.hours,
      mins: state.sleep.mins,
      quality: state.sleep.quality,
      hrv: state.sleep.hrv,
      rhr: state.sleep.rhr,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' }),
  ])

  await supabase.from('food_entries').delete().eq('user_id', userId).eq('log_date', date)
  if (state.foodLog.length > 0) {
    await supabase.from('food_entries').insert(state.foodLog.map(f => ({
      user_id: userId,
      name: f.name,
      kcal: f.kcal,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      meal_type: f.mealType,
      time: f.time,
      log_date: date,
    })))
  }

  await supabase.from('activity_entries').delete().eq('user_id', userId).eq('log_date', date)
  if (state.activities.length > 0) {
    await supabase.from('activity_entries').insert(state.activities.map(a => ({
      user_id: userId,
      type: a.type,
      duration: a.duration,
      intensity: a.intensity,
      kcal_burned: a.kcalBurned,
      time: a.time,
      log_date: date,
    })))
  }

  await supabase.from('weight_entries').delete().eq('user_id', userId)
  if (state.weightLog.length > 0) {
    await supabase.from('weight_entries').insert(state.weightLog.map(w => ({
      user_id: userId,
      date: w.date,
      weight: w.weight,
    })))
  }

  await supabase.from('water_log').upsert({
    user_id: userId,
    log_date: date,
    glasses: state.water,
  }, { onConflict: 'user_id,log_date' })
}
