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

Each backend service: `npm run dev` (builds TypeScript then starts with nodemon).
Client: `npm start` from `client/`.
