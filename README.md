# Campus Explorer — University 3D Mapping Platform

An open-source interactive 3D campus map platform for universities. Students can explore buildings, find rooms, and view timetables. Admins get a dashboard to manage spaces and content.

**[Live Demo](https://3dcampus.vercel.app)** | **[Issues](https://github.com/BTAG16/3D-University/issues)**

![React](https://img.shields.io/badge/React-19-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Mapbox](https://img.shields.io/badge/Mapbox-3.16-000000)
![Supabase](https://img.shields.io/badge/Supabase-2.86-3ECF8E)

---

## Features

- Interactive 3D campus map powered by Mapbox
- Building and room search
- Live timetable cards per room
- Admin dashboard — manage buildings, rooms, and schedules
- Embeddable map widget for any university website
- Multi-tenant architecture (one platform, multiple universities)
- Dark mode

## Tech Stack

- **Frontend** — React 19, Vite, Framer Motion
- **Map** — Mapbox GL JS v3
- **Backend** — Supabase (Postgres + Auth + Edge Functions)
- **Email** — Resend
- **Deploy** — Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Mapbox](https://mapbox.com) account
- A [Resend](https://resend.com) account (for email)

### Setup

```bash
git clone https://github.com/BTAG16/3D-University.git
cd 3D-University
yarn install
cp .env.example .env
```

Fill in your `.env` with keys from each service, then:

```bash
yarn dev
```

Open [http://localhost:5173](http://localhost:5173).

### Supabase Setup

Run the migrations in `supabase/migrations/` against your project:

```bash
npx supabase db push
```

Or apply them manually via the Supabase SQL editor.

## Contributing

Contributions are welcome.

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a Pull Request

If adding data collection features, include GDPR compliance considerations in your PR description.

## License

MIT — see [LICENSE](./LICENSE).

## Acknowledgments

- [Mapbox](https://www.mapbox.com/) for the mapping platform
- [Supabase](https://supabase.com/) for backend infrastructure
- [Vite](https://vitejs.dev/) for the build tool
- [React](https://react.dev/) and [Framer Motion](https://www.framer.com/motion/) for the UI
