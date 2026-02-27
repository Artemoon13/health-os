import { C, GLOBAL_CSS } from './constants/theme'
import { ONBOARDING_SLIDES } from './constants/data'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'
import { useAuth } from './lib/useAuth'
import { fetchUserState, persistUserState } from './lib/supabaseSync'
import { track } from './lib/analytics'
import { S } from './constants/strings'

// Auth
import { AuthScreen } from './components/auth/AuthScreen'
import { SyncBanner } from './components/ui/SyncBanner'

// Onboarding
import { OnboardingSlide } from './components/onboarding/OnboardingSlide'
import { ConnectScreen, SetupGoals, Paywall } from './components/onboarding'

// Modals
import { FoodModal, ActivityModal, WeightModal, SleepModal, GoalEditorModal } from './components/modals'
import { MorningCheckModal } from './components/modals/MorningCheckModal'

// Screens
import { Dashboard } from './components/screens/Dashboard'
import { Nutrition, Activity, Recovery, Stats, Profile } from './components/screens'

// Layout
import { NavBar } from './components/layout/NavBar'

// ─── Ambient background glows ────────────────────────────────────────────────

function AmbientBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: C.blue, filter: 'blur(120px)', opacity: .04, top: -80, right: -60 }} />
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: C.green, filter: 'blur(100px)', opacity: .04, bottom: 120, left: -40 }} />
    </div>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────

const SHELL_STYLE: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  background:  C.bg,
  color:       C.text,
  height:      '100vh',
  maxWidth:    430,
  margin:      '0 auto',
  display:     'flex',
  flexDirection: 'column',
  overflow:    'hidden',
  position:    'relative',
}

// ─── Root App ─────────────────────────────────────────────────────────────────

const DATA_SYNC_DEBOUNCE_MS = 2000

const TAB_TO_HASH: Record<string, string> = {
  dashboard: 'dashboard',
  nutrition: 'nutrition',
  activity: 'activity',
  recovery: 'recovery',
  stats: 'stats',
  profile: 'profile',
}
type AppTab = import('./types').AppTab
const HASH_TO_TAB = Object.fromEntries(Object.entries(TAB_TO_HASH).map(([k, v]) => [v, k])) as Record<string, AppTab>

