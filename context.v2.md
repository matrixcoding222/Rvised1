# Rvised — Context v2 (Current State + Forward Plan)

This is the living context file that reflects the current implementation, decisions, and next steps. The original `context.md` remains as the high-level product vision; this file is the execution map tied directly to what’s built. We move fast and keep scope tight: ship the minimum, verify with real usage, iterate without ceremony. If something doesn’t directly advance the MVP to users, it waits.

Near-term, we focus on one thing: get flawless end-to-end summarization from YouTube into a clean UI and extension, then enable save-to-library with minimal persistence. From there, lock in pricing and limits. Avoid detours. Make the happy path insanely smooth: paste or click → transcript pulled → OpenAI returns structured JSON → timestamps/quiz enforced → user can copy or save. Everything else is optional until the core loop is reliable and cheap.

## 1) What’s built today (MVP baseline)

- Web App (Next.js 14, App Router)
  - `rvised/src/app/page.tsx` renders a simple landing with a single flow.
  - `VideoUrlInput` posts to `/api/summarize` with configurable settings.
  - `SummaryDisplay` presents structured results: main takeaway, summary, insights, actions, optional timestamps and quiz.

- Summarization API (`POST /api/summarize`)
  - Location: `rvised/src/app/api/summarize/route.ts`
  - Inputs: `{ videoUrl, settings, extensionTranscript?, extensionChapters? }`
  - YouTube metadata: fetched via YouTube Data API v3 (`snippet,contentDetails`) using `YOUTUBE_API_KEY`.
  - Transcript strategy (in order):
    1) Use `extensionTranscript` if present (from the extension) — aligns with our preference to use actual transcripts over descriptions [[memory:5309351]].
    2) Library fetch via `youtube-transcript` (server-side).
    3) Direct `captionTracks` scrape from watch page; fall back to VTT/`fmt=json3` timed text.
    4) Timed-text JSON endpoint (`video.google.com/timedtext`).
  - If transcript unavailable: fallback to title + description.
  - OpenAI: `gpt-4-turbo-preview` via `OPENAI_API_KEY`. Forces valid JSON response, then server validates and enforces features (no markdown).
  - Features enforced server-side:
    - Emojis: add/strip based on settings.
    - Timestamps: generate from provided chapters, description chapters, or logical defaults.
    - Quiz: generate simple Q/A when enabled.
    - Code snippets: removed for simplicity (explicitly nulled).
  - CORS enabled for extension (`*` with OPTIONS handler) and accepts `application/json` or URL-encoded payload.

- Chrome Extension (Manifest V3)
  - Files under `extensions/rvised-extension/`.
  - Content script injects an overlay UI on YouTube watch pages with settings and a “Generate Summary” CTA; extracts transcript and chapters where possible and calls the API.
  - Background service worker proxies summarize requests to prod (`https://rvised.vercel.app`) with local fallbacks, sends results back, and sets a context menu to trigger summarization.
  - Popup provides a minimal control surface to start summarization or open the dashboard.

- Feature test endpoint: `GET /api/test-features` returns ready-made settings combos for manual QA.

## 2) Architecture snapshot

- Frontend: Next.js 14 (App Router) + Tailwind (via project styles) + client components.
- API: Next.js route handlers with fetch-based YouTube access and OpenAI Chat Completions.
- Extension: MV3 service worker + content + popup; communicates with API and page.
- Data: No persistence yet (local-only). Save action is not wired to a database.

## 3) Configuration

- Required environment variables:
  - `OPENAI_API_KEY`: for OpenAI summarization.
  - `YOUTUBE_API_KEY`: for metadata (`videos` API: title, description, duration).
- Prod endpoint: `https://rvised.vercel.app` (used by extension). Local fallbacks: `https://localhost:3000` then `http://localhost:3000`.

## 4) Known gaps and technical debt (to address in order)

1) Health endpoint
   - Background script calls `GET /api/health` but it does not exist. Add minimal JSON `{ status: 'ok' }` for monitoring and extension checks.

