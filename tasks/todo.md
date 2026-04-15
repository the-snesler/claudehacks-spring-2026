# Plan: Standalone Chat System

## Goal
A self-contained chat module that can be dropped into any React Router + Cloudflare Workers frontend.
Import `<ChatWidget />` and a server action, done.

## Files to create
- `frontend/app/chat/types.ts` — shared Message and Event types
- `frontend/app/chat/useChat.ts` — hook managing messages, streaming, tool calls
- `frontend/app/chat/EventCard.tsx` — small inline event card rendered inside chat
- `frontend/app/chat/ChatWidget.tsx` — full UI component (thread + input), accepts `events` prop
- `frontend/app/chat/action.server.ts` — server action: streaming Anthropic API + tool use

## Features
1. **Streaming** — responses stream word by word via ReadableStream (no waiting for full reply)
2. **Tool use** — Claude can call `search_events(query)` to find and surface matching events inline as cards inside the chat
3. **Clean export** — `ChatWidget` takes `events` as a prop, action takes `ANTHROPIC_API_KEY` from env

## Notes
- Keep each file small and focused
- No extra dependencies beyond what's already installed
- Streaming via fetch + ReadableStream on the server, consumed with a reader on the client
