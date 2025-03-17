# @waveview/web

Web frontend client for WaveView app.

## Setup

Create `.env.development.local` (local) and `.env.production.local` (production)
and set the following variables:

- VITE_API_URL

WaveView backend API endpoints URL, e.g. `http://localhost:8000`.

- VITE_WS_URL

WaveView backend API WebSocket URL, e.g. `ws://localhost:8000`.

- VITE_BUILD_VENDOR

Vendor specific features and UI extensions. Available vendors are: `cendana15`.

- VITE_COMMIT_HASH

The commit hash marking the specific build.

Then, install all package dependencies:

    pnpm install

Run development server:

    pnpm run dev

To build and minify for production:

    pnpm run build

To run the test:

    pnpm run test

## License

MIT
