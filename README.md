# AI UGC Prompt Factory

Generate complete, production-ready prompts for AI video generators (Google Flow, Veo, Kling, Hailuo, Runway, Pika) while keeping a consistent AI actor across every video. Save a character once, reuse it everywhere — no more rewriting appearance descriptions.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- shadcn/ui-style components (hand-built on Radix primitives, since the shadcn registry isn't reachable from this environment)
- Framer Motion
- localStorage for offline saving

## Run locally

**Prerequisites:** Node.js 20.9+

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Build for production:
   `npm run build`
