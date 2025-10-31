# Fault Hub — Frontend

This repository contains the frontend for the Fault Hub application (Next.js). The backend is available at:
https://github.com/NischalGautam8/fault_hub_backend

## Overview

Fault Hub is an app for reporting and discussing faults/leader-related issues. This repository holds the Next.js frontend and client-side logic.

## Prerequisites

- Node.js 18+ (or the version used by the project)
- npm (or yarn/pnpm)
- Access to the backend repository (see link above) if you need API keys or backend env values
- Convex configuration is present in `convex/` (this project uses Convex for realtime / DB)

## Setup (frontend)

1. Clone the repo (if you haven't already):
```bash
git clone https://github.com/NischalGautam8/fault_hub_frontend.git
cd fault_hub_frontend
```

2. Install dependencies:
```bash
# npm
npm install

# or yarn
# yarn

# or pnpm
# pnpm install
```

3. Add environment variables:
- Copy or create `.env.local` in the project root with required variables.
- See `lib/.env` and `convex/README.md` for hints about Convex and other env keys that may be required.
- If you use the backend repo, get any necessary API keys or JWT secrets from backend config or maintainers.

4. Run development server:
```bash
npm run dev
```
Then open http://localhost:3000 in your browser.

5. Build for production:
```bash
npm run build
npm run start
```

## Convex

This project includes Convex configuration under `convex/`. Review `convex/README.md` for running or deploying Convex locally or using the Convex cloud.

## Backend

Backend repository: https://github.com/NischalGautam8/fault_hub_backend

