# syntax=docker/dockerfile:1
# This Dockerfile includes Slidev presentations build

# ========================================
# Stage 1: Build All Slidev Presentations
# ========================================
FROM oven/bun:latest AS slidev-builds
WORKDIR /app

# Copy the theme submodule first (required by all talks)
COPY slidev-theme-penguin ./slidev-theme-penguin

# Install dependencies once from a talk manifest that includes the superset of Slidev deps
# We need to adjust the path in package.json since we're copying it to root
COPY talks/voxxed/backlog-presentation/package.json ./package.json
RUN sed -i 's|file:../../../slidev-theme-penguin|file:./slidev-theme-penguin|g' package.json

# Skip Playwright browser downloads to speed up builds (browsers not needed for slidev build)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

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

# Build AI Native Dev - Backlog Presentation
COPY talks/ai-native-dev/backlog-presentation/ ./ai-native-dev-presentation/
RUN cd ai-native-dev-presentation && mkdir -p dist && bun run build -- --base /talks/ai-native-dev/backlog-presentation/

# Build AI Native Dev - Backlog Workshop
COPY talks/ai-native-dev/backlog-workshop/ ./ai-native-dev-workshop/
RUN cd ai-native-dev-workshop && mkdir -p dist && bun run build -- --base /talks/ai-native-dev/backlog-workshop/

# Build Voxxed Days Ticino - Backlog Presentation
COPY talks/voxxed/backlog-presentation/ ./voxxed-backlog-presentation/
RUN cd voxxed-backlog-presentation && mkdir -p dist && bun run build -- --base /talks/voxxed/backlog-presentation/

# Build Vienna AI Engineering - The Explosion of Tools
COPY talks/vienna-ai-engineering/the-explosion-of-tools/ ./vienna-explosion/
RUN cd vienna-explosion && mkdir -p dist && bun run build -- --base /talks/vienna-ai-engineering/the-explosion-of-tools/

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
COPY --from=slidev-builds /app/ai-native-dev-presentation/dist /usr/share/nginx/html/talks/ai-native-dev/backlog-presentation
COPY --from=slidev-builds /app/ai-native-dev-workshop/dist /usr/share/nginx/html/talks/ai-native-dev/backlog-workshop
COPY --from=slidev-builds /app/voxxed-backlog-presentation/dist /usr/share/nginx/html/talks/voxxed/backlog-presentation
COPY --from=slidev-builds /app/vienna-explosion/dist /usr/share/nginx/html/talks/vienna-ai-engineering/the-explosion-of-tools

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
