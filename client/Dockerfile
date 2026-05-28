FROM node:lts-alpine

ARG REACT_APP_BASE_URL=http://localhost

# CRA bakes env vars into the bundle at build time, so ARGs must be promoted to ENV
ENV REACT_APP_BASE_URL=$REACT_APP_BASE_URL

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# -s: SPA mode — unmatched paths fall back to index.html for client-side routing
CMD ["npx", "serve", "-s", "build"]
