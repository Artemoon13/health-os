-- Add onboarding_done so we show onboarding after first login
alter table public.profiles
  add column if not exists onboarding_done boolean not null default false;

comment on column public.profiles.onboarding_done is 'When false, user sees onboarding (slides, goals, paywall) after login';
