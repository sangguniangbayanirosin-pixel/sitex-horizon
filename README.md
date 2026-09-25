# Sitex Horizon

Live bus arrivals for **SITEX** (Sorsogon Integrated Terminal Exchange / SM Sorsogon).

Phone GPS from the driver or conductor updates speed and ETA for all 16 Sorsogon municipalities. Waiting passengers can ask if a bus is coming; one confirm lights the plate on every terminal screen until that bus arrives.

## This is not GitHub Pages

Do **not** use `*.github.io` as the live board. GitHub Pages cannot run this app (it needs a server + GPS + database). That 404 is expected.

**To get a public website:** in Grok Build, tap **Publish**.

## Screens

| Path | Who |
|---|---|
| `/` | Public SITEX TV board |
| `/passenger` | Waiting passengers — Ask if coming |
| `/driver` | Driver / conductor — GPS + Confirmed |
| `/report` | Passenger report to Sitex / cooperatives |
| `/admin` | Staff announcements, ads, reports |

Driver demo: plate `7G-4821` · code `1982`  
Staff PIN: `4700`

## Run on a computer

```bash
npm install
npm run dev
```

Production needs Postgres (`DATABASE_URL`) and `npm run build`. See [SITEX-DEPLOY.md](SITEX-DEPLOY.md).

Para sa mga Sorsoganon.
