# 1. Cambiamos a la versión 20 que pide Next.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 2. Pasamos la URL del backend para que se inyecte en el build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# 3. También cambiamos la versión aquí para que coincida
FROM node:20-alpine AS runner
WORKDIR /app

# Set Colombia timezone (UTC-5, no DST) — affects Next.js server-side rendering
# and any server components that call new Date().
RUN apk add --no-cache tzdata
ENV TZ=America/Bogota

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]