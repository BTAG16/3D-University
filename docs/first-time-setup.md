# First-Time Setup Guide

After deploying and configuring all services, follow these steps to get your first university live.

## 1. Create your admin account

Go to `/admin/register` on your deployed app and fill in:

- **University name** — your institution's official name
- **City** — your city
- **Admin email** — the email you'll use to log in
- **Password** — min. 6 characters

You'll receive a confirmation email. Click the link to activate your account.

## 2. Sign in to the admin dashboard

Go to `/admin/login` and sign in with your email and password.

You'll land on the **Overview** dashboard showing stats for your campus.

## 3. Configure your university settings

Go to **Settings** in the left sidebar:

- **University name** — confirm or update
- **Logo** — upload your university logo
- **Accent colour** — choose a colour that matches your branding
- **Welcome message** — what students see when they open the map
- **Map center** — set the lat/lng of the centre of your campus
  - Tip: Find your coordinates on [Google Maps](https://maps.google.com) by right-clicking your campus
- **Timezone** — your local timezone

Click **Save Changes**.

## 4. Add buildings

Go to **Buildings → Add Building**:

- **Name** — building name (e.g. "Main Library", "Engineering Block A")
- **Category** — Academic, Administration, Residence, etc.
- **Coordinates** — click the map to place the pin, or enter lat/lng manually
- **Description** — brief description shown to students
- **Facilities** — tick what's available (WiFi, Cafe, etc.)
- **Departments** — which departments are in this building

Click **Save Building**. Repeat for all campus buildings.

## 5. Add rooms (optional)

For each building, go to **Rooms → Add Room**:

- **Room number** — e.g. "A-101"
- **Room name** — e.g. "Lecture Hall A"
- **Type** — Lecture Hall, Office, Lab, etc.
- **Schedule** — add timetable entries (days, times)

Rooms with schedules appear as timetable cards in the student map view.

## 6. Share with students

Go to **Public Link** in the sidebar:

- Copy the **share link** and send it to students
- Download the **QR code** to print on orientation materials
- Copy the **embed snippet** to add the map to your university website

## 7. Optional: Indoor navigation

If you want per-building indoor floor plans (powered by Mappedin), see [setup-resend.md](./setup-mapbox.md#indoor-navigation-optional--mappedin).

Add the Mappedin URL to each building by editing it in the admin dashboard.

---

That's it — your campus map is live.
