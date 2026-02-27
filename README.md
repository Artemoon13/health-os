# ⚡ Health OS

A production-quality personal health management app built with React + TypeScript + Vite.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open http://localhost:5173
```

## Tech Stack

| Layer       | Choice              | Why                                           |
|-------------|---------------------|-----------------------------------------------|
| Framework   | React 18            | Hooks, concurrent rendering                   |
| Language    | TypeScript          | Full type safety across all components        |
| Build       | Vite 5              | Instant HMR, fast cold starts                 |
| State       | Custom hook         | No extra deps, localStorage persistence       |
| Styling     | Inline styles       | Co-located, type-safe, zero runtime overhead  |

No Tailwind, no Redux, no extra packages — just React + TypeScript + Vite.

## Project Structure

```
src/
├── constants/
│   ├── theme.ts          # Colors (C), fonts (F), global CSS
│   └── data.ts           # Food DB, defaults, onboarding config
│
├── types/
│   └── index.ts          # All TypeScript interfaces & unions
│
├── store/
│   └── useStore.ts       # App state, actions, localStorage, computed values
│
├── components/
│   ├── ui/
│   │   ├── Icons.tsx     # All SVG icons as typed components
│   │   └── index.tsx     # Ring, Badge, FBar, Card, Modal, Input, Button
│   │
│   ├── onboarding/
│   │   ├── AppPreview.tsx   # Animated live previews (fake GIFs)
│   │   ├── OnboardingSlide.tsx
│   │   └── index.tsx        # ConnectScreen, SetupGoals, Paywall
│   │
│   ├── modals/
│   │   └── index.tsx     # FoodModal, ActivityModal
│   │
│   ├── screens/
│   │   ├── Dashboard.tsx
│   │   └── index.tsx     # Nutrition, Activity, Recovery, Stats, Profile
│   │
│   └── layout/
│       └── NavBar.tsx
│
└── App.tsx               # Root: routing between onboarding/app/modals
```

## Key Patterns

### State & Data Flow
```
useStore() → single source of truth
  ↓
App.tsx → reads store.screen to route
  ↓
Screens → receive state + action callbacks
  ↓
Modals → call store.addFood / store.addActivity
```

### Computed values (pure functions)
```ts
import { computeBalance, computeRecovery, computeMacros } from './store/useStore'

const { intake, burned, balance, isDeficit } = computeBalance(state)
const recovery = computeRecovery(state)
const { protein, carbs, fat } = computeMacros(state.foodLog)
```

### Adding a new screen
1. Create `src/components/screens/MyScreen.tsx`
2. Export from `src/components/screens/index.tsx`
3. Add tab to `TABS` in `NavBar.tsx`
4. Add `AppTab` union in `types/index.ts`
5. Add case in `App.tsx` `renderScreen()`

### Adding a new modal
1. Create your modal in `src/components/modals/index.tsx`
2. Add to `ModalType` union in `types/index.ts`
3. Render it in `App.tsx`

## Screens

| Screen     | Key features                                      |
|------------|---------------------------------------------------|
| Onboarding | 4 animated slides, device connect, goal setup     |
| Paywall    | Monthly/yearly toggle, 7-day trial CTA            |
| Dashboard  | Balance hero, macro grid, recovery chart, decisions |
| Nutrition  | Intake ring, macros, water tracker, meal log      |
| Activity   | Burn total, session log                           |
| Recovery   | Score ring, fatigue model, AI recommendation      |
| Stats      | Weekly trends, balance chart, weight log          |
| Profile    | Goals, integrations, upgrade banner               |

## Monetization

**Free tier:** Manual food/activity logging, basic balance view  
**Pro ($2.99/mo or $23.99/yr):** AI decisions, full analytics, integrations, recovery scoring

**Paywall placement:** After onboarding — user has already invested time setting up goals.

## Roadmap

Приоритетный план: **[ROADMAP.md](./ROADMAP.md)**

- **Неделя 1:** PWA манифест, GoalEditor, WeightModal, SleepModal  
- **Неделя 2–4:** FatSecret API, Strava OAuth, Vercel деплой  
- **Месяц 2:** Supabase, React Native (Expo), OpenAI Vision

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

**Supabase (backend + auth + sync):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

1. Create a project at [supabase.com](https://supabase.com).
2. In Dashboard → SQL Editor run the migrations in order: `001_health_os_schema.sql`, then `002_profiles_onboarding_done.sql`.
3. Settings → API: copy Project URL and anon public key into `.env`.
4. **Apple / Google login:** Authentication → Providers → enable Apple and/or Google, add credentials (Apple: Services ID, key; Google: OAuth client ID + secret from Google Cloud Console). Redirect URL in Supabase: your site URL (e.g. `https://your-app.vercel.app`).

