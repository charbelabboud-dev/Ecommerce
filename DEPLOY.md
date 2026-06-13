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

### Uploads note

Render **free tier** has ephemeral disk — product images are lost on redeploy. Fine for phase-1 testing; use persistent disk or object storage (R2/S3) later.

---

## 3. Frontends — Cloudflare Pages (free)

Create **two** Pages projects from the same repo.

### Storefront

| Setting | Value |
|---------|-------|
| Branch | `phase-1-postgres` |
| Root directory | `ecommerce-storefront` |
| Build command | `npm ci && npm run build` |
| Build output | `build` |
| Env var | `REACT_APP_API_URL` = `https://YOUR-API.onrender.com` |

### Admin

| Setting | Value |
|---------|-------|
| Branch | `phase-1-postgres` |
| Root directory | `ecommerce-admin` |
| Build command | `npm ci && npm run build` |
| Build output | `build` |
| Env var | `REACT_APP_API_URL` = `https://YOUR-API.onrender.com` |

`public/_redirects` is included for client-side routing.

---

## 4. Wire CORS (required)

After Cloudflare gives you URLs (e.g. `https://ecommerce-storefront.pages.dev`):

1. Render dashboard → **primeplus-api** → Environment
2. Set:
   - `CorsSettings__AllowedOrigins__0` = storefront URL
   - `CorsSettings__AllowedOrigins__1` = admin URL
3. **Manual Deploy** → redeploy API

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
