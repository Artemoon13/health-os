# План развития Health OS

## Сделано (Core Product)

| # | Задача | Описание |
|---|--------|----------|
| — | **Daily System Score** | Единый показатель дня 0–100 на Dashboard (sleep, recovery, balance, activity, hydration, protein). Good Day / Okay / Needs attention. |
| — | **Today Priority** | Одна главная рекомендация дня вместо списка (Fix Sleep, Increase Protein, Rest Day, Train Today и т.д.). |
| — | **Morning Check** | При первом открытии дня — попап «How do you feel?» (Energized / Normal / Tired / Exhausted). Retention + субъективные данные. |
| — | **System Stability** | «X days stable» под Score. Сброс при недосыпе &lt;5h, профиците &gt;500 kcal, отсутствии активности. |

---

## Неделя 1 — сделать продуктом

| # | Задача | Описание |
|---|--------|----------|
| 1 | **PWA манифест** | `manifest.json` + иконки → устанавливается на телефон с Home Screen |
| 2 | **GoalEditor модал** | Редактирование целей прямо из Profile |
| 3 | **WeightModal** | Быстрое добавление веса с Dashboard |
| 4 | **SleepModal** | Ручной ввод сна до подключения трекера |

---

## Неделя 2–4 — трафик и монетизация

| # | Задача | Описание |
|---|--------|----------|
| 5 | **FatSecret API** | Реальный поиск еды по названию (бесплатный API, ~300 000 продуктов) |
| 6 | **Strava OAuth** | Авто-импорт тренировок (~2 часа работы) |
| 7 | **Vercel деплой** | `npx vercel` → публичная ссылка → бета-тестеры |

---

## Месяц 2 — рост

| # | Задача | Описание |
|---|--------|----------|
| 8 | **Supabase backend** | База данных + авторизация + sync между устройствами |
| 9 | **React Native (Expo)** | Нативный Apple Health / Garmin без костылей |
| 10 | **OpenAI Vision** | Фото еды → автоматические калории |

---

## Отложено (обсудить / приоритизировать)

| # | Фича | Почему отложено |
|---|------|------------------|
| A | **Quick Log (swipe)** | Swipe-down меню + Meal/Workout/Weight/Sleep — нужно проверить UX на мобильном, альтернатива: FAB с быстрыми действиями. |
| B | **Insight of the Day** | «Your recovery drops after 2 deficit days» — важно качество и привязка к своим данным; риск шаблонных фраз. |
| C | **Weekly Report** | Expected fat loss vs real balance, consistency, risk — логично после модели дефицита/веса (Effort vs Result). |
| D | **Physiological Notifications** | Утреннее «Your body is ready», вечер «320 kcal over target», «Recovery dropping 2 days» — нужна архитектура (каналы, пороги, не спам). |
| E | **Body State Modes** | Recovery / Performance / Fat Loss / Overload — UI по режиму; делать после стабильных Score и рекомендаций. |
| F | **Tomorrow Readiness (forecast)** | Предсказание готовности на завтра — сильная фича; после отладки Daily Score и стабильности. |
| G | **Effort vs Result** | «5 тренировок → ожидаемо −0.4 kg» — нужна модель дефицита/веса и накопление данных. |
