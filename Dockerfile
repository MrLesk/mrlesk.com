# syntax=docker/dockerfile:1

# Build Main Astro Site
FROM oven/bun:latest AS build
WORKDIR /app

# Install deps
COPY package.json ./
RUN bun install

# Build static site
COPY . .
RUN bun run build

# Serve with nginx (static)
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if Slidev builds are added later
# For now, use default nginx config for simple serving
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]