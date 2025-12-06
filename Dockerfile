FROM node:20-alpine

WORKDIR /app

# Build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./

RUN npm ci && npm rebuild better-sqlite3 --build-from-source

COPY . .

ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
