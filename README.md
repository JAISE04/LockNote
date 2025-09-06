# LockNote — Secure Text Share 🔐

Encrypt a message **in the browser**, store only ciphertext in Supabase, and share it safely.
LockNote supports **password-only retrieval**, optional **burn after reading**, and **auto-expiry**.

<p align="center">
  <img src="public/android-chrome-512x512.png" alt="LockNote icon" width="96" />
</p>

---

## ✨ Features

- **Client-side AES-GCM encryption** with WebCrypto (plaintext never leaves your device).
- **Password-only retrieval** — users enter only the password to view the note.
- **Burn after reading** (one-time view) & **expiry** presets (1h/1d/1w/1m/never).
- **Zero-knowledge verification** via salted key hash (no passwords stored).
- **Modern dark UI** (Tailwind + Lucide).
- **Vercel-ready** (Vite build, favicons, manifest).

---

## 🏗️ Stack

- **Frontend:** Vite + React 19, Tailwind CSS
- **Crypto:** WebCrypto (PBKDF2-HMAC-SHA256 → AES-GCM)
- **Backend:** Supabase (Postgres, RLS, RPC)
- **Client:** `@supabase/supabase-js`

> No custom servers are required — everything runs from your static site + Supabase.

---

## 🚀 Quick Start

### Prerequisites
- Node **18+**
- A Supabase project (free tier is fine)

### 1) Install
```bash
git clone https://github.com/<you>/locknote.git
cd locknote
npm i
```

### 2) Environment
Create `.env` from the example and fill project values:
```bash
cp env.example .env
```

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.ref.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 3) Database (Supabase SQL)

Paste the SQL below into **Supabase → SQL Editor** and run it:

```sql
-- extensions
create extension if not exists pgcrypto;

-- table
create table if not exists public.notes (
  id                text primary key,
  encrypted_content text not null,
  password_hash     text not null,   -- salted verifier of the derived key
  lookup_hash       text,            -- password-only lookup key (unsalted)
  salt              text not null,   -- base64 salt used in PBKDF2
  iv                text not null,   -- base64 12-byte AES-GCM IV
  created_at        timestamptz default now(),
  expires_at        timestamptz,
  one_time          boolean default false,
  view_count        integer default 0
);

-- indexes
create index if not exists idx_notes_expires_at on public.notes(expires_at);
create index if not exists idx_notes_lookup_hash on public.notes(lookup_hash);
create index if not exists idx_notes_created_at on public.notes(created_at desc);

-- cleanup helper (optional)
create or replace function public.delete_expired_notes()
returns void language plpgsql as $$
begin
  delete from public.notes where expires_at is not null and expires_at < now();
end; $$;

-- RLS
alter table public.notes enable row level security;

-- public insert/select; writes/cleanup through RPC
drop policy if exists public_insert_notes on public.notes;
create policy public_insert_notes on public.notes
  for insert to anon, authenticated with check (true);

drop policy if exists public_select_notes on public.notes;
create policy public_select_notes on public.notes
  for select to anon, authenticated using (true);

-- RPC: fetch newest note by password lookup hash, increment views, burn if one-time
create or replace function public.fetch_by_password(p_lookup_hash text)
returns table (
  id text,
  encrypted_content text,
  password_hash text,
  salt text,
  iv text,
  created_at timestamptz,
  expires_at timestamptz,
  one_time boolean,
  view_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.notes%rowtype;
begin
  delete from public.notes n
  where n.expires_at is not null and n.expires_at < now();

  select * into v
  from public.notes n
  where n.lookup_hash = p_lookup_hash
  order by n.created_at desc
  limit 1;

  if not found then
    return;
  end if;

  update public.notes n set view_count = n.view_count + 1 where n.id = v.id;
  if v.one_time then delete from public.notes n where n.id = v.id; end if;

  return query
  select v.id, v.encrypted_content, v.password_hash, v.salt, v.iv,
         v.created_at, v.expires_at, v.one_time, v.view_count + 1;
end;
$$;

grant execute on function public.fetch_by_password(text) to anon, authenticated;
```

### 4) Dev
```bash
npm run dev
```
Open <http://localhost:5173>.

### 5) Build / Preview
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
LockNote/
├─ public/
│  ├─ favicon.ico
│  ├─ locknote.svg
│  ├─ apple-touch-icon.png
│  ├─ android-chrome-512x512.png
│  └─ site.webmanifest
├─ src/
│  ├─ components/TextSharing/
│  │  ├─ Header.jsx
│  │  ├─ TabNavigation.jsx
│  │  ├─ StoreTextTab.jsx
│  │  ├─ RetrieveTextTab.jsx
│  │  ├─ Message.jsx
│  │  └─ RetrievedTextDisplay.jsx
│  ├─ lib/
│  │  ├─ crypto.js
│  │  ├─ supabaseClient.js
│  │  └─ notesService.js
│  ├─ App.jsx
│  ├─ index.css
│  └─ main.jsx
├─ index.html
├─ tailwind.config.js
└─ vite.config.js
```

---

## 🔐 How It Works (Security)

- **Derivation:** PBKDF2-HMAC-SHA256 derives a 256-bit key from password + random salt.
- **Encryption:** AES-GCM with a 12-byte IV; outputs base64 ciphertext.
- **Verification:** a salted hash of the derived key is stored (`password_hash`) to check password without knowing it.
- **Password-only retrieval:** we also store `lookup_hash = SHA-256(password)` to look up notes when only a password is provided.  
  ⚠️ *Trade-off:* allows password probing; use non-trivial passwords. For stronger privacy, use the traditional **ID + password** flow.
- **Burn/expiry:** RPC increments `view_count`, deletes one-time notes, and you can schedule `delete_expired_notes()` if desired.

---

## ☁️ Deploy on Vercel

1. Push the repo to GitHub.
2. **Import Project** on Vercel → Framework: **Vite**.
3. Build command: `vite build` · Output dir: `dist`.
4. Add env vars under **Settings → Environment**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

**Optional** `vercel.json` for SPA fallback + static caching:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

---

## 🧪 Scripts

```bash
npm run dev       # start dev server
npm run build     # production build -> dist/
npm run preview   # serve the built app
npm run lint      # run eslint
```

---

## 🖼️ Branding / Icons

- Icons & manifest live in `public/`. If your tab icon doesn’t update, **hard refresh** or bump a version query:
  ```html
  <link rel="icon" href="/favicon.ico?v=6" />
  ```

---

## ⚠️ Disclaimer

This project demonstrates client-side encryption with a convenience **password-only** retrieval mode.
It’s great for learning and casual sharing, but avoid high-risk/regulated data without a formal security review.
For maximum privacy, revert to **ID + password** retrieval.

---

## 🤝 Contributing

PRs welcome! Please avoid committing secrets or `.env`.

---

## 📄 License

MIT © Your Name
