# syntax=docker/dockerfile:1
# This Dockerfile includes Slidev presentations build

# ========================================
# Stage 1: Build All Slidev Presentations
# ========================================
FROM oven/bun:latest AS slidev-builds
WORKDIR /app

# Install dependencies once (all talks use same dependencies)
COPY talks/devoxx/backlog-success/package.json ./package.json
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --no-save

# Build Vienna AI Engineering - From Zero to Backlog
COPY talks/vienna-ai-engineering/from-zero-to-backlog/ ./vienna-zero/
RUN cd vienna-zero && mkdir -p dist && bun run build -- --base /talks/vienna-ai-engineering/from-zero-to-backlog/

# Build Vienna AI Engineering - From Backlog to Success
COPY talks/vienna-ai-engineering/from-backlog-to-success/ ./vienna-backlog/
RUN cd vienna-backlog && mkdir -p dist && bun run build -- --base /talks/vienna-ai-engineering/from-backlog-to-success/

# Build Devoxx - Hands-on: Backlog.md
COPY talks/devoxx/hands-on-backlog/ ./devoxx-backlog/
RUN cd devoxx-backlog && mkdir -p dist && bun run build -- --base /talks/devoxx/hands-on-backlog/

# Build Devoxx - Backlog success
COPY talks/devoxx/backlog-success/ ./devoxx-success/
RUN cd devoxx-success && mkdir -p dist && bun run build -- --base /talks/devoxx/backlog-success/

# ========================================
# Stage X: Build Main Astro Site
# ========================================
FROM oven/bun:latest AS astro-build
WORKDIR /app

# Install deps
COPY package.json ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --no-save

# Build static site
COPY . .
RUN bun run build

# ========================================
# Stage Y: Production - Serve with Nginx
# ========================================
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# Copy Astro build output
COPY --from=astro-build /app/dist /usr/share/nginx/html

# Copy Slidev builds to their respective paths
COPY --from=slidev-builds /app/vienna-zero/dist /usr/share/nginx/html/talks/vienna-ai-engineering/from-zero-to-backlog
COPY --from=slidev-builds /app/vienna-backlog/dist /usr/share/nginx/html/talks/vienna-ai-engineering/from-backlog-to-success
COPY --from=slidev-builds /app/devoxx-backlog/dist /usr/share/nginx/html/talks/devoxx/hands-on-backlog
COPY --from=slidev-builds /app/devoxx-success/dist /usr/share/nginx/html/talks/devoxx/backlog-success

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
