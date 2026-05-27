FROM node:lts-alpine

ARG REACT_APP_POSTS_URL=http://localhost:4000
ARG REACT_APP_COMMENTS_URL=http://localhost:4001
ARG REACT_APP_QUERY_URL=http://localhost:4002

# CRA bakes env vars into the bundle at build time, so ARGs must be promoted to ENV
ENV REACT_APP_POSTS_URL=$REACT_APP_POSTS_URL
ENV REACT_APP_COMMENTS_URL=$REACT_APP_COMMENTS_URL
ENV REACT_APP_QUERY_URL=$REACT_APP_QUERY_URL

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# -s: SPA mode — unmatched paths fall back to index.html for client-side routing
CMD ["npx", "serve", "-s", "build"]
