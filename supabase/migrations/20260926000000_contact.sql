create table public.owner_accounts (
  id uuid primary key references auth.users(id) on delete cascade
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  subject text not null check (char_length(subject) between 1 and 160),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now(),
  is_read boolean not null default false,
  is_archived boolean not null default false
);
create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

create table public.contact_rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count integer not null,
  last_sent timestamptz not null
);
create table public.contact_fingerprints (
  key text primary key,
  last_sent timestamptz not null
);

alter table public.owner_accounts enable row level security;
alter table public.contact_messages enable row level security;
alter table public.contact_rate_limits enable row level security;
alter table public.contact_fingerprints enable row level security;

revoke all on public.owner_accounts, public.contact_messages, public.contact_rate_limits, public.contact_fingerprints from anon, authenticated;
grant select on public.owner_accounts to authenticated;
grant select, delete on public.contact_messages to authenticated;
grant update (is_read, is_archived) on public.contact_messages to authenticated;
grant select, insert on public.contact_messages to service_role;
grant select, insert, update on public.contact_rate_limits, public.contact_fingerprints to service_role;

create policy "owner can identify self" on public.owner_accounts for select to authenticated
using (id = (select auth.uid()));
create policy "owner can read messages" on public.contact_messages for select to authenticated
using (exists (select 1 from public.owner_accounts where id = (select auth.uid())));
create policy "owner can update messages" on public.contact_messages for update to authenticated
using (exists (select 1 from public.owner_accounts where id = (select auth.uid())))
with check (exists (select 1 from public.owner_accounts where id = (select auth.uid())));
create policy "owner can delete messages" on public.contact_messages for delete to authenticated
using (exists (select 1 from public.owner_accounts where id = (select auth.uid())));

create or replace function public.submit_contact_message(
  p_name text, p_email text, p_subject text, p_message text,
  p_rate_key text, p_fingerprint text
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  current_rate public.contact_rate_limits%rowtype;
  previous_fingerprint timestamptz;
  new_id uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_rate_key, 0));
  select * into current_rate from public.contact_rate_limits where key = p_rate_key for update;
  if found then
    if current_rate.last_sent > now() - interval '30 seconds' then
      raise exception 'RATE_LIMIT' using errcode = 'P0001';
    end if;
    if current_rate.window_start > now() - interval '1 hour' and current_rate.count >= 5 then
      raise exception 'RATE_LIMIT' using errcode = 'P0001';
    end if;
  end if;
  select last_sent into previous_fingerprint from public.contact_fingerprints where key = p_fingerprint;
  if previous_fingerprint > now() - interval '10 minutes' then
    raise exception 'DUPLICATE' using errcode = 'P0001';
  end if;
  insert into public.contact_messages(name, email, subject, message)
  values (p_name, p_email, p_subject, p_message) returning id into new_id;
  insert into public.contact_rate_limits(key, window_start, count, last_sent)
  values (p_rate_key, now(), 1, now())
  on conflict (key) do update set
    window_start = case when public.contact_rate_limits.window_start <= now() - interval '1 hour' then now() else public.contact_rate_limits.window_start end,
    count = case when public.contact_rate_limits.window_start <= now() - interval '1 hour' then 1 else public.contact_rate_limits.count + 1 end,
    last_sent = now();
  insert into public.contact_fingerprints(key, last_sent) values (p_fingerprint, now())
  on conflict (key) do update set last_sent = now();
  return new_id;
end;
$$;
revoke all on function public.submit_contact_message(text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_contact_message(text,text,text,text,text,text) to service_role;
