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

## Running locally

### Run

From each backend service directory (`posts`, `comments`, `query`, `moderation`, `event-bus`):

```bash
npm install
npm run dev
```

From `client/`:

```bash
npm install
npm start
```

### Access

Open `http://localhost:3000` in your browser. Each backend service is available on its own port (see table above).

---

## Running with Docker

### Build and deploy

From the project root:

```bash
docker compose up --build
```

### Access

Open `http://localhost:3000` in your browser.

---

## Running on Kubernetes

### Prerequisites

Install Ingress NGINX:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.15.1/deploy/static/provider/cloud/deploy.yaml
```

### Build

```bash
docker build -t richdgo4/posts:latest posts/
docker build -t richdgo4/comments:latest comments/
docker build -t richdgo4/query:latest query/
docker build -t richdgo4/moderation:latest moderation/
docker build -t richdgo4/event-bus:latest event-bus/
docker build -t richdgo4/client:latest client/
```

### Deploy

```bash
docker login

docker push richdgo4/posts:latest
docker push richdgo4/comments:latest
docker push richdgo4/query:latest
docker push richdgo4/moderation:latest
docker push richdgo4/event-bus:latest
docker push richdgo4/client:latest

kubectl apply -f infra/k8s/
```

### Access

Open `http://localhost` in your browser.

---

## Running on Kubernetes with Skaffold

Skaffold automates the build-deploy cycle. It builds images directly into the local Docker daemon (no push required) and redeploys automatically when source files change.

### Prerequisites

Install Ingress NGINX (same as above) and [Skaffold v2](https://skaffold.dev/docs/install/).

### Run

```bash
skaffold dev
```

This builds all images, applies the manifests, and watches for file changes.

### Sync

For backend services, Skaffold syncs compiled `.js` files directly into the running container instead of triggering a full rebuild. nodemon in the container then restarts the service automatically.

Since the services are TypeScript, you need to compile first. In each service directory you want to iterate on:

```bash
npm run build
```

Skaffold detects the changed `dist/*.js` files and syncs them into the container.

> **Tip:** Run `tsc --watch` in a service directory to recompile automatically on every `.ts` save, so the sync happens as soon as you save.

Changes to `Dockerfile` or `package.json` always trigger a full rebuild rather than a sync.

### Access

Open `http://localhost` in your browser.
