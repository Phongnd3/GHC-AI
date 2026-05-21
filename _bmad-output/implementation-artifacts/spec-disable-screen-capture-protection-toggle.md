---
title: 'Disable Screen Capture Protection Toggle'
type: 'feature'
created: '2026-05-21'
status: 'done'
route: 'one-shot'
---

# Disable Screen Capture Protection Toggle

## Intent

**Problem:** Story 2.5 added FLAG_SECURE screen capture protection to all authenticated screens, but demo presentations need to allow screenshots without modifying source code or rebuilding.

**Approach:** Add an `ENABLE_SCREEN_CAPTURE_PROTECTION` environment variable (default `true`) that gates the `preventScreenCaptureAsync` call, so setting it to `false` at build time disables the protection for demo builds.

## Suggested Review Order

- Conditional guard added to the screen protector call — the core change
  [`_layout.tsx:26`](../../ghc-ai-doctor-app/src/app/(auth)/_layout.tsx#L26)

- Maps the string env var to a boolean in Expo's extra config layer
  [`app.config.js:56`](../../ghc-ai-doctor-app/app.config.js#L56)

- Exports the config value as a typed constant
  [`env.ts:45`](../../ghc-ai-doctor-app/src/config/env.ts#L45)

- Adds the field to the config interface
  [`env.ts:10`](../../ghc-ai-doctor-app/src/config/env.ts#L10)

- Documents the env var for developers
  [`.env.example:19`](../../ghc-ai-doctor-app/.env.example#L19)

- Sets the default for the dev environment
  [`.env.development:9`](../../ghc-ai-doctor-app/.env.development#L9)