**Локальный вход через Google/Apple:** после нажатия «Continue with Google» браузер уходит на провайдера, затем Supabase редиректит обратно на **тот же origin**, с которого был запущен вход (например `http://localhost:5173`). Важно:
- Запускай приложение **и открывай его в браузере по тому же адресу**, с которым заходишь в Google (например только `http://localhost:5173`), и не открывай логин в другой вкладке с `localhost:3000` — иначе редирект попадёт на 3000 и будет «This site can't be reached», если там ничего не запущено.
- В Supabase → Authentication → URL Configuration → **Redirect URLs** добавь явно: `http://localhost:5173` (и при необходимости `http://localhost:3000`, если специально запускаешь dev на порту 3000).
- Перед проверкой входа убедись, что dev-сервер запущен (`npm run dev`), и что ты открываешь приложение по тому же URL, который указан в Redirect URLs.

Without these vars the app runs in local-only mode (localStorage, no login).

**FatSecret (поиск еды, опционально):** FatSecret требует whitelist IP для OAuth 2.0; у Vercel serverless IP динамические (статический IP на Vercel платный). Без этого поиск по API не заработает. Сейчас приложение использует локальный список продуктов в «Log Food»; вкладка **Custom** всегда доступна для ручного ввода. Подключить FatSecret можно позже (например, при появлении сервера со статическим IP).

**Опционально:** `VITE_STRAVA_CLIENT_ID` для Strava OAuth.

**Garmin Connect:** подключение возможно через [Garmin Connect Developer Program](https://developer.garmin.com/gc-developer-program/overview/) (заявка, бесплатно для одобренных). Какие данные даёт и как интегрировать — [docs/GARMIN.md](docs/GARMIN.md).

Access in code: `import.meta.env.VITE_SUPABASE_URL` etc.

## Build for production

```bash
npm run build
# → dist/ folder
```

## Деплой на Vercel

Публичная ссылка за пару минут — удобно для бета-тестеров и проверки на телефоне.

1. Установи Vercel CLI (один раз): `npm i -g vercel`
2. В корне проекта выполни:
   ```bash
   npx vercel
   ```
3. Первый раз: логин/регистрация в браузере, ответы на вопросы (все по умолчанию — Enter).
4. В конце получишь ссылку вида `https://health-os-xxx.vercel.app`.
5. Продакшен-деплой (опционально):
   ```bash
   npx vercel --prod
   ```

В проекте уже есть `vercel.json`: сборка через `npm run build`, выход — `dist`, SPA fallback для маршрутов.

**После первого деплоя:**
- Vercel → Project → Settings → Environment Variables: добавь `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` (значения из `.env`), затем **Redeploy**.
- Supabase → Authentication → URL Configuration → **Redirect URLs** → Add URL: `https://твой-проект.vercel.app` (и при необходимости `https://твой-проект.vercel.app/**`), чтобы после входа через Google редирект вёл на приложение.

**Альтернатива:** Netlify — `npx netlify deploy --prod --dir=dist`
