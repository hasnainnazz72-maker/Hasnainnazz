# Latigo Music

## Overview
Latigo Music is an imported AI Studio project — an interactive, gamified "music ticket" simulation platform. Users can upgrade VIP levels, buy simulated music tickets for daily returns, build a referral team for multi-level commissions, and manage a virtual balance. All funds and transactions are simulated for demo/educational purposes; no real money or crypto is used.

## Tech stack
- Frontend: React 19 + TypeScript, Vite 6, Tailwind CSS 4, Recharts, Framer Motion (`motion`), lucide-react icons
- Backend: Express (TypeScript, run via `tsx`), serving both the API and the Vite dev middleware in one process
- AI: `@google/genai` (Gemini API) for AI-powered features
- Email: Resend API for verification emails (optional — sandbox mode shows codes on screen if unset)
- Data storage: flat JSON files (`data-accounts.json`, `data-settings.json`) read/written directly by the server — no database

## Running the app
- Workflow "Start application" runs `npm run dev` (`tsx server.ts`), which serves the Express API and Vite middleware together on port 3000 (bound to `0.0.0.0`).
- Build: `npm run build` (Vite build + esbuild bundle of the server to `dist/server.cjs`); Start (prod): `npm start`.

## Environment variables / secrets
- `GEMINI_API_KEY` — required for Gemini AI features. Not yet set; app runs but logs a warning and AI features will not work until it's added.
- `RESEND_API_KEY` — optional. Without it, email verification runs in sandbox mode (codes shown on screen instead of emailed).
- `APP_URL` — optional, used for self-referential links; AI Studio auto-injected this previously.

## Notes
- `.replit` port is 3000 (not 5000), so the workflow output type is "console" rather than "webview".
- Project structure kept as-imported; no restructuring done during initial setup.
