-- ============================================================
-- Dinner Party App — Supabase Schema
-- Run this once in Supabase Dashboard > SQL Editor
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null default '',
  phone        text,
  is_admin     boolean not null default false,
  notify_email boolean not null default true,
  notify_sms   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Restaurants
create table if not exists public.restaurants (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  neighborhood text not null,
  cuisine      text not null,
  area         text not null default 'seattle' check (area in ('seattle','snohomish')),
  added_by     uuid references public.profiles(id),
  created_at   timestamptz not null default now()
);

-- Dinners
create table if not exists public.dinners (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  date          date not null,
  thumb         text check (thumb in ('up','down')),
  notes         text,
  added_by      uuid references public.profiles(id),
  created_at    timestamptz not null default now()
);

-- Dinner attendees
create table if not exists public.dinner_attendees (
  id        uuid primary key default gen_random_uuid(),
  dinner_id uuid not null references public.dinners(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  unique(dinner_id, user_id)
);

-- Dishes
create table if not exists public.dishes (
  id        uuid primary key default gen_random_uuid(),
  dinner_id uuid not null references public.dinners(id) on delete cascade,
  name      text not null,
  rating    int not null check (rating between 1 and 5),
  added_by  uuid references public.profiles(id)
);

-- Cocktails
create table if not exists public.cocktails (
  id        uuid primary key default gen_random_uuid(),
  dinner_id uuid not null references public.dinners(id) on delete cascade,
  name      text not null,
  rating    int not null check (rating between 1 and 5),
  added_by  uuid references public.profiles(id)
);

-- Wishlist
create table if not exists public.wishlist (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  added_by      uuid references public.profiles(id),
  notes         text,
  created_at    timestamptz not null default now(),
  unique(restaurant_id)
);

-- Wishlist upvotes
create table if not exists public.wishlist_upvotes (
  id          uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlist(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  unique(wishlist_id, user_id)
);

-- Availability
create table if not exists public.availability (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  date       date not null,
  available  boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.restaurants      enable row level security;
alter table public.dinners          enable row level security;
alter table public.dinner_attendees enable row level security;
alter table public.dishes           enable row level security;
alter table public.cocktails        enable row level security;
alter table public.wishlist         enable row level security;
alter table public.wishlist_upvotes enable row level security;
alter table public.availability     enable row level security;

-- Profiles: anyone logged in can read all, only own row to write
create policy "profiles_read"   on public.profiles for select using (auth.role() = 'authenticated');
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Restaurants: all authenticated users can read/write
create policy "restaurants_read"   on public.restaurants for select using (auth.role() = 'authenticated');
create policy "restaurants_insert" on public.restaurants for insert with check (auth.role() = 'authenticated');
create policy "restaurants_update" on public.restaurants for update using (auth.role() = 'authenticated');

-- Dinners: all authenticated users can read/write
create policy "dinners_read"   on public.dinners for select using (auth.role() = 'authenticated');
create policy "dinners_insert" on public.dinners for insert with check (auth.role() = 'authenticated');
create policy "dinners_update" on public.dinners for update using (auth.role() = 'authenticated');
create policy "dinners_delete" on public.dinners for delete using (auth.uid() = added_by);

-- Dinner attendees
create policy "attendees_read"   on public.dinner_attendees for select using (auth.role() = 'authenticated');
create policy "attendees_insert" on public.dinner_attendees for insert with check (auth.role() = 'authenticated');
create policy "attendees_delete" on public.dinner_attendees for delete using (auth.uid() = user_id);

-- Dishes
create policy "dishes_read"   on public.dishes for select using (auth.role() = 'authenticated');
create policy "dishes_insert" on public.dishes for insert with check (auth.role() = 'authenticated');
create policy "dishes_delete" on public.dishes for delete using (auth.uid() = added_by);

-- Cocktails
create policy "cocktails_read"   on public.cocktails for select using (auth.role() = 'authenticated');
create policy "cocktails_insert" on public.cocktails for insert with check (auth.role() = 'authenticated');
create policy "cocktails_delete" on public.cocktails for delete using (auth.uid() = added_by);

-- Wishlist
create policy "wishlist_read"   on public.wishlist for select using (auth.role() = 'authenticated');
create policy "wishlist_insert" on public.wishlist for insert with check (auth.role() = 'authenticated');
create policy "wishlist_delete" on public.wishlist for delete using (auth.uid() = added_by);

-- Wishlist upvotes
create policy "upvotes_read"   on public.wishlist_upvotes for select using (auth.role() = 'authenticated');
create policy "upvotes_insert" on public.wishlist_upvotes for insert with check (auth.uid() = user_id);
create policy "upvotes_delete" on public.wishlist_upvotes for delete using (auth.uid() = user_id);

-- Availability
create policy "avail_read"   on public.availability for select using (auth.role() = 'authenticated');
create policy "avail_insert" on public.availability for insert with check (auth.uid() = user_id);
create policy "avail_delete" on public.availability for delete using (auth.uid() = user_id);
