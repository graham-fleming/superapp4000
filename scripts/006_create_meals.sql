-- Meals table for Meal Tracker
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_name text not null,
  meal_type text not null default 'lunch' check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  notes text,
  meal_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Index for date range queries
create index if not exists meals_user_date_idx
  on public.meals (user_id, meal_date desc);

-- RLS policies
alter table public.meals enable row level security;

create policy "meals_select_own" on public.meals for select using (auth.uid() = user_id);
create policy "meals_insert_own" on public.meals for insert with check (auth.uid() = user_id);
create policy "meals_update_own" on public.meals for update using (auth.uid() = user_id);
create policy "meals_delete_own" on public.meals for delete using (auth.uid() = user_id);
