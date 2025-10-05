# syntax=docker/dockerfile:1
# This Dockerfile includes Slidev presentations build

# ========================================
# Stage 1: Build Vienna AI Engineering - From Zero to Backlog
# ========================================
FROM node:24-alpine AS slidev-vienna-zero
WORKDIR /app

# Copy package files and install dependencies
COPY talks/vienna-ai-engineering/from-zero-to-backlog/package.json ./
COPY talks/vienna-ai-engineering/from-zero-to-backlog/package-lock.json ./
RUN rm -f package-lock.json && npm install --no-audit

# Copy source files and build with base path
COPY talks/vienna-ai-engineering/from-zero-to-backlog/ ./
RUN mkdir -p dist && npm run build -- --base /talks/vienna-ai-engineering/from-zero-to-backlog/

# ========================================
# Stage 2: Build Vienna AI Engineering - From Backlog to Success
# ========================================
FROM node:24-alpine AS slidev-vienna-backlog
WORKDIR /app

# Copy package files and install dependencies
COPY talks/vienna-ai-engineering/from-backlog-to-success/package.json ./
COPY talks/vienna-ai-engineering/from-backlog-to-success/package-lock.json ./
RUN rm -f package-lock.json && npm install --no-audit

# Copy source files and build with base path
COPY talks/vienna-ai-engineering/from-backlog-to-success/ ./
RUN mkdir -p dist && npm run build -- --base /talks/vienna-ai-engineering/from-backlog-to-success/

# ========================================
# Stage 3: Build Devoxx - Hands-on: Backlog.md
# ========================================
FROM node:24-alpine AS slidev-devoxx-backlog
WORKDIR /app

# Copy package files and install dependencies
COPY talks/devoxx/hands-on-backlog/package.json ./
COPY talks/devoxx/hands-on-backlog/package-lock.json ./
RUN rm -f package-lock.json && npm install --no-audit

# Copy source files and build with base path
COPY talks/devoxx/hands-on-backlog/ ./
RUN mkdir -p dist && npm run build -- --base /talks/devoxx/hands-on-backlog/

# ========================================
# Stage 4: Build Devoxx - Backlog success
# ========================================
FROM node:24-alpine AS slidev-devoxx-success
WORKDIR /app

# Copy package files and install dependencies
COPY talks/devoxx/backlog-success/package.json ./
COPY talks/devoxx/backlog-success/package-lock.json ./
RUN rm -f package-lock.json && npm install --no-audit

# Copy source files and build with base path
COPY talks/devoxx/backlog-success/ ./
RUN mkdir -p dist && npm run build -- --base /talks/devoxx/backlog-success/

# ========================================
# Stage X: Build Main Astro Site
# ========================================
FROM node:24-alpine AS astro-build
WORKDIR /app

# Install deps
COPY package.json ./
COPY package-lock.json ./
RUN rm -f package-lock.json && npm install --no-audit

# Build static site
COPY . .
RUN npm run build

# ========================================
# Stage Y: Production - Serve with Nginx
# ========================================
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# Copy Astro build output
COPY --from=astro-build /app/dist /usr/share/nginx/html

# Copy Slidev builds to their respective paths (if they succeeded)
COPY --from=slidev-vienna-zero /app/dist /usr/share/nginx/html/talks/vienna-ai-engineering/from-zero-to-backlog
COPY --from=slidev-vienna-backlog /app/dist /usr/share/nginx/html/talks/vienna-ai-engineering/from-backlog-to-success
COPY --from=slidev-devoxx-backlog /app/dist /usr/share/nginx/html/talks/devoxx/hands-on-backlog
COPY --from=slidev-devoxx-success /app/dist /usr/share/nginx/html/talks/devoxx/backlog-success

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
