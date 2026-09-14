create table if not exists public.sos_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  contacts jsonb not null default '[]'::jsonb,
  notes text,
  status text not null default 'accepted'
    check (status in ('accepted', 'resolved', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_sos_events_user_id
  on public.sos_events (user_id);

create index if not exists idx_sos_events_created_at
  on public.sos_events (created_at desc);

alter table public.sos_events enable row level security;

drop policy if exists "Users can insert their own SOS events"
  on public.sos_events;

create policy "Users can insert their own SOS events"
  on public.sos_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own SOS events"
  on public.sos_events;

create policy "Users can view their own SOS events"
  on public.sos_events
  for select
  to authenticated
  using (auth.uid() = user_id);
