# @waveview/web

Web frontend client for WaveView app.

## Setup

Create `.env.development.local` (local) and `.env.production.local` (production)
and set the following variables:

- VITE_API_URL

WaveView backend API endpoints URL, e.g. `http://localhost:8000`.

- VITE_WS_URL

WaveView backend API WebSocket URL, e.g. `ws://localhost:8000`.

Then, install all package dependencies:

    pnpm install

Run development server:

    pnpm run dev

## License

MIT
