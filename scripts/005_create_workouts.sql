-- Workouts table for Fitness Tracker
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  category text not null default 'strength' check (category in ('strength', 'cardio', 'flexibility')),
  sets int,
  reps int,
  weight_lbs numeric,
  duration_minutes numeric,
  notes text,
  workout_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Index for date range queries
create index if not exists workouts_user_date_idx
  on public.workouts (user_id, workout_date desc);

-- RLS policies
alter table public.workouts enable row level security;

create policy "workouts_select_own" on public.workouts for select using (auth.uid() = user_id);
create policy "workouts_insert_own" on public.workouts for insert with check (auth.uid() = user_id);
create policy "workouts_update_own" on public.workouts for update using (auth.uid() = user_id);
create policy "workouts_delete_own" on public.workouts for delete using (auth.uid() = user_id);
