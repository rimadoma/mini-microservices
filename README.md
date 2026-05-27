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

**All services (Docker):** from the project root:

```bash
docker compose up --build
```

**Backend (local):** install dependencies and start each service with `npm run dev` from its directory.

**Client (local):** `npm start` from `client/`.

**Kubernetes:** build and tag each backend image, then apply the manifests:

```bash
docker build --build-arg SERVICE=posts -t richdgo4/posts:latest .
docker build --build-arg SERVICE=comments -t richdgo4/comments:latest .
docker build --build-arg SERVICE=query -t richdgo4/query:latest .
docker build --build-arg SERVICE=moderation -t richdgo4/moderation:latest .
docker build --build-arg SERVICE=event-bus -t richdgo4/event-bus:latest .

docker login

docker push richdgo4/posts:latest
docker push richdgo4/comments:latest
docker push richdgo4/query:latest
docker push richdgo4/moderation:latest
docker push richdgo4/event-bus:latest

kubectl apply -f infra/k8s/
```
