# syntax=docker/dockerfile:1

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
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
