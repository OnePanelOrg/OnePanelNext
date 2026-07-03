# OnePanel Reader

OnePanel is a Next.js reader that reveals a manga chapter one panel at a time,
avoiding spoilers from the rest of the page.

## Requirements

- Node.js 18.18 or newer
- npm
- A compatible OnePanel API

## Local development

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy the environment template and configure the API:

   ```sh
   cp .env.example .env.local
   ```

   `NEXT_PUBLIC_API_URL` must be the API origin without the `/v2/chapter`
   suffix, for example `http://localhost:8000`. When it is not set, the app
   uses the deployed Railway API.

3. Start the application:

   ```sh
   npm run dev
   ```

## Commands

- `npm run dev` — start the development server
- `npm run test` — run navigation unit tests
- `npm run lint` — run ESLint with zero warnings allowed
- `npm run build` — create a production build
- `npm start` — serve the production build

## Reader behavior

- Navigation stops at the first and last panel instead of wrapping or producing
  invalid page indexes.
- Moving to a previous page selects that page's last panel.
- Left and right arrow keys navigate panels.
- Images load independently. A failed image displays an error for that page
  without blocking the rest of the chapter.
- API calls have a two-minute timeout, validate HTTP status and response shape,
  and expose retryable errors to the user.
- Only HTTPS URLs whose hostname is exactly `opchapters.com` are accepted.

## Configuration and API contract

The browser calls:

- `POST /v2/chapter` with `{ "chapter_url": "..." }`
- `GET /v2/chapter/:hash`

The POST response must contain a non-empty `chapter_hash`. A chapter must contain
at least one page; every page must contain an image URL and at least one panel
with a coordinate path.

Because `NEXT_PUBLIC_API_URL` is browser-visible, it must not contain secrets.
CORS response headers must be configured by the API.

## Authentication

Authentication is intentionally deferred to the next iteration. The previous
Clerk integration was removed because its middleware matched only the already
public home page and therefore protected no application capability.

Before adding authentication back, define the protected resource boundary. At a
minimum, authorization must be enforced by the API for chapter creation and any
private chapter retrieval; frontend route guards alone are not a security
boundary.

## Maintenance

The project currently uses the Pages Router on Next.js 15 to remain compatible
with Node.js 18. A future Next.js 16 upgrade first requires Node.js 20.9 or
newer. Run `npm audit` when updating dependencies and commit `package-lock.json`
with dependency changes.
