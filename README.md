# OnePanel Reader

OnePanel is a Next.js reader that reveals a manga chapter one panel at a time,
avoiding spoilers from the rest of the page.

Readers can paste a chapter URL or upload one CBZ, CBR, ZIP, RAR, or PDF file.
They can also upload multiple page images; filenames determine page order.

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

## Marketing analytics

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to a GA4 measurement ID, for example
`G-XXXXXXXXXX`, to load Google Analytics and emit launch funnel events:

- `mode_selected`
- `chapter_url_submitted`
- `chapter_created`
- `chapter_upload_started`
- `chapter_upload_created`
- `upgrade_displayed`
- `authentication_continuation`
- `checkout_continuation`
- `checkout_started`
- `checkout_redirect_created`
- `billing_portal_opened`
- `billing_portal_redirect_created`

Events include only mode, continuation stage, sign-in state, and UI source.
Chapter URLs, hashes, image paths, and chapter content are never included.
Subscription completion should be tracked by the API or Stripe webhook, because
the frontend cannot reliably observe completed checkout after the user leaves
the site.

## Reader behavior

- Navigation stops at the first and last panel instead of wrapping or producing
  invalid page indexes.
- Moving to a previous page selects that page's last panel.
- Left and right arrow keys navigate panels.
- Images load independently. A failed image displays an error for that page
  without blocking the rest of the chapter.
- API calls have a two-minute timeout, validate HTTP status and response shape,
  and expose retryable errors to the user.
- Standard chapters can be created and read without an account.
- GPT-5.6 Layout creation requires OnePanel Pro. Its results can be read by any
  signed-in account.
- HTTP(S) chapter URLs from any source are accepted. Bare domains,
  protocol-relative links, angle-bracket links, and Markdown links are
  normalized before submission; the API determines whether it can process the
  source.

## Configuration and API contract

The browser calls the same-origin `/api/onepanel/*` rewrite, which forwards to
`NEXT_PUBLIC_API_URL`:

- `POST /v2/chapter` with
  `{ "chapter_url": "...", "segmentation_mode": "standard" }`
- `POST /v2/chapter/upload` as multipart form data with one comic container or
  multiple page images
- `GET /v2/chapter/:hash`

Large uploads go directly to `NEXT_PUBLIC_API_URL` instead of traversing the
Next.js proxy. Uploaded page data remains only in the current browser runtime;
the API deletes uploaded, extracted, and normalized files after analysis and
caches only layout JSON. Refreshing an uploaded chapter therefore requires
re-uploading it, while identical content can reuse the cached analysis.
Next.js rewrite, so the API must allow the frontend origin through CORS.

The POST response must contain a non-empty `chapter_hash`. A chapter must contain
at least one page; every page must contain an image URL and at least one panel
with a coordinate path.

`segmentation_mode` is either `standard` or `gpt-5.6-layout`; Standard is the
backward-compatible default. Provider model identifiers are configured only on
the API and are never accepted from the browser. The API returns stable
`sign_in_required` and `subscription_required` error codes for access failures.

Because `NEXT_PUBLIC_API_URL` is used by the frontend deployment, it must not
contain secrets.

## Authentication and billing

Clerk provides browser authentication. Chapter requests include the current
Clerk token when one is available; billing requests always require it. The API
is the authorization boundary: Standard creation and retrieval are public,
GPT-5.6 Layout creation requires an active Pro subscription, and GPT-5.6 Layout
retrieval requires any valid signed-in account.

Stripe Checkout sells one €4.99 EUR monthly subscription with no free trial.
Stripe's Customer Portal handles cancellation and payment-method management.
The API, not frontend visibility, is the authorization boundary.

When a signed-out or free user selects GPT-5.6 Layout, the browser stores only a
versioned URL, mode, and continuation stage in `sessionStorage`. The record
survives authentication and Checkout within that tab, is strictly validated
before use, and is cleared after successful chapter creation. Returning from
Checkout restores the composer but never submits automatically.

Deploy the compatible API before this frontend so anonymous Standard requests
and mode-specific access errors are available when the UI launches.

## Maintenance

The project currently uses the Pages Router on Next.js 15 and targets Node.js
24 LTS. Run `npm audit` when updating dependencies and commit
`package-lock.json` with dependency changes.
