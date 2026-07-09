# Deploy to Vercel

## One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/BTAG16/3D-University)

After clicking, Vercel will ask you to set environment variables. Use the values from your `.env` file.

## Manual deploy

### 1. Install Vercel CLI (optional)

```bash
npm i -g vercel
```

### 2. Link your project

```bash
vercel link
```

### 3. Set environment variables

Either via the CLI:

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_MAPBOX_ACCESS_TOKEN
vercel env add VITE_SUPER_ADMIN_EMAIL
vercel env add VITE_CONTACT_EMAIL
```

Or via the Vercel dashboard: **Project → Settings → Environment Variables**.

### 4. Deploy

```bash
vercel --prod
```

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anon key |
| `VITE_MAPBOX_ACCESS_TOKEN` | Yes | Your Mapbox public token |
| `VITE_SUPER_ADMIN_EMAIL` | Yes | Email to receive super admin login codes |
| `VITE_CONTACT_EMAIL` | Yes | Email shown in Privacy Policy and Terms |

## Custom domain

1. Go to **Project → Settings → Domains**
2. Add your domain
3. Follow the DNS instructions shown
4. Update **Site URL** in Supabase Auth settings to match your new domain

## SPA routing

The `vercel.json` in this repo already handles SPA routing — all paths serve `index.html`. No extra configuration needed.
