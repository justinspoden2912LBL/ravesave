-- Roles
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can read all roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can read own roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

-- Posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  category text,
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_published_idx on public.posts (published, published_at desc);
create index posts_slug_idx on public.posts (slug);

alter table public.posts enable row level security;

-- Public can read published posts
create policy "Anyone can read published posts"
on public.posts for select to anon, authenticated
using (published = true);

-- Admins can do anything (including read drafts)
create policy "Admins can read all posts"
on public.posts for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert posts"
on public.posts for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update posts"
on public.posts for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete posts"
on public.posts for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.tg_set_updated_at();