# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/doctor-web-app/epic-2/story-2.1.spec.ts >> Story 2.1 - Doctor Login with OpenMRS Credentials >> Login fails with network error
- Location: tests/doctor-web-app/epic-2/story-2.1.spec.ts:38:7

# Error details

```
Error: page.evaluate: SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
    at UtilityScript.evaluate (<anonymous>:304:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```