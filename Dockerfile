# ─── Base Image ───────────────────────────────────────────────────────────────
# We use Playwright's official base image
# It comes with all OS dependencies pre-installed
# Without this image you would need to manually install 20+ Ubuntu packages
# for Chromium to work (libglib, libnss, libatk, libcups, libdrm etc.)
#
# mcr.microsoft.com = Microsoft Container Registry
# playwright:v1.57.0-jammy = exact Playwright version on Ubuntu 22.04 (jammy)
# Pinning the version ensures reproducible builds

FROM mcr.microsoft.com/playwright:v1.60.0-jammy

# ─── Metadata ─────────────────────────────────────────────────────────────────
LABEL maintainer="Om_gutty"
LABEL description="Enterprise Playwright TypeScript Framework"
LABEL version="1.0.0"

# ─── Working Directory ────────────────────────────────────────────────────────
# All subsequent commands run from /app
# This is the standard convention for Node.js apps in Docker
WORKDIR /app

# ─── Copy dependency files first ──────────────────────────────────────────────
# WHY copy package files before source code?
# Docker builds in layers. Each instruction is a cached layer.
# If we copy everything at once, any code change invalidates the npm install layer.
# By copying package files first, npm install only re-runs when
# package.json or package-lock.json changes — not on every code change.
# This makes rebuilds much faster.

COPY package.json package-lock.json ./

# ─── Install dependencies ─────────────────────────────────────────────────────
# --ci flag = same as npm ci but for Docker context
# Uses package-lock.json exactly for reproducible installs
# --ignore-scripts prevents potentially dangerous postinstall scripts

RUN npm ci

# ─── Copy source code ─────────────────────────────────────────────────────────
# Now copy everything else
# .dockerignore prevents node_modules, .git, test-results from being copied
# (we create .dockerignore next)

COPY . .

# ─── Environment variables ────────────────────────────────────────────────────
# These are DEFAULT values inside the container
# They can be overridden at runtime:
# docker run -e BASE_URL=https://staging.example.com my-framework

ENV NODE_ENV=test
ENV CI=true
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV IGNORE_HTTPS_ERRORS=true

# ─── Create output directories ────────────────────────────────────────────────
# Ensure report directories exist with correct permissions
# These will be mounted as volumes so reports are accessible outside container

RUN mkdir -p test-results playwright-report tta-report

# ─── Default command ──────────────────────────────────────────────────────────
# This runs when you do: docker run my-framework
# Can be overridden: docker run my-framework npx playwright test --grep @Smoke

CMD ["npx", "playwright", "test", "--project=chromium"]