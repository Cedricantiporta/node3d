# AI UGC Prompt Factory

Generate complete, production-ready prompts for AI video generators (Google Flow, Veo, Kling, Runway, Hailuo, Pika) while keeping a consistent AI actor across every video. Save a character once, reuse it everywhere — no more rewriting appearance descriptions. The goal: character select → product details → prompts in under a minute.

## Features

- **Character Library** — save reusable AI actors with full appearance, wardrobe, voice, personality, scene defaults, negative prompts, and five labeled reference-image slots (front/side/back/smiling/neutral). Create, edit, duplicate, delete.
- **Product input** — name, optional URL with server-side extraction (pulls `og:`/meta tags via `/api/extract-product`, autofills only empty fields), description, tag-style selling points, target audience, country/language, and platform.
- **Video settings** — duration, tone, camera style, hook style, CTA style, aspect ratio, and a multi-select of AI video platforms (always keeps at least one selected).
- **One-click generation** — pick a character, fill in the product, hit *Generate All Prompts* and get a full set: one video prompt per selected platform (each in that platform's own dialect), image prompt, thumbnail prompt, B-roll prompt, camera/lighting directions, negative prompt, full UGC script, hook, CTA, caption, and hashtags — organized into tabs with per-card copy buttons and a Copy All.
- **Prompt optimization** — a rule-based pass appends realism boosters, cinematic-quality descriptors, camera-movement refinement, and AI-artifact prevention terms without ever touching the character identity block. Toggle it on/off on the Generate page.
- **Prompt templates** — 10 built-in editable UGC scenarios (Product Review, Unboxing, Testimonial, Day in the Life, GRWM, Skincare, Food Review, Tech Review, Lifestyle, Comedy) using `{{character.x}}` / `{{product.x}}` placeholder tokens, plus custom templates.
- **History** — every generation auto-saves. Search, filter by character/platform/favorite, edit prompt text inline, duplicate ("load into Generate" to re-run with the same inputs), delete, and export.
- **Export** — Markdown, plain text, JSON, and a print-styled PDF, from both the Generate results and History detail view.
- **Provider architecture** — prompt enhancement and video generation both go through typed provider interfaces (`lib/providers`) with a working local rule-based provider today and clearly TODO'd stubs for Claude/OpenAI/Gemini and all six video platforms, configurable from Settings.
- **Dashboard** — stats, recent history, and quick-access character cards to jump straight into Generate.

## Tech stack

- Next.js 16 (App Router) + TypeScript + Turbopack
- Tailwind CSS v4
- shadcn/ui-style components (hand-built on Radix primitives — the shadcn CLI registry isn't reachable from this sandbox's network policy)
- Framer Motion
- next-themes for light/dark mode
- localStorage for offline saving, via a small versioned persistence layer with quota-exceeded handling
- Vitest for unit tests (engine, storage, provider registry)

## Project structure

- `app/` — routes: `/` (dashboard), `/characters`, `/generate`, `/templates`, `/history`, `/settings`, plus the `/api/extract-product` route handler
- `components/` — UI components, grouped by feature (`characters/`, `product/`, `video-settings/`, `generate/`, `templates/`, `history/`) plus `components/ui/` primitives
- `lib/engine/` — the pure prompt generation engine and rule-based optimizer
- `lib/providers/` — provider interfaces, registry, and implementations/stubs
- `lib/storage/` — the localStorage persistence layer
- `lib/export/` — Markdown/text/JSON/PDF export
- `hooks/` — React hooks wrapping storage for characters, templates, history, and app settings
- `types/` — shared domain types

## Run locally

**Prerequisites:** Node.js 20.9+

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Run unit tests:
   `npm run test`
4. Build for production:
   `npm run build`
