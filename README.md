# FleetCode — Squad Radar

A gamified tracking frontend for LeetCode squads. Dark ops-console aesthetic
built around the "radar handshake" concept from the auth API: corner-bracket
HUD panels, a radar-sweep loader, and JetBrains Mono for anything numeric or
code-shaped.

## Stack

- React 18 + Vite
- Tailwind CSS (custom `void` / `signal` / `terminal` color system — see `tailwind.config.js`)
- React Router DOM v6
- Context API for JWT session state
- Axios with request/response interceptors
- react-syntax-highlighter (lazy-loaded) for the scraper's code view

## Setup — from scratch

If you were bootstrapping this project yourself rather than using the files
provided, these are the exact commands that produce this structure:

```bash
# 1. Scaffold the Vite + React project
npm create vite@latest fleetcode-frontend -- --template react
cd fleetcode-frontend

# 2. Install routing + API client + icons + syntax highlighting
npm install react-router-dom axios lucide-react react-syntax-highlighter

# 3. Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

That last command generates `tailwind.config.js` and `postcss.config.js` —
this project's versions are already customized with the FleetCode design
tokens (colors, fonts, animations), so don't overwrite them.

## Running this project

```bash
npm install
npm run dev       # starts on http://localhost:5173
npm run build     # production build to /dist
npm run preview   # preview the production build locally
```

## Configuration

The API base URL is centralized in one place — no hardcoded URLs scattered
through components:

```
src/utils/constants.js
  export const API_BASE_URL = 'http://20.244.43.12:8000/api';
```

Change it there if the backend ever moves (e.g. to an env var via
`import.meta.env.VITE_API_BASE_URL`).

## Folder structure

```
fleetcode-frontend/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── src/
    ├── main.jsx                 # ReactDOM root: BrowserRouter > AuthProvider > App
    ├── App.jsx                  # Route table
    ├── index.css                # Tailwind layers + HUD panel / grid-texture base styles
    ├── api/
    │   └── axiosClient.js       # Axios instance, JWT attach + 401 interceptor
    ├── context/
    │   └── AuthContext.jsx      # JWT session state: login, register, verify, logout
    ├── components/
    │   ├── Navbar.jsx           # Persistent nav for authenticated users
    │   ├── ProtectedRoute.jsx   # Route guard, redirects to /auth
    │   ├── RadarLoader.jsx      # Radar-sweep loading indicator (reused everywhere)
    │   ├── StatCard.jsx         # Dashboard stat tile
    │   ├── SquadOnboarding.jsx  # Create/join squad flow (shown when user has no squad)
    │   ├── SquadRoster.jsx      # Squad member table
    │   ├── ActivityFeed.jsx     # Recent submissions feed
    │   ├── ScraperPanel.jsx     # Paste a submission URL, fetch + display code
    │   └── CodeBlock.jsx        # Lazy-loaded syntax highlighter (code-split)
    ├── pages/
    │   ├── AuthView.jsx         # Login/Register toggle + radar handshake verify step
    │   ├── Dashboard.jsx        # Protected: squad stats, roster, activity, scraper
    │   └── Leaderboard.jsx      # Top 10 squads ranked by score
    └── utils/
        └── constants.js         # API_BASE_URL, storage keys, route paths
```

## How the pieces fit together

**Auth & JWT (`AuthContext.jsx` + `axiosClient.js`)**
The JWT is kept in `localStorage` and mirrored into React state. Every
outgoing Axios request has the token attached via a request interceptor, so
no component ever manually sets an `Authorization` header. A response
interceptor watches for `401`s globally — if the token is rejected or
expires, the session is cleared and the user is bounced back to `/auth`
automatically.

**The radar handshake (`AuthView.jsx`)**
Register → `POST /auth/register` → on success, immediately
`GET /auth/verify/{username}` runs while a radar-sweep loader plays. Success
shows a "profile verified" confirmation and hands off to the login form.
Failure explains that the account exists but the LeetCode link couldn't be
confirmed, with a retry button (re-runs the same verify call) or a "skip for
now" escape hatch — registration and verification are separate backend
calls, so a failed handshake never blocks the user from logging in.

**Dashboard (`Dashboard.jsx`)**
Fetches `GET /dashboard/{username}` (JWT-protected via the interceptor). If
the user has no squad yet, `SquadOnboarding` renders instead of stats,
offering create (`POST /squad/create`) or join (`POST /squad/join`). Once in
a squad: stat tiles, a sortable roster, a recent-activity feed, a "force
sync" button (`GET /squad/force-sync`) and "leave squad"
(`POST /squad/leave`) — all sitting above the `ScraperPanel`.

> The spec doesn't pin down the exact JSON shape of `/dashboard/{username}`
> or `/leaderboard/`. `Dashboard.jsx` and `Leaderboard.jsx` both normalize
> the response defensively (checking a few likely key names per field) so
> the UI doesn't break on a naming mismatch — adjust the `normalize*`
> helpers at the top of each file once you can see a real payload.

**Scraper (`ScraperPanel.jsx`)**
"Generate session cookies" hits `POST /scraper/generate-cookies?headless=true`
first (needed before scraping works, per a real LeetCode session). Pasting a
submission URL and hitting "Fetch code" calls
`POST /scraper/fetch-code` and renders the result in a syntax-highlighted
block (language is auto-guessed from the code shape), with a one-click copy
button. The highlighter itself is lazy-loaded so it never bloats the initial
bundle for users who never open the scraper.

**Leaderboard (`Leaderboard.jsx`)**
`GET /leaderboard/`, top 10 squads, gold/silver/bronze treatment for the top
3, and the user's own squad gets a subtle highlight ring if it appears in
the list.

## Design notes

- Palette: `void` (near-black backgrounds), `signal` (orange — alerts,
  primary actions, the "radar" motif), `terminal` (cyan — verified/success
  states), `rankgold` (leaderboard #1). See `tailwind.config.js`.
- Type: Space Grotesk for display headings, Inter for UI copy, JetBrains
  Mono for anything numeric, a username, or code.
- Signature element: the `.hud-panel` corner-bracket container and the
  radar-sweep loader — both a direct visual reference to the `/auth/verify`
  "radar handshake" language in the API itself, rather than generic
  dark-mode decoration.
- Respects `prefers-reduced-motion` and keeps visible keyboard focus rings
  throughout (see `src/index.css`).
