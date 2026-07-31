-- Auto Craft: full schema + RLS + realtime + storage
-- Jalankan di Supabase SQL Editor atau via: supabase db push

-- Extensions
create extension if not exists "pgcrypto";

-- Roles enum as text with check constraints
-- ============================================================
-- USERS (profile, linked to auth.users)
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  nomor_pelanggan text unique,
  nama text not null,
  email text not null unique,
  nomor_hp text,
  role text not null default 'customer'
    check (role in ('customer', 'kasir', 'admin')),
  foto text,
  status text not null default 'aktif'
    check (status in ('aktif', 'nonaktif', 'suspended')),
  notify_email boolean not null default true,
  notify_reminder boolean not null default true,
  notify_promo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (role);
create index if not exists users_nomor_pelanggan_idx on public.users (nomor_pelanggan);

-- ============================================================
-- VEHICLES
-- ============================================================
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  merk text not null,
  tipe text not null,
  tahun integer not null check (tahun >= 1950 and tahun <= 2100),
  nomor_polisi text not null,
  warna text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vehicles_user_id_idx on public.vehicles (user_id);
create unique index if not exists vehicles_nomor_polisi_uidx on public.vehicles (upper(nomor_polisi));

-- ============================================================
-- BOOKINGS
-- ============================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  tanggal timestamptz not null,
  jenis_servis text,
  keluhan text,
  mekanik text,
  status text not null default 'menunggu'
    check (status in ('menunggu', 'diproses', 'diterima', 'ditolak', 'selesai', 'dibatalkan')),
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_user_id_idx on public.bookings (user_id);
create index if not exists bookings_tanggal_idx on public.bookings (tanggal);
create index if not exists bookings_status_idx on public.bookings (status);

