# Mini Microservices

An educational project demonstrating a clean microservice architecture. It implements a minimal blog service where users can create posts and leave comments. Comments go through a moderation pipeline before being visible.

Each service is independent, maintains its own data store, and communicates exclusively through an event bus — no direct service-to-service calls.

## Services

| Service | Port | Responsibility |
|---------|------|----------------|
| `posts` | 4000 | Create and store posts |
| `comments` | 4001 | Create and store comments |
| `query` | 4002 | Read-optimised view of posts with embedded comments |
| `moderation` | 4003 | Moderate comments, filtering out banned words |
| `event-bus` | 4005 | Receive and broadcast events to all services |
| `client` | 3000 | React frontend |

## Event Flow

1. A post is created → `posts` emits `PostCreated` → `query` stores it
2. A comment is created → `comments` emits `CommentCreated` with status `pending` → `query` stores it, `moderation` picks it up
3. After moderation → `moderation` emits `CommentModerated` → `comments` emits `CommentUpdated` → `query` updates the comment status to `approved` or `rejected`

## Running

Install dependencies and start each service with `npm run dev` from its directory. Start the client with `npm start`.