2) `videoType` field mismatch
   - UI expects `data.videoType` for a badge; API does not return it. Either set a server default (`"other"`) or compute simply on server from transcript heuristics, or make UI resilient to absence.

3) Extension chapters path
   - Content script sends `extensionChapters` only on direct fetch; background path currently sends `transcript` but not chapters. Unify: always forward `extensionChapters` from background to API.

4) Save to Library (persistence)
   - `SummaryDisplay` shows a “Save to Library” button with no backend. Implement minimal persistence (Supabase) with a single `summaries` table and `POST /api/summaries` create.

5) Auth + Limits
   - Add Supabase Auth (Google) and per-user limits (free: 5/day). Enforce server-side.

6) Billing
   - Stripe Checkout with webhook to set `user_subscriptions.status`. Show “Upgrade” CTA in-app and in extension overlay.

7) Error handling polish
   - Standardize error payloads and friendly UI states. Rate-limit the API and guard against OpenAI/YT transient errors.

## 5) User flows (golden paths)

- Web app:
  1) Paste YouTube URL → form validates basic patterns.
  2) Submit → `/api/summarize` returns structured JSON.
  3) UI renders takeaway, summary, insights, actions, optional timestamps/quiz. Copy buttons work.

- Extension:
  1) On YouTube watch page → overlay appears → select settings → Generate Summary.
  2) Content extracts transcript/chapters when possible; background forwards to API.
  3) Overlay renders summary; user can copy and open dashboard.

## 6) API contracts (current)

- `POST /api/summarize`
  - Request: `{ videoUrl: string; settings: { learningMode: 'student'|'build'|'understand'; summaryDepth: 'quick'|'standard'|'deep'; includeEmojis: boolean; includeQuiz: boolean; includeTimestamps: boolean }; extensionTranscript?: string; extensionChapters?: { time: string; description: string }[] }`
  - Response (success): `{ success: true, data: { title, channel, videoId, duration, mainTakeaway, summary, keyInsights[], actionItems[], keyPoints[], timestampedSections?[], quiz?[] } }`
  - Response (error): `{ success: false, error: string }`

- `GET /api/test-features`
  - Returns sample settings payloads for manual testing.

## 7) Testing checklist (manual)

- Web app
  - Valid and invalid YouTube URLs.
  - Videos with/without transcripts; with/without description chapters.
  - Settings toggles for emojis, timestamps, quiz.
  - Large transcripts (ensure parsing and token budgets behave).

- Extension
  - Summarize via overlay and via context menu.
  - SPA navigation on YouTube (overlay re-initializes on video change).
  - Background → API fallback order (prod → https → http local).
  - Chapters present vs absent; verify server-generated logical timestamps.

## 8) Roadmap (minimal, sequential)

1) Ship `/api/health` + fix extension chapters forwarding (quick wins).
2) Add server default for `videoType` and make UI resilient.
3) Implement Supabase `summaries` table + `POST /api/summaries` and wire “Save to Library”.
4) Add Supabase Auth and enforce daily limits.
5) Add Stripe Checkout and usage gating.
6) Polish errors, analytics, and deploy.

## 9) Non-goals for MVP

- Multi-language support, social features, dark mode, mobile apps, and custom models remain out of scope until core loop is validated.

## 10) Changelog (recent highlights)

- Added: robust transcript fallbacks (captionTracks scrape, timed-text JSON) and strong server-side feature enforcement (emojis/timestamps/quiz).
- Added: CORS handling and dual body parsing to support extension.
- Built: MV3 extension with overlay UI, popup, background, and context menu.
- Built: `GET /api/test-features` to speed up QA.

## 11) Deployment notes

- Web: Vercel. Ensure `OPENAI_API_KEY` and `YOUTUBE_API_KEY` are set.
- Extension: package MV3 directory; production API points to `https://rvised.vercel.app` with safe local fallbacks for development.

---

Single source of truth for implementation status. Keep edits minimal and shipped.


