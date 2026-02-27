# Подключение Garmin Connect

## Можно ли подключить

**Да.** Garmin предоставляет [Garmin Connect Developer Program](https://developer.garmin.com/gc-developer-program/overview/) с доступом к Health API и Activity API. Доступ **бесплатный** для одобренных разработчиков (нужно подать заявку).

## Как получить доступ

1. Заполнить форму: [Garmin Connect Developer Access](https://www.garmin.com/en-US/forms/GarminConnectDeveloperAccess/).
2. После одобрения выдадут доступ к тестовому окружению и документации.
3. Авторизация пользователей: **OAuth 2.0 PKCE** (редирект на Garmin → пользователь разрешает доступ → callback с токеном).
4. Данные приходят в JSON после синка часов/браслета с Garmin Connect.

## Какую пользу можем вытянуть для пользователя

По **Health API** доступны метрики «на весь день»:

| Метрика | Зачем в Health OS |
|--------|---------------------|
| **Steps** (шаги) | Автозаполнение шагов в целях, сравнение с goals.stepsGoal, отображение в Stats/Dashboard. |
| **Sleep** (сон) | Часы сна, качество — подставлять в Recovery и в плитку Sleep на Dashboard вместо ручного ввода. |
| **Heart rate** (пульс) | RHR (resting heart rate) для расчёта Recovery Score. |
| **HRV** (вариабельность) | Уже используем в формуле recovery; с Garmin — реальные значения вместо дефолтных. |
| **Stress** | Можно показывать в Recovery или отдельной карточке. |
| **Body Battery** | Готовый «уровень энергии» — можно отображать рядом с Recovery. |
| **Calories** (активность) | Расход калорий с часов — учитывать в балансе вместо только ручных активностей. |

По **Activity API** — полные тренировки (бег, вело, плавание и т.д.): автоматически подтягивать в экран Activity и в «сожжённые» калории.

## Что нужно для интеграции

- Заявка в Garmin и одобрение.
- В приложении: OAuth 2.0 PKCE (redirect URI, code_verifier/code_challenge).
- Бэкенд или serverless: обмен `code` на токен (нужен client_secret), хранение refresh token, периодический запрос данных от имени пользователя.
- В Supabase: таблица под привязки Garmin (user_id, garmin_user_id, access_token, refresh_token) и фоновый джоб или webhook для подтягивания новых данных после синка.

## Итог

Garmin даёт шаги, сон, пульс, HRV, стресс, Body Battery и тренировки — всё то, что нужно для расчёта Recovery, баланса калорий и целей по шагам/сну. Интеграция реалистична после одобрения заявки и добавления OAuth + бэкенд-логики синка.
