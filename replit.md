# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### حلها بسيط للخدمات الإلكترونية (`artifacts/halha-basit`)

- **Type**: React + Vite (frontend-only, no backend)
- **Preview path**: `/` (root)
- **Language**: Arabic (RTL)
- **Font**: Tajawal (Google Fonts)
- **Color scheme**: Dark navy + gold + white
- **Routing**: wouter — `/` (home), `/services/:id` (service detail pages)
- **Sections**: Header, Hero, Trust Marquee, Why Us, About, Services, Work Steps, Mid-page CTA, Testimonials, FAQ, Contact, Floating WhatsApp, Footer
- **Service pages**: landing-page, store-optimization, content-writing, cv-writing
- **Contact info**: Phone +966 55 231 2196 (WhatsApp: 966552312196), Email: project1manegment@gmail.com
- **Animations**: framer-motion scroll-reveal + animated number counters in hero
