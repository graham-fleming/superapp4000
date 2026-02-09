-- Enable the pgvector extension for embedding storage
create extension if not exists vector with schema extensions;

-- Saved items table for Universal Saver
create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_text text not null,
  title text not null,
  summary text,
  category text not null default 'general',
  tags text[] default '{}',
  metadata jsonb default '{}',
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for vector similarity search
create index if not exists saved_items_embedding_idx
  on public.saved_items
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Index for category filtering
create index if not exists saved_items_category_idx
  on public.saved_items (user_id, category);

-- RLS policies
alter table public.saved_items enable row level security;

create policy "saved_items_select_own" on public.saved_items for select using (auth.uid() = user_id);
create policy "saved_items_insert_own" on public.saved_items for insert with check (auth.uid() = user_id);
create policy "saved_items_update_own" on public.saved_items for update using (auth.uid() = user_id);
create policy "saved_items_delete_own" on public.saved_items for delete using (auth.uid() = user_id);

-- Function for semantic search via vector similarity
create or replace function public.search_saved_items(
  query_embedding vector(1536),
  match_user_id uuid,
  match_count int default 20,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  user_id uuid,
  raw_text text,
  title text,
  summary text,
  category text,
  tags text[],
  metadata jsonb,
  created_at timestamptz,
  similarity float
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    si.id,
    si.user_id,
    si.raw_text,
    si.title,
    si.summary,
    si.category,
    si.tags,
    si.metadata,
    si.created_at,
    1 - (si.embedding <=> query_embedding) as similarity
  from public.saved_items si
  where si.user_id = match_user_id
    and si.embedding is not null
    and 1 - (si.embedding <=> query_embedding) > match_threshold
  order by si.embedding <=> query_embedding
  limit match_count;
end;
$$;
