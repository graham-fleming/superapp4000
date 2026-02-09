-- Habits table for Habit Tracker
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  category text not null default 'other' check (category in ('health', 'productivity', 'mindfulness', 'learning', 'social', 'other')),
  type text not null default 'boolean' check (type in ('boolean', 'counted')),
  target_count int, -- null for boolean habits, target for counted habits
  color text, -- optional UI color
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Index for user queries
create index if not exists habits_user_idx
  on public.habits (user_id, created_at desc);

-- RLS policies for habits
alter table public.habits enable row level security;

create policy "habits_select_own" on public.habits for select using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits for update using (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits for delete using (auth.uid() = user_id);

-- Habit completions table for tracking daily completions
create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completion_date date not null default current_date,
  value int not null default 1, -- 1 for boolean, actual count for counted
  created_at timestamptz not null default now(),
  constraint habit_completions_unique unique (habit_id, completion_date)
);

-- Index for date range queries
create index if not exists habit_completions_user_date_idx
  on public.habit_completions (user_id, completion_date desc);

create index if not exists habit_completions_habit_date_idx
  on public.habit_completions (habit_id, completion_date desc);

-- RLS policies for habit_completions
alter table public.habit_completions enable row level security;

create policy "habit_completions_select_own" on public.habit_completions for select using (auth.uid() = user_id);
create policy "habit_completions_insert_own" on public.habit_completions for insert with check (auth.uid() = user_id);
create policy "habit_completions_update_own" on public.habit_completions for update using (auth.uid() = user_id);
create policy "habit_completions_delete_own" on public.habit_completions for delete using (auth.uid() = user_id);
