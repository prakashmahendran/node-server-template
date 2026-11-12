# Build stage: install all dependencies and compile TypeScript
FROM node:22-slim AS build

WORKDIR /usr/src/app/~~name~~

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage: production dependencies and compiled code only
FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /usr/src/app/~~name~~

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=build /usr/src/app/~~name~~/dist ./dist

# Do not run the service as root
USER node

EXPOSE 5050

CMD ["node", "-r", "./dist/env/config.js", "./dist/index.js"]
