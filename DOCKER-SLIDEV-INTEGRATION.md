# Docker Slidev Integration Documentation

## Current Status
The main Astro site builds and deploys successfully. The Slidev presentations have build issues that need to be resolved.

## Issue
The Slidev presentations in `talks/vienna-ai-engineering/` fail to build due to an esbuild version mismatch:
- Error: "Host version "0.25.9" does not match binary version "0.25.10""
- This occurs with both bun and npm package managers
- The issue is related to the slidev-theme-penguin theme's vite.config.ts

## Architecture Design
The system is designed to:
1. Build multiple Slidev presentations as static sites
2. Build the main Astro site
3. Serve everything through nginx with proper routing

### URL Structure
- `/` - Main Astro site
- `/talks` - Talks hub page (QR code landing)
- `/talks/vienna-ai-engineering/from-zero-to-backlog/` - First presentation
- `/talks/vienna-ai-engineering/from-backlog-to-success/` - Second presentation

## Files Created
1. **nginx.conf** - Routes requests to appropriate paths
2. **Dockerfile.with-slidev** - Multi-stage build (currently non-functional due to esbuild issue)
3. **Dockerfile** - Simple working version for Astro only

## Solution Options

### Option 1: Fix esbuild Version
- Clear node_modules and reinstall with locked versions
- Ensure esbuild versions match across all dependencies
- May require updating slidev-theme-penguin

### Option 2: Pre-build Slidev Locally
- Build Slidev presentations locally
- Commit the dist folders to the repository
- Copy pre-built files in Docker

### Option 3: Use Different Build Tool
- Switch from bun to pnpm or yarn
- Use Node.js 18 instead of 20
- Potentially use a different Slidev theme

### Option 4: Separate Deployments
- Deploy Slidev presentations separately
- Use subdomains or different paths
- Link from main site

## Next Steps
1. Test Slidev builds locally with different Node versions
2. Check if slidev-theme-penguin has updates
3. Consider pre-building as a temporary solution
4. Update Dockerfile once build issues are resolved

## How to Add New Talks (Once Working)
1. Create the talk folder: `talks/conference-name/talk-title/`
2. Add a build stage in Dockerfile.with-slidev
3. Add nginx location block in nginx.conf
4. Update the talks page with the new URL
5. Rebuild and deploy the Docker image

## Current Workaround
The main site deploys successfully without the Slidev presentations. The talks page shows "Slides coming soon" for presentations without URLs.