/**
 * UI strings — single locale for now. Replace with i18n (e.g. react-i18next) when adding languages.
 * Usage: import { S } from '../constants/strings'
 */
export const S = {
  // App
  appName: 'Health OS',
  loading: 'Loading…',
  syncing: 'Syncing…',

  // Auth
  signInToSync: 'Sign in to sync across devices',
  continueWithApple: 'Continue with Apple',
  continueWithGoogle: 'Continue with Google',
  signIn: 'Sign in',
  signUp: 'Sign up',
  signOut: 'Sign out',
  checkEmail: 'Check your email to confirm, then sign in.',

  // Onboarding
  skip: 'Skip',

  // Sync banner
  offlineMessage: "You're offline. Changes will sync when back online.",
  syncErrorMessage: "Couldn't save. Check connection and retry.",
  retry: 'Retry',
  dismiss: 'Dismiss',

  // Empty states
  noFoodLogged: 'No food logged yet',
  addFirstMeal: 'Add your first meal to track intake',
  addMeal: '+ Add Meal',
  noActivitiesToday: 'No activities today',
  logWorkoutHint: 'Log a workout to see burn here',
  logActivity: '+ Log Activity',
  noWeightEntries: 'No entries yet',
  logWeightHint: 'Log weight from Dashboard to see your trend here.',

  // Sections
  hydration: 'Hydration',
  foodLog: 'Food Log',
  sessionLog: 'Session Log',
  weightTrend: 'Weight Trend',
  goals: 'Goals',
  integrations: 'Integrations',
} as const

export type Strings = typeof S
