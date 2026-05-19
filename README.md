# Candidates Frontend

A recruiter-facing ATS (Applicant Tracking System) frontend built with Next.js. It lets hiring teams browse, filter, sort, and manage candidates from a central dashboard.

## Features

- **Candidates table** — sortable, paginated list with configurable column visibility persisted to localStorage
- **Filters panel** — tri-state filters for rejection reason, university degree, and salary range; active filter count badge; filter state synced to the URL
- **Row actions** — approve or reject a candidate directly from the table; rejection requires a written reason via a confirmation dialog
- **Candidate profile** — detailed view with inline note management (add / delete) and inline field editing
- **Toast notifications** — success and error feedback for every mutation, with network-error detection
- **Responsive shell** — collapsible sidebar navigation and top header

## Tech stack

| Layer | Library |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI components | [Radix UI Themes](https://www.radix-ui.com/themes) + Radix UI Primitives |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + co-located CSS files |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) |
| Table | [TanStack Table v8](https://tanstack.com/table) |
| HTTP client | [Axios](https://axios-http.com) |
| Testing | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| Linting | ESLint 9 (eslint-config-next) |
| Formatting | Prettier |

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) (`npm install -g pnpm`)
- A running backend API (see environment setup below)

## Setup

```bash
# Install dependencies
pnpm install

# Copy the environment template and fill in your API URL
cp .env.local.example .env.local
```

`.env.local` must contain:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

```bash
# Start the dev server (http://localhost:3000)
pnpm dev
```

## Build

```bash
# Type-check and build for production
pnpm build

# Serve the production build locally
pnpm start
```

## Linting and formatting

```bash
# Run ESLint
pnpm lint

# Check formatting
pnpm format:check

# Auto-fix formatting
pnpm format
```

## Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run tests with coverage report
pnpm test:coverage
```

Coverage thresholds are enforced at **80%** for branches, functions, lines, and statements. The `test:coverage` command will exit with a non-zero code if any threshold is not met.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend REST API |
| `NEXT_PUBLIC_APP_URL` | No | Base URL of this app (used to resolve absolute URLs in Open Graph metadata). Defaults to `http://localhost:3000`. |
