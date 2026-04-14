# Plan: Tinder-Style Events + Chat UI (ethan branch)

## Tasks

- [x] 1. Add `/chat` and `/saved` routes to `routes.ts`
- [x] 2. Replace `home.tsx` with swipe page (drag + buttons, stack effect, localStorage saves)
- [x] 3. Create `routes/chat.tsx` — chat UI with Claude API action
- [x] 4. Add nav bar to `root.tsx` (Discover / Saved / Chat)
- [x] 5. Create `routes/saved.tsx` — saved events grid with remove button
- [x] 6. Wire up Claude API (ANTHROPIC_API_KEY secret in wrangler.jsonc, typed in workers/app.ts)
- [x] 7. Delete boilerplate (welcome.tsx, logos)

## Review

- 5 files changed/created, 3 deleted
- Swipe page: drag left/right or use buttons, SAVE/SKIP labels appear mid-drag, stack card behind current
- Saved page: reads localStorage, shows event cards, remove button per card, register link
- Chat: server-side Claude action, knows all events + user's saved events, message thread UI
- To deploy: run `wrangler secret put ANTHROPIC_API_KEY` then `pnpm run deploy` from `/frontend`
