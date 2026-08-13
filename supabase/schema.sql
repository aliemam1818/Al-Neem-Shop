-- ============================================================
-- ALNEEM STORE — SUPABASE SCHEMA
-- Run this once in Supabase SQL Editor (Project > SQL Editor > New query)
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.
-- ============================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "uuid-ossp";

-- ---------- PROFILES (extends auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- ADDRESSES ----------
create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text default 'Home',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- CATEGORIES ----------
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  stock integer not null default 0,
  images text[] not null default '{}',
  variants jsonb not null default '[]', -- [{name:"Size", options:["50g","100g"]}, ...]
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);

-- ---------- COUPONS ----------
create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'flat')),
  discount_value numeric(10,2) not null,
  min_order_amount numeric(10,2) default 0,
  max_uses integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null, -- {line1,line2,city,state,postal_code,country}
  items jsonb not null,            -- [{product_id,title,price,qty,variant}]
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  coupon_code text,
  shipping_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment_method text not null default 'cod' check (payment_method in ('cod', 'online')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  status text not null default 'pending' check (status in ('pending', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- ---------- APP SETTINGS (single row, admin-editable) ----------
create table if not exists public.app_settings (
  id integer primary key default 1,
  admin_notification_email text not null default 'alneemcare@gmail.com',
  store_name text not null default 'ALNEEM',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.app_settings (id, admin_notification_email)
values (1, 'alneemcare@gmail.com')
on conflict (id) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.app_settings enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES: users see/edit their own row; admins see all
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ADDRESSES: owner only, admin can read all
drop policy if exists "addresses_owner" on public.addresses;
create policy "addresses_owner" on public.addresses
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id);

-- CATEGORIES: public read, admin write
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- PRODUCTS: public read active products, admin full access
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (is_active = true or public.is_admin());
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for insert with check (public.is_admin());
drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products
  for update using (public.is_admin());
drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products
  for delete using (public.is_admin());

-- COUPONS: admin manages; anyone can SELECT to validate a code at checkout
drop policy if exists "coupons_public_read_active" on public.coupons;
create policy "coupons_public_read_active" on public.coupons
  for select using (is_active = true or public.is_admin());
drop policy if exists "coupons_admin_write" on public.coupons;
create policy "coupons_admin_write" on public.coupons
  for insert with check (public.is_admin());
drop policy if exists "coupons_admin_update" on public.coupons;
create policy "coupons_admin_update" on public.coupons
  for update using (public.is_admin());
drop policy if exists "coupons_admin_delete" on public.coupons;
create policy "coupons_admin_delete" on public.coupons
  for delete using (public.is_admin());

-- ORDERS: customers see own orders; admin sees/updates all; anyone (incl. guests via
-- service-role API route) can insert an order
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin());

-- APP_SETTINGS: public read (needed for storefront display), admin write
drop policy if exists "settings_public_read" on public.app_settings;
create policy "settings_public_read" on public.app_settings for select using (true);
drop policy if exists "settings_admin_write" on public.app_settings;
create policy "settings_admin_write" on public.app_settings
  for update using (public.is_admin());

-- ============================================================
-- STORAGE — run in Supabase Dashboard > Storage if not auto-created,
-- or execute here since storage schema is queryable via SQL too.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_write" on storage.objects;
create policy "product_images_admin_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- ============================================================
-- SEED DATA — sample categories + the ALNEEM product from your reference art
-- ============================================================
insert into public.categories (name, slug) values
  ('Skincare', 'skincare'),
  ('Hair Care', 'hair-care'),
  ('Wellness', 'wellness')
on conflict (slug) do nothing;

insert into public.products (title, slug, description, category_id, price, compare_at_price, stock, images, variants, is_featured)
select
  'Herbal Soothing Cream',
  'herbal-soothing-cream',
  'Enriched with Neem, Aloe Vera & Natural Herbs for healthy, calm and soothing skin. An Ayurvedic formula that soothes itching & irritation and is safe for daily use on all skin types.',
  (select id from public.categories where slug = 'skincare'),
  399.00,
  499.00,
  120,
  '{}',
  '[{"name":"Size","options":["50g","100g"]}]',
  true
where not exists (select 1 from public.products where slug = 'herbal-soothing-cream');

-- ============================================================
-- MAKE YOURSELF AN ADMIN
-- After you sign up through the site with your own account, run:
--   update public.profiles set role = 'admin' where id =
--     (select id from auth.users where email = 'you@example.com');
-- ============================================================
