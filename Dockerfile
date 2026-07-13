# syntax=docker/dockerfile:1
# This Dockerfile includes Slidev presentations build

# ⚠️  WHEN ADDING A NEW TALK, REMEMBER ALL FIVE PLACES:
#     1. Add any new dependency/theme to slidev-build.package.json (and COPY the theme below)
#     2. Add a build step in Stage 1 below
#     3. Add a COPY --from=slidev-builds line in Stage Y (production)
#     4. Add a `location` block in nginx.conf
#     5. (Optional) Add a content-collection entry in src/content/talks/ to list it
#        on the public Talks page — skip to keep the talk unlisted/URL-only

# ========================================
# Stage 1: Build All Slidev Presentations
# ========================================
FROM oven/bun:latest AS slidev-builds
WORKDIR /app

# Copy the theme submodules first (required by all talks)
COPY slidev-theme-penguin ./slidev-theme-penguin
COPY slidev-theme-codex ./slidev-theme-codex
COPY slidev-theme-codex-dark ./slidev-theme-codex-dark

# Install the union of dependencies used by all talks once. Keeping this manifest
# separate from an individual talk avoids accidental omissions when a new deck uses
# an extra package such as qrcode or a different local theme.
COPY slidev-build.package.json ./package.json

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

# Build Codex Community Meetup Vienna - April 27, 2026 (unlisted; reachable by URL only)
COPY talks/codex/meetup-april-2026/ ./codex-meetup-april-2026/
RUN cd codex-meetup-april-2026 && mkdir -p dist && bun run build -- --base /talks/codex/meetup-april-2026/

# Build Codex Build - June 20, 2026 (unlisted; reachable by URL only)
COPY talks/codex/build-june-2026/ ./codex-build-june-2026/
RUN cd codex-build-june-2026 && mkdir -p dist && bun run build -- --base /talks/codex/build-june-2026/

# Build Codex Community Meetup Vienna keynote - July 16, 2026 (unlisted; URL-only)
COPY talks/codex/meetup-july-2026/ ./codex-meetup-july-2026/
RUN cd codex-meetup-july-2026 && mkdir -p dist && bun run build -- --base /talks/codex/meetup-july-2026/

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
COPY --from=slidev-builds /app/codex-meetup-april-2026/dist /usr/share/nginx/html/talks/codex/meetup-april-2026
COPY --from=slidev-builds /app/codex-build-june-2026/dist /usr/share/nginx/html/talks/codex/build-june-2026
COPY --from=slidev-builds /app/codex-meetup-july-2026/dist /usr/share/nginx/html/talks/codex/meetup-july-2026

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
