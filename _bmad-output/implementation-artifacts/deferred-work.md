# Deferred Work

This file tracks issues identified during code reviews that are deferred to later stories or sprints.

## Deferred from: code review of story-1.1-initialize-expo-project (2026-04-23)

- **Empty API service directory with no base client** — API service directory is empty; axios and swr are installed but have no client setup. First network call will have no timeout, no auth header, and no error normalization. (Likely addressed in later stories)
- **No test script or test dependencies** — No test script or test dependencies despite 90%/80% coverage targets in sprint plan. (Story 1.3 handles testing infrastructure)
- **No ESLint, Prettier, or Husky** — No ESLint, Prettier, or Husky in devDependencies or scripts. (Story 1.2 handles development tooling)