export default function App() {
  const store = useStore()
  const [onbSlide, setOnbSlide] = useState(0)
  const { user, session, loading: authLoading, signIn, signUp, signInWithOAuth, signOut } = useAuth()
  const [dataLoaded, setDataLoaded] = useState(!supabase || !user)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine)
  const [editingFoodId, setEditingFoodId] = useState<number | null>(null)
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null)
  const [editingWeightId, setEditingWeightId] = useState<number | null>(null)

  const useSupabase = Boolean(supabase)

  // Hash routing: read initial tab from URL on first load
  useEffect(() => {
    const hash = window.location.hash.slice(2) // #/nutrition -> nutrition
    const tab = (hash && HASH_TO_TAB[hash]) || 'dashboard'
    if (tab && tab !== store.tab) store.setTab(tab)
  }, [])

  // Hash routing: sync tab -> URL (no reload)
  useEffect(() => {
    const want = `#/${TAB_TO_HASH[store.tab]}`
    if (window.location.hash !== want) window.history.replaceState(null, '', want)
  }, [store.tab])

  // Hash routing: URL -> tab (browser back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(2)
      const tab = (hash && HASH_TO_TAB[hash]) || 'dashboard'
      store.setTab(tab)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [store.setTab])

  // Offline detection
  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    if (store.screen === 'paywall') track('paywall_view')
  }, [store.screen])

  // Roll over previous day into stability when we open app on a new day
  useEffect(() => {
    const todayIso = new Date().toISOString().slice(0, 10)
    const prev = store.lastDaySummary
    if (prev && prev.date < todayIso) store.closeDayAndUpdateStability(todayIso)
  }, [store.lastDaySummary?.date])

  const handleSyncRetry = useCallback(() => {
    const client = supabase
    if (!client || !user?.id) return
    setSyncError(null)
    persistUserState(client, user.id, {
      profile: store.profile,
      goals: store.goals,
      sleep: store.sleep,
      foodLog: store.foodLog,
      activities: store.activities,
      water: store.water,
      weightLog: store.weightLog,
    })
      .then(() => setSyncError(null))
      .catch(() => setSyncError('sync_failed'))
  }, [user?.id, store.profile, store.goals, store.sleep, store.foodLog, store.activities, store.water, store.weightLog])

  // Fetch from Supabase when user logs in
  useEffect(() => {
    const client = supabase
    if (!client || !user?.id || !store.hydrate) return
    let cancelled = false
    setDataLoaded(false)
    setSyncError(null)
    fetchUserState(client, user.id).then((data) => {
      if (!cancelled) {
        if (store.hydrate) store.hydrate(data)
        store.setScreen(data.profile?.onboardingDone ? 'app' : 'onboarding')
        track('login', { method: 'supabase' })
      }
      setDataLoaded(true)
    }).catch(() => setDataLoaded(true))
    return () => { cancelled = true }
  }, [user?.id])

  // Persist to Supabase when state changes (debounced)
  useEffect(() => {
    const client = supabase
    if (!client || !user?.id || !dataLoaded) return
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      persistUserState(client, user.id, {
        profile: store.profile,
        goals: store.goals,
        sleep: store.sleep,
        foodLog: store.foodLog,
        activities: store.activities,
        water: store.water,
        weightLog: store.weightLog,
      })
        .then(() => setSyncError(null))
        .catch(() => setSyncError('sync_failed'))
      persistTimerRef.current = null
    }, DATA_SYNC_DEBOUNCE_MS)
    return () => { if (persistTimerRef.current) clearTimeout(persistTimerRef.current) }
  }, [
    dataLoaded,
    user?.id,
    store.profile,
    store.goals,
    store.sleep,
    store.foodLog,
    store.activities,
    store.water,
    store.weightLog,
  ])

  // ── Supabase: auth gate ──
  if (useSupabase) {
    if (authLoading) {
      return (
        <>
          <style>{GLOBAL_CSS}</style>
          <div style={{ ...SHELL_STYLE, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.sub }}>{S.loading}</div>
          </div>
        </>
      )
    }
    if (!user) {
      return (
        <>
          <style>{GLOBAL_CSS}</style>
          <div style={SHELL_STYLE}>
            <AuthScreen onSignIn={signIn} onSignUp={signUp} onSignInWithOAuth={signInWithOAuth} />
          </div>
        </>
      )
    }
    if (!dataLoaded) {
      return (
        <>
          <style>{GLOBAL_CSS}</style>
          <div style={{ ...SHELL_STYLE, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.sub }}>{S.syncing}</div>
          </div>
        </>
      )
    }
  }

  // ── ONBOARDING (first-time users: with or without Supabase) ──
  if (store.screen === 'onboarding') {
    const slide  = ONBOARDING_SLIDES[onbSlide]
    const isLast = onbSlide === ONBOARDING_SLIDES.length - 1

    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div style={SHELL_STYLE}>
          {/* Progress dots */}
          <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 }}>
            {ONBOARDING_SLIDES.map((_, i) => (
              <div key={i} style={{ height: 4, width: i === onbSlide ? 24 : 8, background: i === onbSlide ? C.blue : C.b, borderRadius: 99, transition: 'all .4s ease' }} />
            ))}
          </div>
          {/* Skip button */}
          {!isLast && (
            <button onClick={() => store.setScreen('connect')} style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: 'none', border: 'none', color: C.sub, fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', padding: '8px 12px' }}>
              Skip
            </button>
          )}
          <OnboardingSlide
            slide={slide}
            isLast={isLast}
            onNext={() => isLast ? store.setScreen('connect') : setOnbSlide(s => s + 1)}
          />
        </div>
      </>
    )
  }

  // ── CONNECT DEVICES ──
  if (store.screen === 'connect') {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div style={SHELL_STYLE}>
          <ConnectScreen onNext={() => store.setScreen('goals')} />
        </div>
      </>
    )
  }

  // ── SETUP GOALS ──
  if (store.screen === 'goals') {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div style={SHELL_STYLE}>
          <SetupGoals
            onNext={(data) => {
              store.updateProfile({
                weight:        +data.weight || 84,
                height:        +data.height || 182,
                age:           +data.age    || 28,
                goal:          data.goal,
                activityLevel: data.activity,
              })
              store.setScreen('paywall')
            }}
          />
        </div>
      </>
    )
  }

  // ── PAYWALL ──
  if (store.screen === 'paywall') {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div style={{ ...SHELL_STYLE, overflow: 'hidden' }}>
          <Paywall
            onStartTrial={() => { track('paywall_trial_start'); store.updateProfile({ isPro: true, onboardingDone: true }); store.setScreen('app') }}
            onSkip={() => { track('paywall_skip'); store.updateProfile({ onboardingDone: true }); store.setScreen('app') }}
          />
        </div>
      </>
    )
  }

  // ── MAIN APP ──
  const renderScreen = () => {
    switch (store.tab) {
      case 'dashboard': return (
        <Dashboard
          state={store}
          onAddFood={() => { setEditingFoodId(null); store.setModal('food') }}
          onAddActivity={() => { setEditingActivityId(null); store.setModal('activity') }}
          onAddWeight={() => { setEditingWeightId(null); store.setModal('weight') }}
          onAddSleep={() => store.setModal('sleep')}
        />
      )
      case 'nutrition': return (
        <Nutrition
          state={store}
          onAddFood={() => { setEditingFoodId(null); store.setModal('food') }}
          onEditFood={(id) => { setEditingFoodId(id); store.setModal('food') }}
          onDelete={store.removeFood}
          setWater={store.setWater}
        />
      )
      case 'activity': return (
        <Activity
          state={store}
          onAddActivity={() => { setEditingActivityId(null); store.setModal('activity') }}
          onEditActivity={(id) => { setEditingActivityId(id); store.setModal('activity') }}
          onDelete={store.removeActivity}
        />
      )
      case 'recovery': return <Recovery state={store} />
      case 'stats': return (
        <Stats
          state={store}
          onEditWeight={(id) => { setEditingWeightId(id); store.setModal('weight') }}
          onDeleteWeight={store.removeWeightEntry}
        />
      )
      case 'profile':  return (
        <Profile
          state={store}
          onEditGoals={() => store.setModal('goalEditor')}
          onSignOut={useSupabase ? signOut : undefined}
        />
      )
    }
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={SHELL_STYLE}>
        <AmbientBackground />

        {useSupabase && (syncError || isOffline) && (
          <SyncBanner
            syncError={syncError}
            isOffline={isOffline}
            onRetry={handleSyncRetry}
            onDismiss={() => setSyncError(null)}
          />
        )}

        {/* Scrollable content */}
        <div className="scroll-hidden" style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
          {renderScreen()}
        </div>

        {/* Modals */}
        {store.modal === 'food' && (
          <FoodModal
            key={`food-${editingFoodId ?? 'new'}`}
            onClose={() => { store.setModal(null); setEditingFoodId(null) }}
            onAdd={store.addFood}
            onUpdate={store.updateFood}
            editEntry={editingFoodId != null ? store.foodLog.find(f => f.id === editingFoodId) ?? null : null}
          />
        )}
        {store.modal === 'activity' && (
          <ActivityModal
            key={`activity-${editingActivityId ?? 'new'}`}
            onClose={() => { store.setModal(null); setEditingActivityId(null) }}
            onAdd={store.addActivity}
            onUpdate={store.updateActivity}
            editEntry={editingActivityId != null ? store.activities.find(a => a.id === editingActivityId) ?? null : null}
          />
        )}
        {store.modal === 'weight' && (
          <WeightModal
            key={`weight-${editingWeightId ?? 'new'}`}
            onClose={() => { store.setModal(null); setEditingWeightId(null) }}
            onLog={store.logWeight}
            onUpdate={store.updateWeightEntry}
            lastWeight={store.weightLog[store.weightLog.length - 1]?.weight}
            editEntry={editingWeightId != null ? store.weightLog.find(w => w.id === editingWeightId) ?? null : null}
          />
        )}
        {store.modal === 'sleep' && (
          <SleepModal
            onClose={() => store.setModal(null)}
            onSave={store.updateSleep}
            current={store.sleep}
          />
        )}
        {store.modal === 'goalEditor' && (
          <GoalEditorModal
            onClose={() => store.setModal(null)}
            onSave={store.updateGoals}
            goals={store.goals}
          />
        )}

        {/* Morning Check — first open of the day */}
        {store.screen === 'app' && (() => {
          const todayIso = new Date().toISOString().slice(0, 10)
          if (store.profile.lastMorningCheckDate === todayIso) return null
          return (
            <MorningCheckModal
              onClose={() => store.setMorningCheck(todayIso, 'normal')}
              onSelect={(feeling) => store.setMorningCheck(todayIso, feeling)}
            />
          )
        })()}

        {/* Nav */}
        <NavBar activeTab={store.tab} onChange={store.setTab} />
      </div>
    </>
  )
}
