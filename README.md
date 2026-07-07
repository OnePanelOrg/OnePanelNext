# OnePanel Reader

OnePanel is a Next.js reader that reveals a manga chapter one panel at a time,
avoiding spoilers from the rest of the page.

## Requirements

- Node.js 24 LTS
- npm
- A compatible OnePanel API

## Local development

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy the environment template and configure the API and Clerk:

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

The browser calls the same-origin `/api/onepanel/*` rewrite, which forwards to
`NEXT_PUBLIC_API_URL`:

- `POST /v2/chapter` with `{ "chapter_url": "..." }`
- `GET /v2/chapter/:hash`

The POST response must contain a non-empty `chapter_hash`. A chapter must contain
at least one page; every page must contain an image URL and at least one panel
with a coordinate path.

Because `NEXT_PUBLIC_API_URL` is used by the frontend deployment, it must not
contain secrets.

## Authentication and billing

Clerk provides browser authentication. The frontend sends the current Clerk
session token to the API as a bearer token for every chapter and billing
request. The API validates that token and enforces an active Stripe subscription
for chapter creation and retrieval.

Stripe Checkout sells one €4.99 EUR monthly subscription with no free trial.
Stripe's Customer Portal handles cancellation and payment-method management.
The API, not frontend visibility, is the authorization boundary.

## Maintenance

The project currently uses the Pages Router on Next.js 15 and targets Node.js
24 LTS. Run `npm audit` when updating dependencies and commit
`package-lock.json` with dependency changes.
