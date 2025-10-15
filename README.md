# Check Ledger Pro (React + Node)

Calendar-based check ledger: deposits (green) & payments (red), email reminders (optional), reports & CSV export.

## Quick start (local)

### Server
```bash
cd server
cp .env.example .env  # fill SMTP if you want email reminders; otherwise leave blank
npm i
npm run dev
```
Server runs at http://localhost:5050

### Client
```bash
cd client
npm i
# set API base (optional)
# echo VITE_API_BASE=http://localhost:5050 > .env
npm run dev
```
Client runs at http://localhost:5173

## Deploy
- Server: Render/Railway/any Node host
- Client: Netlify/Vercel (set VITE_API_BASE to your server URL)
