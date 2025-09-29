# syntax=docker/dockerfile:1
# This Dockerfile includes Slidev presentations build
# Note: Currently the Slidev builds have esbuild compatibility issues that need to be resolved

# ========================================
# Stage 1: Build Vienna AI Engineering - From Zero to Backlog
# ========================================
FROM oven/bun:latest AS slidev-vienna-zero
WORKDIR /app

# Copy package files and install dependencies
COPY talks/vienna-ai-engineering/from-zero-to-backlog/package.json ./
COPY talks/vienna-ai-engineering/from-zero-to-backlog/bun.lock ./
RUN bun install --frozen-lockfile

# Copy source files and build with base path
COPY talks/vienna-ai-engineering/from-zero-to-backlog/ ./
RUN mkdir -p dist && (bun run build -- --base /talks/vienna-ai-engineering/from-zero-to-backlog/ || echo "Build failed - esbuild compatibility issue")

# ========================================
# Stage 2: Build Vienna AI Engineering - From Backlog to Success
# ========================================
FROM oven/bun:latest AS slidev-vienna-backlog
WORKDIR /app

# Copy package files and install dependencies
COPY talks/vienna-ai-engineering/from-backlog-to-success/package.json ./
COPY talks/vienna-ai-engineering/from-backlog-to-success/bun.lock ./
RUN bun install --frozen-lockfile

# Copy source files and build with base path
COPY talks/vienna-ai-engineering/from-backlog-to-success/ ./
RUN mkdir -p dist && (bun run build -- --base /talks/vienna-ai-engineering/from-backlog-to-success/ || echo "Build failed - esbuild compatibility issue")

# ========================================
# Stage 3: Build Main Astro Site
# ========================================
FROM oven/bun:latest AS astro-build
WORKDIR /app

# Install deps
COPY package.json ./
COPY bun.lock ./
RUN bun install --frozen-lockfile

# Build static site
COPY . .
RUN bun run build

# ========================================
# Stage 4: Production - Serve with Nginx
# ========================================
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# Copy Astro build output
COPY --from=astro-build /app/dist /usr/share/nginx/html

# Copy Slidev builds to their respective paths (if they succeeded)
COPY --from=slidev-vienna-zero /app/dist /usr/share/nginx/html/talks/vienna-ai-engineering/from-zero-to-backlog
COPY --from=slidev-vienna-backlog /app/dist /usr/share/nginx/html/talks/vienna-ai-engineering/from-backlog-to-success

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
