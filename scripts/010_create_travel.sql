-- Trips table
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  description text,
  status text not null default 'planning' check (status in ('planning','booked','in_progress','completed')),
  start_date date,
  end_date date,
  budget numeric(10,2),
  currency text default 'USD',
  cover_color text,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

create index if not exists trips_user_idx on public.trips (user_id, start_date desc);

alter table public.trips enable row level security;
create policy "trips_select_own" on public.trips for select using (auth.uid() = user_id);
create policy "trips_insert_own" on public.trips for insert with check (auth.uid() = user_id);
create policy "trips_update_own" on public.trips for update using (auth.uid() = user_id);
create policy "trips_delete_own" on public.trips for delete using (auth.uid() = user_id);

-- Trip activities table
create table if not exists public.trip_activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  activity_date date,
  start_time time,
  end_time time,
  location text,
  category text not null default 'other' check (category in ('transport','accommodation','food','sightseeing','activity','other')),
  cost numeric(10,2),
  is_booked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists trip_activities_trip_idx on public.trip_activities (trip_id, activity_date, start_time);

alter table public.trip_activities enable row level security;
create policy "trip_activities_select_own" on public.trip_activities for select using (auth.uid() = user_id);
create policy "trip_activities_insert_own" on public.trip_activities for insert with check (auth.uid() = user_id);
create policy "trip_activities_update_own" on public.trip_activities for update using (auth.uid() = user_id);
create policy "trip_activities_delete_own" on public.trip_activities for delete using (auth.uid() = user_id);

-- Trip expenses table
create table if not exists public.trip_expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(10,2) not null,
  category text not null default 'other' check (category in ('transport','accommodation','food','activities','shopping','other')),
  expense_date date default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists trip_expenses_trip_idx on public.trip_expenses (trip_id, expense_date desc);

alter table public.trip_expenses enable row level security;
create policy "trip_expenses_select_own" on public.trip_expenses for select using (auth.uid() = user_id);
create policy "trip_expenses_insert_own" on public.trip_expenses for insert with check (auth.uid() = user_id);
create policy "trip_expenses_update_own" on public.trip_expenses for update using (auth.uid() = user_id);
create policy "trip_expenses_delete_own" on public.trip_expenses for delete using (auth.uid() = user_id);