-- ============================================================
-- SERVICES
-- ============================================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  user_id uuid not null references public.users (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  nomor_invoice text unique,
  tanggal date not null default current_date,
  mekanik text,
  keluhan text,
  pekerjaan text,
  sparepart jsonb not null default '[]'::jsonb,
  jasa jsonb not null default '[]'::jsonb,
  total numeric(14, 2) not null default 0,
  status text not null default 'proses'
    check (status in ('proses', 'selesai', 'dibatalkan')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_user_id_idx on public.services (user_id);
create index if not exists services_tanggal_idx on public.services (tanggal);
create index if not exists services_booking_id_idx on public.services (booking_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  nomor_invoice text,
  metode text not null default 'tunai'
    check (metode in ('tunai', 'transfer', 'qris', 'kartu', 'dp')),
  total numeric(14, 2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'lunas', 'gagal', 'refund')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_service_id_idx on public.payments (service_id);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_created_at_idx on public.payments (created_at);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);

-- ============================================================
-- HELPER FUNCTIONS (role from public.users, NOT user_metadata)
-- ============================================================
create or replace function public.current_user_role()
returns text
language sql
stable
security invoker
set search_path = public
as $$
  select role from public.users where id = (select auth.uid());
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = (select auth.uid())
      and role in ('admin', 'kasir')
      and status = 'aktif'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = (select auth.uid())
      and role = 'admin'
      and status = 'aktif'
  );
$$;

create or replace function public.generate_nomor_pelanggan()
returns text
language plpgsql
as $$
declare
  next_num integer;
begin
  select coalesce(max(nullif(regexp_replace(nomor_pelanggan, '\D', '', 'g'), '')::integer), 1000) + 1
  into next_num
  from public.users
  where nomor_pelanggan is not null;
  return 'AC-' || lpad(next_num::text, 5, '0');
end;
$$;

create or replace function public.generate_invoice_number()
returns text
language plpgsql
as $$
declare
  next_num integer;
begin
  select coalesce(max(nullif(regexp_replace(nomor_invoice, '\D', '', 'g'), '')::integer), 0) + 1
  into next_num
  from public.services
  where nomor_invoice is not null;
  return 'INV-' || to_char(now(), 'YYYYMM') || '-' || lpad(next_num::text, 4, '0');
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, nama, email, nomor_hp, role, nomor_pelanggan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nama', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'nomor_hp',
    coalesce(new.raw_app_meta_data->>'role', 'customer'),
    case
      when coalesce(new.raw_app_meta_data->>'role', 'customer') = 'customer'
        then public.generate_nomor_pelanggan()
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists vehicles_updated_at on public.vehicles;
create trigger vehicles_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

create or replace function public.services_set_invoice()
returns trigger
language plpgsql
as $$
begin
  if new.nomor_invoice is null then
    new.nomor_invoice := public.generate_invoice_number();
  end if;
  return new;
end;
$$;

drop trigger if exists services_invoice_trg on public.services;
create trigger services_invoice_trg
  before insert on public.services
  for each row execute function public.services_set_invoice();

-- Prevent customers from changing protected fields
create or replace function public.protect_user_fields()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_staff() then
    if new.nama is distinct from old.nama
      or new.nomor_pelanggan is distinct from old.nomor_pelanggan
      or new.email is distinct from old.email
      or new.role is distinct from old.role
      or new.status is distinct from old.status
    then
      raise exception 'Customer tidak boleh mengubah nama, nomor pelanggan, email, role, atau status';
    end if;
  end if;

  if not public.is_admin() and new.role is distinct from old.role then
    raise exception 'Hanya admin yang dapat mengubah role';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_user_fields_trg on public.users;
create trigger protect_user_fields_trg
  before update on public.users
  for each row execute function public.protect_user_fields();

-- ============================================================
-- RLS
-- ============================================================
alter table public.users enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.services enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

-- USERS policies
drop policy if exists "users_select_own_or_staff" on public.users;
create policy "users_select_own_or_staff" on public.users
  for select to authenticated
  using ((select auth.uid()) = id or public.is_staff());

drop policy if exists "users_update_own_or_staff" on public.users;
create policy "users_update_own_or_staff" on public.users
  for update to authenticated
  using ((select auth.uid()) = id or public.is_staff())
  with check ((select auth.uid()) = id or public.is_staff());

drop policy if exists "users_insert_staff" on public.users;
create policy "users_insert_staff" on public.users
  for insert to authenticated
  with check (public.is_staff() or (select auth.uid()) = id);

drop policy if exists "users_delete_admin" on public.users;
create policy "users_delete_admin" on public.users
  for delete to authenticated
  using (public.is_admin());

-- VEHICLES
drop policy if exists "vehicles_select" on public.vehicles;
create policy "vehicles_select" on public.vehicles
  for select to authenticated
  using ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "vehicles_insert" on public.vehicles;
create policy "vehicles_insert" on public.vehicles
  for insert to authenticated
  with check ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "vehicles_update" on public.vehicles;
create policy "vehicles_update" on public.vehicles
  for update to authenticated
  using ((select auth.uid()) = user_id or public.is_staff())
  with check ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "vehicles_delete" on public.vehicles;
create policy "vehicles_delete" on public.vehicles
  for delete to authenticated
  using ((select auth.uid()) = user_id or public.is_staff());

-- BOOKINGS
drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select" on public.bookings
  for select to authenticated
  using ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "bookings_insert" on public.bookings;
create policy "bookings_insert" on public.bookings
  for insert to authenticated
  with check ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "bookings_update" on public.bookings;
create policy "bookings_update" on public.bookings
  for update to authenticated
  using ((select auth.uid()) = user_id or public.is_staff())
  with check ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "bookings_delete" on public.bookings;
create policy "bookings_delete" on public.bookings
  for delete to authenticated
  using (public.is_staff() or ((select auth.uid()) = user_id and status = 'menunggu'));

-- SERVICES
drop policy if exists "services_select" on public.services;
create policy "services_select" on public.services
  for select to authenticated
  using ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "services_insert" on public.services;
create policy "services_insert" on public.services
  for insert to authenticated
  with check (public.is_staff());

drop policy if exists "services_update" on public.services;
create policy "services_update" on public.services
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "services_delete" on public.services;
create policy "services_delete" on public.services
  for delete to authenticated
  using (public.is_admin());

-- PAYMENTS
drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments
  for select to authenticated
  using ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert" on public.payments
  for insert to authenticated
  with check (public.is_staff());

drop policy if exists "payments_update" on public.payments;
create policy "payments_update" on public.payments
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "payments_delete" on public.payments;
create policy "payments_delete" on public.payments
  for delete to authenticated
  using (public.is_admin());

-- NOTIFICATIONS
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications
  for select to authenticated
  using ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications
  for insert to authenticated
  with check (public.is_staff() or (select auth.uid()) = user_id);

drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications
  for update to authenticated
  using ((select auth.uid()) = user_id or public.is_staff())
  with check ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "notifications_delete" on public.notifications;
create policy "notifications_delete" on public.notifications
  for delete to authenticated
  using ((select auth.uid()) = user_id or public.is_staff());

-- Grants for Data API
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ============================================================
-- REALTIME
-- ============================================================
alter table public.users replica identity full;
alter table public.vehicles replica identity full;
alter table public.bookings replica identity full;
alter table public.services replica identity full;
alter table public.payments replica identity full;
alter table public.notifications replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.users;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.vehicles;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.bookings;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.services;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.payments;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
end $$;

-- ============================================================
-- STORAGE: avatars bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar public read" on storage.objects;
create policy "Avatar public read" on storage.objects
  for select to public
  using (bucket_id = 'avatars');

drop policy if exists "Avatar upload own" on storage.objects;
create policy "Avatar upload own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Avatar update own" on storage.objects;
create policy "Avatar update own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Avatar delete own or staff" on storage.objects;
create policy "Avatar delete own or staff" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.is_staff()
    )
  );

