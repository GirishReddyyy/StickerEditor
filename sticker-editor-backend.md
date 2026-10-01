# Sticker Editor: Backend Document

The MVP editor needs no backend. Add this when you want accounts, saved stickers and projects, sharing, and packs. This guide uses **Supabase** (Postgres, Auth, Storage) because it needs the least server code. A custom Node.js option is at the end.

---

## 1. What the backend does

| Feature | How |
|---|---|
| Sign in | Supabase Auth (email link, Google) |
| Save finished stickers | Storage file plus a database row |
| Save editable projects | Project JSON in the database, images in Storage |
| Reuse stickers as layers | Library query, then add as image layers |
| Share by link | Public flag and a unique slug |
| Sticker packs | Packs table linking stickers in order |
| Moderation | Reports table, hide after reports from several different accounts |

Store only what the user saves. Don't upload photos automatically.

---

## 2. Setup

1. Create a project at supabase.com.
2. Put the Project URL and anon key into the frontend `.env.local`.
3. Run the SQL below in the SQL editor.
4. Enable the sign-in methods you want.

---

## 3. Database schema

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  role text not null default 'user' check (role in ('user','admin')),
  banned boolean not null default false,
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Image files a user has uploaded (used by projects and stickers)
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null,             -- path in the 'assets' bucket
  width integer, height integer,
  bytes integer,
  created_at timestamptz not null default now()
);

-- Editable projects: layer data as JSON
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled',
  data jsonb not null,            -- the Project object (layers reference asset ids)
  thumbnail_path text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index projects_user_idx on public.projects (user_id, updated_at desc);

-- Finished (flattened) stickers
create table public.stickers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null default 'Untitled',
  image_path text not null,       -- path in the 'stickers' bucket
  is_public boolean not null default false,
  hidden boolean not null default false,   -- set by moderation
  share_slug text unique default substr(replace(gen_random_uuid()::text,'-',''),1,10),
  created_at timestamptz not null default now()
);
create index stickers_user_idx on public.stickers (user_id, created_at desc);

