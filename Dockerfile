# Stage 1: Base image with Bun
FROM node:20-alpine AS base

WORKDIR /app
RUN apk add --no-cache libc6-compat


#Stage 2: Install Dependencies ( Caching is being used here)
FROM base AS deps

WORKDIR /app

COPY package*.json ./
COPY *.lock ./

COPY prisma ./
RUN npm install --legacy-peer-deps

# Stage 3: Build the application
FROM deps AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "dev"]
EXPOSE 3000

# Stage 4: Production build
FROM deps AS prod
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 5: Final image for production
FROM deps AS final
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs 
RUN addgroup --system --uid 1001 nextjs

COPY --from=prod /app/public ./public

RUN mkdir .next

RUN chown nextjs:nodejs -R .next

#RUN The Standalone Build
COPY --from=prod /app/dist ./dist
COPY --from=prod --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=prod --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=prod --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["node", "server.js"]