drop policy if exists "Avatar staff upload" on storage.objects;
create policy "Avatar staff upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and public.is_staff());
-- ============================================================
-- AUTO CRAFT LANGKAH 1: SEMUA TABEL UTAMA & INDEX
-- ============================================================
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  nomor_pelanggan text unique,
  nama text not null,
  email text not null unique,
  nomor_hp text,
  role text not null default 'customer' check (role in ('customer', 'kasir', 'admin')),
  foto text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif', 'suspended')),
  notify_email boolean not null default true,
  notify_reminder boolean not null default true,
  notify_promo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.users enable row level security;
create index if not exists users_role_idx on public.users (role);
create index if not exists users_nomor_pelanggan_idx on public.users (nomor_pelanggan);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  merk text not null,
  tipe text not null,
  tahun integer not null check (tahun >= 1950 and tahun <= 2100),
  nomor_polisi text not null,
  warna text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.vehicles enable row level security;
create index if not exists vehicles_user_id_idx on public.vehicles (user_id);
create unique index if not exists vehicles_nomor_polisi_uidx on public.vehicles (upper(nomor_polisi));

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  tanggal timestamptz not null,
  jenis_servis text,
  keluhan text,
  mekanik text,
  status text not null default 'menunggu' check (status in ('menunggu', 'diproses', 'diterima', 'ditolak', 'selesai', 'dibatalkan')),
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.bookings enable row level security;
create index if not exists bookings_user_id_idx on public.bookings (user_id);
create index if not exists bookings_tanggal_idx on public.bookings (tanggal);
create index if not exists bookings_status_idx on public.bookings (status);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  user_id uuid not null references public.users (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  nomor_invoice text unique,
  tanggal date not null default current_date,
  mekanik text,
  keluhan text,
  pekerjaan text,
  sparepart jsonb not null default '[]'::jsonb,
  jasa jsonb not null default '[]'::jsonb,
  total numeric(14, 2) not null default 0,
  status text not null default 'proses' check (status in ('proses', 'selesai', 'dibatalkan')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.services enable row level security;
create index if not exists services_user_id_idx on public.services (user_id);
create index if not exists services_tanggal_idx on public.services (tanggal);
create index if not exists services_booking_id_idx on public.services (booking_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  nomor_invoice text,
  metode text not null default 'tunai' check (metode in ('tunai', 'transfer', 'qris', 'kartu', 'dp')),
  total numeric(14, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'lunas', 'gagal', 'refund')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_service_id_idx on public.payments (service_id);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_created_at_idx on public.payments (created_at);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create index if not exists notifications_user_id_idx on public.notifications (user_id);

-- ============================================================
-- AUTO CRAFT LANGKAH 2 (FIXED): LOGIKA FUNGSI & OTOMATISASI TRIGGER
-- ============================================================

create or replace function public.current_user_role() returns text language sql stable security invoker set search_path = public as $$ select role from public.users where id = (select auth.uid()); $$;
create or replace function public.is_staff() returns boolean language sql stable security invoker set search_path = public as $$ select exists (select 1 from public.users where id = (select auth.uid()) and role in ('admin', 'kasir') and status = 'aktif'); $$;
create or replace function public.is_admin() returns boolean language sql stable security invoker set search_path = public as $$ select exists (select 1 from public.users where id = (select auth.uid()) and role = 'admin' and status = 'aktif'); $$;

create or replace function public.generate_nomor_pelanggan() returns text language plpgsql as $$
declare next_num integer;
begin
  select coalesce(max(nullif(regexp_replace(nomor_pelanggan, '\D', '', 'g'), '')::integer), 1000) + 1 into next_num from public.users where nomor_pelanggan is not null;
  return 'AC-' || lpad(next_num::text, 5, '0');
end; $$;

create or replace function public.generate_invoice_number() returns text language plpgsql as $$
declare next_num integer;
begin
  select coalesce(max(nullif(regexp_replace(nomor_invoice, '\D', '', 'g'), '')::integer), 0) + 1 into next_num from public.services where nomor_invoice is not null;
  return 'INV-' || to_char(now(), 'YYYYMM') || '-' || lpad(next_num::text, 4, '0');
end; $$;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

-- Drop trigger lama terlebih dahulu sebelum dipasang ulang agar tidak bentrok
drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users for each row execute function public.set_updated_at();

drop trigger if exists vehicles_updated_at on public.vehicles;
create trigger vehicles_updated_at before update on public.vehicles for each row execute function public.set_updated_at();

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at before update on public.bookings for each row execute function public.set_updated_at();

drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at before update on public.services for each row execute function public.set_updated_at();

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at before update on public.payments for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, nama, email, nomor_hp, role, nomor_pelanggan)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nama', split_part(new.email, '@', 1)), new.email, new.raw_user_meta_data->>'nomor_hp', coalesce(new.raw_app_meta_data->>'role', 'customer'), case when coalesce(new.raw_app_meta_data->>'role', 'customer') = 'customer' then public.generate_nomor_pelanggan() else null end) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();

create or replace function public.services_set_invoice() returns trigger language plpgsql as $$ begin if new.nomor_invoice is null then new.nomor_invoice := public.generate_invoice_number(); end if; return new; end; $$;

drop trigger if exists services_invoice_trg on public.services;
create trigger services_invoice_trg before insert on public.services for each row execute function public.services_set_invoice();

create or replace function public.protect_user_fields() returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if not public.is_staff() then
    if new.nama is distinct from old.nama or new.nomor_pelanggan is distinct from old.nomor_pelanggan or new.email is distinct from old.email or new.role is distinct from old.role or new.status is distinct from old.status then
      raise exception 'Customer tidak boleh mengubah profil krusial';
    end if;
  end if;
  if not public.is_admin() and new.role is distinct from old.role then raise exception 'Hanya admin yang dapat mengubah role'; end if;
  return new;
end; $$;

drop trigger if exists protect_user_fields_trg on public.users;
create trigger protect_user_fields_trg before update on public.users for each row execute function public.protect_user_fields();

-- ============================================================
-- AUTO CRAFT LANGKAH 3 (REFIXED STORAGE): KEBIJAKAN RLS, REALTIME & STORAGE
-- ============================================================

-- 1. CONFIGURATION: REALTIME
drop publication if exists supabase_realtime;
create publication supabase_realtime for table public.bookings, public.services, public.payments, public.notifications;

-- 2. SECURITY POLICIES: USERS TABLE
drop policy if exists "users_select_own_or_staff" on public.users;
create policy "users_select_own_or_staff" on public.users for select to authenticated using ((select auth.uid()) = id or public.is_staff());

drop policy if exists "users_update_own_or_staff" on public.users;
create policy "users_update_own_or_staff" on public.users for update to authenticated using ((select auth.uid()) = id or public.is_staff()) with check ((select auth.uid()) = id or public.is_staff());

drop policy if exists "users_insert_staff" on public.users;
create policy "users_insert_staff" on public.users for insert to authenticated with check (public.is_staff() or (select auth.uid()) = id);

drop policy if exists "users_delete_admin" on public.users;
create policy "users_delete_admin" on public.users for delete to authenticated using (public.is_admin());

-- 3. SECURITY POLICIES: VEHICLES TABLE
drop policy if exists "vehicles_select" on public.vehicles;
create policy "vehicles_select" on public.vehicles for select to authenticated using ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "vehicles_insert" on public.vehicles;
create policy "vehicles_insert" on public.vehicles for insert to authenticated with check ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "vehicles_update" on public.vehicles;
create policy "vehicles_update" on public.vehicles for update to authenticated using ((select auth.uid()) = user_id or public.is_staff()) with check ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "vehicles_delete" on public.vehicles;
create policy "vehicles_delete" on public.vehicles for delete to authenticated using ((select auth.uid()) = user_id or public.is_staff());

-- 4. SECURITY POLICIES: BOOKINGS TABLE
drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select" on public.bookings for select to authenticated using ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "bookings_insert" on public.bookings;
create policy "bookings_insert" on public.bookings for insert to authenticated with check ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "bookings_update" on public.bookings;
create policy "bookings_update" on public.bookings for update to authenticated using ((select auth.uid()) = user_id or public.is_staff()) with check ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "bookings_delete" on public.bookings;
create policy "bookings_delete" on public.bookings for delete to authenticated using (public.is_staff() or ((select auth.uid()) = user_id and status = 'menunggu'));

-- 5. SECURITY POLICIES: SERVICES TABLE
drop policy if exists "services_select" on public.services;
create policy "services_select" on public.services for select to authenticated using ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "services_insert" on public.services;
create policy "services_insert" on public.services for insert to authenticated with check (public.is_staff());

drop policy if exists "services_update" on public.services;
create policy "services_update" on public.services for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "services_delete" on public.services;
create policy "services_delete" on public.services for delete to authenticated using (public.is_admin());

-- 6. SECURITY POLICIES: PAYMENTS TABLE
drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments for select to authenticated using ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert" on public.payments for insert to authenticated with check (public.is_staff());

drop policy if exists "payments_update" on public.payments;
create policy "payments_update" on public.payments for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "payments_delete" on public.payments;
create policy "payments_delete" on public.payments for delete to authenticated using (public.is_admin());

-- 7. SECURITY POLICIES: NOTIFICATIONS TABLE
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications for select to authenticated using ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications for insert to authenticated with check (public.is_staff() or (select auth.uid()) = user_id);

drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications for update to authenticated using ((select auth.uid()) = user_id or public.is_staff()) with check ((select auth.uid()) = user_id or public.is_staff());

drop policy if exists "notifications_delete" on public.notifications;
create policy "notifications_delete" on public.notifications for delete to authenticated using ((select auth.uid()) = user_id or public.is_staff());

-- 8. STORAGE CONFIGURATION & BUCKET POLICIES (FIXED ARRAY MAPPING)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;

drop policy if exists "Avatar public read" on storage.objects;
create policy "Avatar public read" on storage.objects for select to public using (bucket_id = 'avatars');

drop policy if exists "Avatar upload own" on storage.objects;
create policy "Avatar upload own" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Avatar update own" on storage.objects;
create policy "Avatar update own" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Avatar delete own or staff" on storage.objects;
create policy "Avatar delete own or staff" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (((storage.foldername(name))[1] = (select auth.uid())::text) or public.is_staff()));

drop policy if exists "Avatar staff upload" on storage.objects;
create policy "Avatar staff upload" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and public.is_staff());

