# Mapbox Setup

## 1. Create an account

Go to [mapbox.com](https://www.mapbox.com/) and sign up for a free account.

The free tier includes 50,000 map loads per month — more than enough to get started.

## 2. Get your access token

1. Go to [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/)
2. Copy the **Default public token** or create a new one
3. Add it to your `.env`:

```
VITE_MAPBOX_ACCESS_TOKEN=pk.your-token-here
```

## 3. Restrict your token (recommended for production)

To prevent token abuse:

1. Click your token → **Edit**
2. Under **URL restrictions**, add your deployment URL (e.g. `https://your-app.vercel.app`)
3. Save — the token will only work from that domain

## 4. Map style

The app uses Mapbox's default **Streets** style for 2D and the **Standard** style for 3D. No additional configuration is needed.

## 5. Indoor Navigation (optional — Mappedin)

Indoor navigation uses [Mappedin](https://www.mappedin.com/), a separate service.

To enable indoor maps for a building:
1. Create a Mappedin account and add your building's floor plan
2. Get the embed URL from Mappedin dashboard
3. In your admin dashboard, edit the building and paste the Mappedin URL into the **Indoor Navigation URL** field

If no Mappedin URL is set for a building, the Indoor Navigation button will not appear.
