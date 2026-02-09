-- Transactions table for Personal Finance Tracker
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null,
  type text not null default 'expense' check (type in ('expense', 'income')),
  category text not null default 'other' check (category in ('food', 'transport', 'housing', 'entertainment', 'shopping', 'health', 'utilities', 'subscriptions', 'income', 'other')),
  transaction_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- Index for date range queries
create index if not exists transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc);

-- RLS policies for transactions
alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);

-- Budgets table for Personal Finance Tracker
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text, -- null means overall monthly budget
  monthly_limit numeric not null,
  budget_month date not null, -- first of month, e.g. 2026-02-01
  created_at timestamptz not null default now(),
  constraint budgets_user_category_month_unique unique (user_id, category, budget_month)
);

-- Index for month queries
create index if not exists budgets_user_month_idx
  on public.budgets (user_id, budget_month desc);

-- RLS policies for budgets
alter table public.budgets enable row level security;

create policy "budgets_select_own" on public.budgets for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets for update using (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets for delete using (auth.uid() = user_id);