-- 9. DATA API AUTHORIZATION & GRANTS
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated;


-- ============================================================
-- SEED STAFF (jalankan di Supabase SQL Editor SETELAH migration)
-- Admin & Kasir sudah punya akun Auth — cukup promote role di sini.
-- ============================================================
-- Login credentials:
--   Admin : admin@autocraft.com  / Admin123!
--   Kasir : kasir@autocraft.com  / Kasir123!
-- ============================================================

-- Promote ke admin / kasir (bypasses RLS karena dijalankan sebagai postgres)
update public.users
set
  role = 'admin',
  nama = 'Admin Auto Craft',
  nomor_pelanggan = null,
  status = 'aktif',
  nomor_hp = coalesce(nomor_hp, '08000000000')
where email = 'admin@autocraft.com';

update public.users
set
  role = 'kasir',
  nama = 'Kasir Auto Craft',
  nomor_pelanggan = null,
  status = 'aktif',
  nomor_hp = coalesce(nomor_hp, '08000000001')
where email = 'kasir@autocraft.com';

-- Jika baris belum ada di public.users (trigger belum jalan), buat dari auth.users:
insert into public.users (id, nama, email, nomor_hp, role, status)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', 'Admin Auto Craft'),
  u.email,
  coalesce(u.raw_user_meta_data->>'nomor_hp', '08000000000'),
  'admin',
  'aktif'
from auth.users u
where u.email = 'admin@autocraft.com'
on conflict (id) do update
set role = 'admin', nama = excluded.nama, status = 'aktif', nomor_pelanggan = null;

insert into public.users (id, nama, email, nomor_hp, role, status)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', 'Kasir Auto Craft'),
  u.email,
  coalesce(u.raw_user_meta_data->>'nomor_hp', '08000000001'),
  'kasir',
  'aktif'
from auth.users u
where u.email = 'kasir@autocraft.com'
on conflict (id) do update
set role = 'kasir', nama = excluded.nama, status = 'aktif', nomor_pelanggan = null;

-- Set app_metadata role (aman untuk authorization)
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'admin@autocraft.com';

update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"kasir"}'::jsonb
where email = 'kasir@autocraft.com';
