# Hosting guide (phase-1-postgres)

Free stack: **Neon** (Postgres) + **Render** (API) + **Cloudflare Pages** (storefront + admin).

Branch to deploy: `phase-1-postgres`  
Repo: https://github.com/charbelabboud-dev/Ecommerce

---

## 1. Database — Neon (free)

1. Sign up at https://neon.tech
2. Create project → database name: `ecommerce_store`
3. Copy the **connection string** (direct, not pooler for first deploy)
4. Convert to Npgsql format if needed:

```
Host=ep-xxxx.region.aws.neon.tech;Port=5432;Database=ecommerce_store;Username=neondb_owner;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true
```

Migrations run automatically on API startup (`Program.cs`).

---

## 2. API — Render (free)

### Option A — Blueprint (recommended)

1. Sign up at https://render.com → connect GitHub
2. **New → Blueprint** → select `charbelabboud-dev/Ecommerce`
3. Choose branch `phase-1-postgres` (uses root `render.yaml`)
4. Fill **secret** env vars when prompted:

| Variable | Value |
|----------|-------|
| `ConnectionStrings__DefaultConnection` | Neon connection string (above) |
| `JwtSettings__Secret` | Random 64+ character string |
| `EmailSettings__SenderEmail` | Your Gmail |
| `EmailSettings__SenderPassword` | Gmail app password |
| `CorsSettings__AllowedOrigins__0` | Storefront URL (set after step 3, then redeploy) |
| `CorsSettings__AllowedOrigins__1` | Admin URL (set after step 3, then redeploy) |

5. Deploy. Note your API URL: `https://primeplus-api.onrender.com` (or similar)

### Option B — Manual web service

- **Runtime:** Docker
- **Root directory:** `EcommerceApi`
- **Dockerfile path:** `EcommerceApi/Dockerfile`
- **Health check:** `/health`
- Same env vars as above

### Verify API

- `GET https://YOUR-API.onrender.com/health` → `{"status":"ok"}`
- First deploy may take 5–10 minutes (free tier cold start)

### Create admin (once)

```http
POST https://YOUR-API.onrender.com/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "YourSecurePassword123",
  "email": "you@example.com",
  "storeName": "PrimePlus",
  "storePhone": "+961..."
}
```

Works only when no admin exists yet.

### Product images — Supabase Storage (recommended, free)

Render **free tier** wipes local disk on sleep/redeploy, so uploaded images disappear. The API stores images in **Supabase Storage** when configured (free tier, no card required for most accounts).

#### 1. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → **Start your project** (free)
2. Create a new project (pick a name, password, region)
3. Wait for the project to finish provisioning

#### 2. Create a public storage bucket

1. In Supabase dashboard → **Storage** → **New bucket**
2. Name: `product-images`
3. Enable **Public bucket** (so product photos load on your storefront without auth)
4. Create bucket

#### 3. Get API credentials

1. **Project Settings** (gear icon) → **API**
2. Copy:
   - **Project URL** → e.g. `https://abcdefghijklmnop.supabase.co`
   - **Secret key** (`sb_secret_...`) from **API Keys**, or **service_role** from **Legacy API Keys** tab — keep this **secret**, server-only

> Use the **secret key** (`sb_secret_...`) on Render. Legacy **service_role** JWT also works. Do not use the publishable key.

#### 4. Set Render environment variables

In Render → API service → **Environment**, add:

| Variable | Value |
|----------|-------|
| `SupabaseStorage__SupabaseUrl` | `https://YOUR_PROJECT_REF.supabase.co` |
| `SupabaseStorage__ServiceRoleKey` | Your `service_role` key |
| `SupabaseStorage__BucketName` | `product-images` |

Redeploy the API after saving.

#### 5. Re-upload existing product images

Old images stored as `/uploads/products/...` on Render disk are gone. After Supabase is live, **re-upload** product photos in admin. New URLs will look like:

`https://YOUR_PROJECT.supabase.co/storage/v1/object/public/product-images/products/...`

If Supabase env vars are **not** set, the API falls back to local disk (local dev only) or Cloudflare R2 if that is configured instead.

---

## 3. Frontends — Cloudflare Pages (free)

Create **two** Pages projects: https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

### Storefront

1. Connect GitHub → select `charbelabboud-dev/Ecommerce`
2. **Project name** → e.g. `primeplus-storefront`
3. **Production branch** → `phase-1-postgres`
4. **Build settings:**

| Setting | Value |
|---------|-------|
| Framework preset | None (or Create React App) |
| Build command | `npm install && npm run build` |
| Build output directory | `build` |
| Root directory (path) | `ecommerce-storefront` |

5. **Environment variables** → **Add variable**:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://ecommerce.onrender.com` |
| `SKIP_DEPENDENCY_INSTALL` | `1` |

> Cloudflare auto-runs `npm ci` before your build command. `SKIP_DEPENDENCY_INSTALL=1` skips that step so `npm install` in the build command can run instead.

6. **Save and Deploy**

### Admin

Create a **second** Pages project (same repo):

| Setting | Value |
|---------|-------|
| Project name | e.g. `primeplus-admin` |
| Production branch | `phase-1-postgres` |
| Build command | `npm install && npm run build` |
| Build output directory | `build` |
| Root directory | `ecommerce-admin` |
| Env var | `REACT_APP_API_URL` = `https://ecommerce.onrender.com` |

`public/_redirects` in each app handles SPA routing (React Router).

After deploy, note both URLs (e.g. `https://primeplus-storefront.pages.dev`).

---

## 4. Wire CORS (required)

After Cloudflare gives you URLs (e.g. `https://primeplus-storefront.pages.dev`):

1. Render dashboard → **Ecommerce** (API) → Environment
2. Set:
   - `CorsSettings__AllowedOrigins__0` = storefront URL
   - `CorsSettings__AllowedOrigins__1` = admin URL
3. **Manual Deploy** → redeploy API

---

## 4b. Keep API awake (Render free tier — optional but recommended)

Render **free** services sleep after ~15 minutes of no traffic. The storefront and admin now show a “Starting the server…” screen and retry automatically, but you can **prevent sleep** with a free uptime monitor:

1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free)
2. **Add New Monitor**
   - Monitor Type: **HTTP(s)**
   - Friendly Name: `Ecommerce API health`
   - URL: `https://YOUR-API.onrender.com/health`
   - Monitoring Interval: **5 minutes** (free tier)
3. Save

Ping every 5–14 minutes keeps the API warm so customers rarely hit cold starts.

**Production alternative:** upgrade Render API to **Starter** ($7/mo) for always-on — no sleep, no pinger needed.

---

## 5. Smoke test checklist

- [ ] Storefront loads products
- [ ] Customer register + OTP email
- [ ] Guest checkout
- [ ] Admin login at admin Pages URL
- [ ] Upload product image
- [ ] Order appears in admin

---

## Local dev (unchanged)

```powershell
docker compose up -d
cd EcommerceApi
dotnet ef database update   # optional — migrate also runs on startup
dotnet run
```

Storefront/admin: `npm start` with `REACT_APP_API_URL=http://localhost:5147`
