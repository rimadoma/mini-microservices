FROM node:lts-alpine

ARG SERVICE
WORKDIR /app/${SERVICE}

COPY ${SERVICE}/package.json ./
RUN npm install
COPY ${SERVICE}/ ./
RUN npm run build

CMD ["node", "dist/index.js"]