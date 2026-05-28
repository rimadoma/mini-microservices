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

## API Routes (browser-facing)

| Method | Path | Service |
|--------|------|---------|
| `POST` | `/posts/create` | posts |
| `POST` | `/posts/:id/comments` | comments |
| `GET` | `/posts` | query |

## Conventions

- Private module-level variables and functions are prefixed with `_`
- Event handler maps use `Record<string, (data: unknown) => ...>` — always type the return as `Promise<void>` if any handler is async
- Event route handlers must NOT await long-running event handlers — respond 200 immediately and let the handler run in the background
- Validation functions use TypeScript type predicates (`data is T`) and log errors on failure
- All `async function` declarations include explicit return types

## Running

All services (Docker): `docker compose up --build` from the project root.
Backend (local): `npm run dev` from each service directory.
Client (local): `npm start` from `client/`.
Kubernetes: `kubectl apply -f infra/k8s/` (see README.md for full steps).
Kubernetes with Skaffold: `skaffold dev` from the project root.

## Docker

Each service has its own `Dockerfile` in its directory. All backend Dockerfiles are identical: install deps, compile TypeScript, run via `npm start` (nodemon). `docker-compose.yml` defines all six services including the client. Backend inter-service URLs are wired through environment variables (`EVENT_BUS_URL` on each service, per-service URL vars on `event-bus`); services fall back to `localhost` when unset, so local dev works without Docker.

The client `Dockerfile` builds the React SPA with `npm run build` and serves the static output via `npx serve`. API calls are made by the browser (not the container). The client accepts a single `REACT_APP_BASE_URL` build arg (default `http://localhost`) used by all three components — individual service fallback URLs are hardcoded per-component for local dev.

## Kubernetes

Ingress NGINX is the sole entry point. All routes use `host: localhost` in a single Ingress resource (`infra/k8s/ingresses.yaml`) with the annotation `nginx.ingress.kubernetes.io/use-regex: "true"` to ensure correct path matching order. Paths are listed most-specific first, with `Prefix /` as the catch-all for the client.

Backend services are `ClusterIP`. The client service is also `ClusterIP` — external access goes through the ingress, not direct port exposure.

Skaffold (`skaffold.yaml`) builds all images into the local Docker daemon (`push: false`) and applies the manifests. No registry push needed for local k8s.
