# Mini Microservices

Educational project exploring microservice architecture and event-driven design. See README.md for a full overview.

## Architecture

Each service is self-contained: own data store, no direct service-to-service calls, communicates only via the event bus at port 4005.

The frontend fetches posts (with embedded comments) exclusively from the query service — not from posts or comments directly.

## Event Catalogue

| Event | Emitted by | Consumed by |
|-------|-----------|-------------|
| `PostCreated` | posts | query |
| `CommentCreated` | comments | query, moderation |
| `CommentModerated` | moderation | comments |
| `CommentUpdated` | comments | query |

## Comment Status Lifecycle

`pending` (set by comments on creation) → moderation picks up `CommentCreated`, waits (simulated delay), emits `CommentModerated` → comments updates its store and emits `CommentUpdated` → query updates stored comment status to `approved` or `rejected`.

## Conventions

- Private module-level variables and functions are prefixed with `_`
- Event handler maps use `Record<string, (data: unknown) => ...>` — always type the return as `Promise<void>` if any handler is async
- Validation functions use TypeScript type predicates (`data is T`) and log errors on failure
- All `async function` declarations include explicit return types

## Running

All services (Docker): `docker compose up --build` from the project root.
Backend (local): `npm run dev` from each service directory.
Client (local): `npm start` from `client/`.

## Docker

A single parameterised `Dockerfile` at the project root builds any backend service via `ARG SERVICE`. `docker-compose.yml` defines all six services including the client. Backend inter-service URLs are wired through environment variables (`EVENT_BUS_URL` on each service, per-service URL vars on `event-bus`); services fall back to `localhost` when unset, so local dev works without Docker.

The client has its own `client/Dockerfile`. It builds the React SPA with `npm run build` and serves the static output via `npx serve`. API calls are made by the browser (not the container), so the client uses `localhost` service URLs just like local dev — the container only serves the static files. Backend service URLs are configurable via `REACT_APP_*` build args.
