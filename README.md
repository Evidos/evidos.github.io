# Signhost Developer Docs Website

[![Build and Deploy](https://github.com/Evidos/evidos.github.io/actions/workflows/build.yml/badge.svg)](https://github.com/Evidos/evidos.github.io/actions/workflows/build.yml)

The official developer documentation for Entrust Signhost REST API.

🌐 **Live Site:** https://evidos.github.io/

## Setup

Install the dependencies:

```bash
bun install
```

## Get started

Start the dev server:

```bash
bun run dev
```

Build the website for production:

```bash
bun run build
```

Preview the production build locally:

```bash
bun run preview
```

## Type Checking & Linting

Check TypeScript types without emitting files:

```bash
bun run typecheck
```

Run all linters (includes TypeScript type checking, Biome linting, Markdown formatting, and OpenAPI linting):

```bash
bun run lint
```

Or run individual checks:

```bash
bun run typecheck    # TypeScript type checking
bun run lint:ts      # Biome TypeScript linting
bun run lint:md      # Prettier Markdown linting
bun run lint:openapi # Vacuum OpenAPI linting
```

## CI/CD Pipeline

This repository uses GitHub Actions for continuous integration and deployment:

- **Type Check**: Validates TypeScript types across the entire codebase
- **Lint**: Validates TypeScript code style, Markdown formatting, and OpenAPI specifications
- **Build**: Compiles the site using Rspress with Bun
- **Deploy**: Automatically deploys to GitHub Pages on push to `main` branch

The workflow runs on:

- Push to `main` or `doc-refresh` branches (lints, builds, and deploys)
- Pull requests to `main` or `doc-refresh` branches (lints and builds only)
- Manual workflow dispatch

### GitHub Pages Setup

To enable deployment, ensure GitHub Pages is configured in your repository settings:

1. Go to **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. The site will be deployed to `https://evidos.github.io/`
