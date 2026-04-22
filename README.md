<div align="center">

# ♻️ EcoTrack

### A Civic Tech Platform for Smarter Waste Management

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[🌐 Live Demo](#) · [🐛 Report Bug](../../issues) · [💡 Request Feature](../../issues)

</div>

---

## Overview

EcoTrack is a civic engagement platform that empowers citizens to report environmental and waste-related issues in their communities. Citizens earn **Green Coins** for verified reports and eco-friendly actions, while admins get real-time analytics and tools to manage and resolve complaints efficiently.

---

## Features

**For Citizens**
- Submit waste/cleanliness complaints with photo and GPS location
- View a live heatmap of complaint hotspots in your area
- Earn Green Coins for reports and eco-actions
- Track complaint status (pending → in progress → resolved)
- Compete on a community leaderboard
- Redeem Green Coins for rewards

**For Admins**
- Overview dashboard with charts and analytics
- Manage and update complaint statuses
- View complaint heatmap across the city
- Manage Green Coins and reward redemptions
- Access collection center locations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Maps | Leaflet, react-leaflet, leaflet.heat |
| Charts | Recharts |
| Backend & Auth | Supabase (PostgreSQL, Auth, Storage) |
| State Management | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |

---

## Database Schema

| Table | Description |
|---|---|
| `profiles` | User profiles with Green Coins balance |
| `complaints` | Waste/cleanliness reports with geo-coordinates |
| `waste_reports` | Categorized waste submissions (biodegradable, recyclable, hazardous, general) |
| `eco_actions` | Available eco-friendly actions citizens can complete |
| `user_eco_actions` | Completed actions per user |
| `green_coins_transactions` | Full transaction history for coin earn/spend |
| `rewards` | Redeemable rewards catalog |
| `reward_redemptions` | Redemption records per user |
| `collection_centers` | Geo-tagged waste collection center locations |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ecotrack.git
cd ecotrack

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key

# 4. Run the dev server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Apply the migrations in `supabase/migrations/` to your Supabase project:

```bash
supabase db push
```

---

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Auth forms
│   ├── dashboard/      # Citizen & admin dashboard widgets
│   ├── maps/           # Leaflet map components (heatmap, complaint map)
│   └── ui/             # shadcn/ui component library
├── contexts/           # AuthContext
├── integrations/       # Supabase client & generated types
├── pages/              # Route-level page components
└── services/           # Supabase service layer
```

---

## User Roles

- **Citizen** — Can submit reports, complete eco-actions, view heatmap, and redeem rewards
- **Admin** — Can manage complaints, view analytics, and administer Green Coins

Role-based access is enforced via Supabase RLS policies and a `user_roles` table.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
