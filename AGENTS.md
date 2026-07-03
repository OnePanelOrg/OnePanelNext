# Repository guidance

## Scope

This repository contains the Next.js frontend. The OnePanel API is a separate
service and is configured through `NEXT_PUBLIC_API_URL`.

## Required checks

Run these before handing off a change:

```sh
npm run test
npm run lint
npm run build
npm audit
```

Do not suppress lint, type, build, or audit failures without documenting the
reason.

## Implementation rules

- Keep API access in `src/lib/api.ts`.
- Validate external responses before passing them to components.
- Every asynchronous user flow must terminate in success or a visible error and
  must clear its loading state in `finally`.
- Preserve reader page and panel bounds. Add navigation cases to
  `test/reader-state.test.mjs` when changing navigation.
- Handle both image success and image failure; one failed page must not block a
  chapter.
- Never hard-code service origins or secrets. Browser-visible configuration
  must use a validated `NEXT_PUBLIC_` variable.
- Do not add frontend-only authentication as a security boundary. Coordinate
  protected routes with server-side API authorization.
