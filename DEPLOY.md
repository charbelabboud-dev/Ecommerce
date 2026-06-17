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

### Product images — Cloudflare R2 (required for production)

Render **free tier** wipes local disk on sleep/redeploy, so uploaded images disappear. The API stores images in **Cloudflare R2** when configured (S3-compatible, free tier is generous).

#### 1. Create R2 bucket

1. Cloudflare dashboard → **R2 Object Storage** → **Create bucket**
2. Name e.g. `ecommerce-product-images`
3. **Settings** → **Public access** → enable **R2.dev subdomain** (or connect a custom domain later)
4. Copy the public URL, e.g. `https://pub-xxxxxxxx.r2.dev`

#### 2. Create R2 API token

1. R2 → **Manage R2 API tokens** → **Create API token**
2. Permissions: **Object Read & Write** on your bucket
3. Save **Access Key ID**, **Secret Access Key**, and your **Account ID** (from Cloudflare dashboard URL or R2 overview)

#### 3. Set Render environment variables

In Render → API service → **Environment**, add:

| Variable | Value |
|----------|-------|
| `R2Settings__AccountId` | Your Cloudflare account ID |
| `R2Settings__AccessKeyId` | R2 access key ID |
| `R2Settings__SecretAccessKey` | R2 secret access key |
| `R2Settings__BucketName` | `ecommerce-product-images` |
| `R2Settings__PublicUrl` | `https://pub-xxxxxxxx.r2.dev` (no trailing slash) |

Redeploy the API after saving.

#### 4. Re-upload existing product images

Old images stored as `/uploads/products/...` on Render disk are gone. After R2 is live, **re-upload** product photos in admin — new URLs will be permanent `https://pub-xxx.r2.dev/products/...` links.

If R2 env vars are **not** set, the API falls back to local disk (fine for local dev only).

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
