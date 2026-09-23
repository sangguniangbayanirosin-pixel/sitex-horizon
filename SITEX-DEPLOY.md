# Sitex Horizon — deploy

Live bus monitoring for SITEX (Sorsogon Integrated Terminal Exchange / SM Sorsogon).

## What this is

- Public terminal board, passenger phone, driver/conductor GPS, staff control
- Live ETA from phone GPS speed: `ETA = remaining km ÷ velocity`
- Passenger **Ask if coming** → driver taps **Confirmed** → plate lights on every screen
- Postgres backend (Neon in production, embedded PGLite in preview)

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL. Driver page shares GPS. Passenger page pings a bus. Terminal shows the confirmed plate.

## Production

1. Node 22+
2. Set `DATABASE_URL` to a Postgres / Neon connection string
3. `npm install`
4. `npm run build`  (also applies `migrations/*.sql`)
5. `npm run preview` or serve the TanStack Start output with `node .output/server/index.mjs` if your host uses Nitro

Staff PIN for Control: **4700**

## Screens

| Path | Who |
|---|---|
| `/` | Public SITEX board |
| `/passenger` | Waiting passengers — ask if a bus is coming |
| `/driver` | Driver / conductor — GPS + **Confirmed** |
| `/report` | Passenger report to Sitex / cooperatives |
| `/admin` | Staff announcements, ads, reports (PIN) |
