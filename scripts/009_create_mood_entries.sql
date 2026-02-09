-- Mood entries table for Wellness Journal
create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood int not null check (mood between 1 and 5),
  energy_level int check (energy_level between 1 and 5),
  sleep_quality int check (sleep_quality between 1 and 5),
  notes text,
  tags text[] default '{}',
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint mood_entries_unique_date unique (user_id, entry_date)
);

-- Indexes
create index if not exists mood_entries_user_date_idx
  on public.mood_entries (user_id, entry_date desc);

-- RLS
alter table public.mood_entries enable row level security;

create policy "mood_entries_select_own" on public.mood_entries for select using (auth.uid() = user_id);
create policy "mood_entries_insert_own" on public.mood_entries for insert with check (auth.uid() = user_id);
create policy "mood_entries_update_own" on public.mood_entries for update using (auth.uid() = user_id);
create policy "mood_entries_delete_own" on public.mood_entries for delete using (auth.uid() = user_id);
