FROM node:alpine AS base

FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN \
    if [ -f package.json ]; then npm ci --only=production && npm cache clean --force; \
    else echo "No package.json found, exiting..." && exit 1; \
    fi

# RUN npm install --save-dev @nestjs/cli

# FROM base AS builder

# WORKDIR /app

# COPY --from=deps /app/node_modules ./node_modules

# COPY . .

# RUN npm run build

# RUN rm -rf ./src

# USER node

FROM base AS development

WORKDIR /app

ENV NODE_ENV=development
ENV PORT=3001

COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json .

EXPOSE 3001

CMD ["node", "server.js"]