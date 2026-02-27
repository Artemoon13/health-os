-- Health OS: tables + RLS
-- Run in Supabase Dashboard → SQL Editor (or via Supabase CLI)

-- Profiles: one row per user (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'User',
  weight numeric not null default 84,
  height integer not null default 182,
  age integer not null default 28,
  goal text not null default 'lose' check (goal in ('lose','maintain','gain','performance')),
  activity_level text not null default 'moderate' check (activity_level in ('sedentary','light','moderate','active')),
  is_pro boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Goals: one row per user
create table if not exists public.goals (
  id uuid primary key references auth.users(id) on delete cascade,
  calorie_goal integer not null default 2400,
  protein_goal integer not null default 170,
  steps_goal integer not null default 10000,
  water_goal integer not null default 2500,
  sleep_goal integer not null default 8,
  updated_at timestamptz not null default now()
);

-- Sleep: one row per user (last entered sleep)
create table if not exists public.sleep (
  id uuid primary key references auth.users(id) on delete cascade,
  hours integer not null default 7,
  mins integer not null default 0,
  quality integer not null default 80 check (quality >= 0 and quality <= 100),
  hrv integer not null default 60,
  rhr integer not null default 60,
  updated_at timestamptz not null default now()
);

-- Food entries: many per user, filter by log_date
create table if not exists public.food_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kcal integer not null,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  meal_type text not null check (meal_type in ('Breakfast','Lunch','Dinner','Snack')),
  time text not null,
  log_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists food_entries_user_date on public.food_entries(user_id, log_date);

-- Activity entries
create table if not exists public.activity_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  duration integer not null,
  intensity text not null check (intensity in ('Light','Moderate','High')),
  kcal_burned integer not null,
  time text not null,
  log_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists activity_entries_user_date on public.activity_entries(user_id, log_date);

-- Weight log
create table if not exists public.weight_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  weight numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists weight_entries_user on public.weight_entries(user_id);

-- Water: one row per user per day
create table if not exists public.water_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  glasses integer not null default 0,
  primary key (user_id, log_date)
);

-- RLS: users can only access their own data
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.sleep enable row level security;
alter table public.food_entries enable row level security;
alter table public.activity_entries enable row level security;
alter table public.weight_entries enable row level security;
alter table public.water_log enable row level security;

create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

create policy "goals_select" on public.goals for select using (auth.uid() = id);
create policy "goals_insert" on public.goals for insert with check (auth.uid() = id);
create policy "goals_update" on public.goals for update using (auth.uid() = id);

create policy "sleep_select" on public.sleep for select using (auth.uid() = id);
create policy "sleep_insert" on public.sleep for insert with check (auth.uid() = id);
create policy "sleep_update" on public.sleep for update using (auth.uid() = id);

create policy "food_select" on public.food_entries for select using (auth.uid() = user_id);
create policy "food_insert" on public.food_entries for insert with check (auth.uid() = user_id);
create policy "food_delete" on public.food_entries for delete using (auth.uid() = user_id);

create policy "activity_select" on public.activity_entries for select using (auth.uid() = user_id);
create policy "activity_insert" on public.activity_entries for insert with check (auth.uid() = user_id);
create policy "activity_delete" on public.activity_entries for delete using (auth.uid() = user_id);

create policy "weight_select" on public.weight_entries for select using (auth.uid() = user_id);
create policy "weight_insert" on public.weight_entries for insert with check (auth.uid() = user_id);
create policy "weight_delete" on public.weight_entries for delete using (auth.uid() = user_id);

create policy "water_select" on public.water_log for select using (auth.uid() = user_id);
create policy "water_insert" on public.water_log for insert with check (auth.uid() = user_id);
create policy "water_update" on public.water_log for update using (auth.uid() = user_id);

-- Create profile/goals/sleep rows on signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, weight, height, age, goal, activity_level, is_pro)
  values (new.id, coalesce(new.raw_user_meta_data->>'name','User'), 84, 182, 28, 'lose', 'moderate', false);
  insert into public.goals (id) values (new.id);
  insert into public.sleep (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