create table public.packs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.pack_stickers (
  pack_id uuid not null references public.packs(id) on delete cascade,
  sticker_id uuid not null references public.stickers(id) on delete cascade,
  position integer not null default 0,
  primary key (pack_id, sticker_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  sticker_id uuid not null references public.stickers(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (sticker_id, reporter_id)      -- one report per person per sticker
);
```

---

## 4. Security: Row Level Security

Turn it on for every table. This is what makes it safe to use the anon key in the frontend.

```sql
alter table public.profiles      enable row level security;
alter table public.assets        enable row level security;
alter table public.projects      enable row level security;
alter table public.stickers      enable row level security;
alter table public.packs         enable row level security;
alter table public.pack_stickers enable row level security;
alter table public.reports       enable row level security;

create policy "profiles readable" on public.profiles for select using (true);
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id and role = 'user');
  -- note: role and banned must only be changed by admins using trusted code

create policy "own assets" on public.assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "read own or public visible stickers" on public.stickers
  for select using ((is_public = true and hidden = false) or auth.uid() = user_id);
create policy "insert own stickers" on public.stickers
  for insert with check (auth.uid() = user_id);
create policy "update own stickers" on public.stickers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own stickers" on public.stickers
  for delete using (auth.uid() = user_id);

create policy "read own or public packs" on public.packs
  for select using (is_public = true or auth.uid() = user_id);
create policy "manage own packs" on public.packs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "read pack contents" on public.pack_stickers for select using (
  exists (select 1 from public.packs p
          where p.id = pack_id and (p.is_public or p.user_id = auth.uid())));
create policy "manage own pack contents" on public.pack_stickers for all using (
  exists (select 1 from public.packs p where p.id = pack_id and p.user_id = auth.uid()))
  with check (
  exists (select 1 from public.packs p where p.id = pack_id and p.user_id = auth.uid()));

-- Users can file a report; they cannot read reports (admins use trusted code)
create policy "file reports" on public.reports
  for insert with check (auth.uid() = reporter_id);
```

**Moderation rule:** hide a sticker (set `hidden = true`) only when reports come from at least N different accounts (for example 3). Do this in a trusted place (a database function or Edge Function), not from the browser. Admin review (list reports, restore, remove, ban) also runs in trusted code. Hide rather than delete, so a mistaken or abusive report wave can be undone.

---

## 5. File storage

| Bucket | Visibility | Contents |
|---|---|---|
| `assets` | Private | Images used inside projects, in `<user-id>/` folders |
| `stickers` | Private | Flattened stickers, in `<user-id>/` folders |
| `shared` | Public | Copies of stickers the user chose to share |

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
 ('assets',   'assets',   false, 2097152, array['image/png','image/webp','image/jpeg']),
 ('stickers', 'stickers', false, 1048576, array['image/png','image/webp']),
 ('shared',   'shared',   true,  1048576, array['image/png','image/webp'])
on conflict (id) do nothing;

create policy "write own folder" on storage.objects for insert to authenticated
  with check (bucket_id in ('assets','stickers','shared')
              and (storage.foldername(name))[1] = auth.uid()::text);

create policy "read own files" on storage.objects for select to authenticated
  using (bucket_id in ('assets','stickers')
         and (storage.foldername(name))[1] = auth.uid()::text);

create policy "delete own files" on storage.objects for delete to authenticated
  using (bucket_id in ('assets','stickers','shared')
         and (storage.foldername(name))[1] = auth.uid()::text);
```

Sharing copies the file to `shared` and sets `is_public = true`. Unsharing removes the copy and clears the flag. Hiding a reported sticker should also make its shared copy unreachable.

Note: Supabase checks file type by the declared content type, which can be faked. If this matters to you, add an Edge Function that verifies and re-encodes uploads before storing them, or use the custom server option below.

---

## 6. Frontend API functions (outline)

Put these in `src/lib/api/`.

```ts
// projects.ts
saveProject(project)        // upsert into projects (autosave, debounced)
loadProject(id)             // fetch data, then get signed URLs for assets
listProjects()
deleteProject(id)

// assets.ts
uploadAsset(blob)           // upload to 'assets/<user-id>/<uuid>', insert row, return id
getAssetUrls(ids)           // createSignedUrls for private files

// stickers.ts
saveSticker({ blob, title, projectId })
listMyStickers()
deleteSticker(id)           // removes row and files
shareSticker(id)            // copy to 'shared', set is_public, return /s/<slug>
unshareSticker(id)
getSharedSticker(slug)

// packs.ts, reports.ts
createPack, addToPack, reorderPack, reportSticker(id, reason)
```

Project JSON contains asset IDs, never raw image data. When opening a project, fetch signed URLs for its assets in one call and map them into the editor.

---

## 7. Autosave and conflicts

- Autosave the project JSON after changes with a debounce (for example 2 seconds)
- Include `updated_at` when saving; if the stored `updated_at` is newer than what the editor loaded (for example, edited in another tab), warn the user before overwriting
- Set a size limit on project JSON (for example 1 MB) and a limit on the number of layers

---

## 8. Limits and abuse prevention

- File size and type limits on buckets
- Per-user quotas (for example 200 stickers, 50 projects, total storage cap), enforced in trusted code
- Report button on every public sticker page, one report per user per sticker
- Link-only sharing at first; no public gallery until you can moderate it
- Never use the service-role key in the frontend

---

## 9. Privacy

- Original photos are not uploaded automatically; only assets of projects the user saves
- Account deletion removes rows and all files (assets, stickers, shared copies)
- Provide a privacy policy, terms (users need permission to use others' images and faces), and a takedown contact
- Check data protection rules for your users' regions (for example GDPR, India's DPDP Act). I'm not a lawyer, so get the legal text reviewed.

---

## 10. Optional Edge Functions

Use only when something must run with trusted permissions: upload verification and re-encoding, moderation hiding and admin actions, account deletion, quota enforcement, server-side background removal for weak devices.

---

## 11. Alternative: custom Node.js backend

| Piece | Choice |
|---|---|
| Server | Express or Fastify (TypeScript) |
| Database | PostgreSQL with Prisma or Drizzle (same tables as above) |
| Storage | S3 or Cloudflare R2 behind a storage interface (local disk for development only) |
| Auth | httpOnly, Secure, SameSite cookie sessions; argon2id hashing; CSRF protection; email verification and password reset |
| Uploads | Check magic bytes, 2 MB cap, re-encode with sharp, random filenames |
| Security | helmet, CORS allowlist, Zod validation, rate limits, `trust proxy` setting |

Endpoints: auth routes; `/projects` (CRUD); `/assets` (upload); `/stickers` (CRUD, share, unshare); `/shared/:slug`; `/packs`; `/stickers/:id/report`; admin routes for the report queue.

With a custom server you must code every ownership check yourself.

---

## 12. Build order

1. Supabase project, schema, RLS, buckets
2. Auth in the frontend
3. Assets and project save/load with autosave
4. Save flattened stickers and the library page
5. Sharing and the public page
6. Packs
7. Reports, hiding rule, admin tools
8. Quotas, deletion, legal pages

## 13. Testing

- With two accounts, confirm account A cannot read, change, or delete anything of account B's, including projects, assets, and files (test the API directly)
- Confirm visitors can only read public, non-hidden stickers by slug
- Confirm bad file types and oversized files are rejected
- Confirm deleting a sticker or account removes the files too
- Confirm the hiding rule needs reports from different accounts