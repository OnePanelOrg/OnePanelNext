# OnePanel production cutover

## Verified current state

- `onepanel.app` is served by Netlify.
- `onepanel.app` and `www.onepanel.app` resolve to Netlify IPs:
  - `63.176.8.218`
  - `35.157.26.135`
- Netlify project: `onepanel`
- Netlify production domain: `onepanel.app`
- Current Netlify Git repository: `github.com/OnePanelOrg/LandingPage`
- Current Netlify production branch: `main`
- Current Netlify project has no environment variables configured.
- Current Netlify build settings are mostly unset and use Node.js 16.x.
- Loops workspace: `OnePanel`
- Loops audience count visible on July 7, 2026: 1,126 contacts.
- Target host: existing Vercel project.
- Checked Vercel team `vincenzocassaro1's projects` on July 7, 2026:
  - `onepanel.app` is not listed under team Domains.
  - No visible project or link on the dashboard contains `onepanel`.
  - Visible projects include `festadelmonte`, `homeoffice`,
    `v0-beach-reservation-app`, and `v0-s3-image-viewer`.

## Migration target

Deploy the new `OnePanelNext` frontend on the existing Vercel project. Retire
the Netlify landing after Vercel is serving the new app and the domain cutover
is verified.

The exact Vercel project/team still needs to be identified. The currently
visible Vercel team does not show a OnePanel project or `onepanel.app` domain.

Keep the old Netlify project `onepanel` connected to:

```text
github.com/OnePanelOrg/LandingPage
```

until the Vercel deploy is verified. This keeps rollback simple during cutover.

## Required Vercel environment variables

Set these before the first production deploy:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<real Clerk publishable key>
CLERK_SECRET_KEY=<real Clerk secret key>
NEXT_PUBLIC_API_URL=https://manga-panel-extractor-production.up.railway.app
```

`CLERK_SECRET_KEY` is required even on Preview: Clerk's SDK auto-detects
`*.vercel.app` preview domains running a live/production publishable key and
routes Frontend API calls through `/__clerk` on the same origin instead of
talking to Clerk directly (a preview URL can never be added to Clerk's
allowed-domains list ahead of time). `src/pages/api/__clerk/[...path].ts`
implements that proxy and needs the secret key to authenticate the forwarded
requests to Clerk.

`NEXT_PUBLIC_API_URL` has a default in the app, but setting it explicitly in
Vercel makes the production dependency clear.

## Cutover sequence

1. Push the latest `main` commit from `OnePanelNext` to GitHub.
2. Open the existing Vercel OnePanel project, or identify the correct Vercel
   team if it is not `vincenzocassaro1's projects`.
3. In Vercel, confirm the existing OnePanel project is linked to
   `OnePanelOrg/OnePanelNext`, or reconnect it to that repository.
4. Confirm the production branch is `main`.
5. Add the required Vercel environment variables for Production and Preview.
6. Trigger a production deploy from `main`.
7. Verify the Vercel deployment URL serves the new reader/marketing homepage.
8. Move `onepanel.app` and `www.onepanel.app` from Netlify to the existing
   Vercel project.
9. Verify `https://onepanel.app` serves the new reader/marketing homepage.
10. Verify `https://www.onepanel.app` redirects or serves consistently.
11. Keep the old Netlify project available for rollback until the new deploy is
    verified.

## DNS notes

Netlify currently owns the live response for `onepanel.app`. Before switching
DNS, copy any relevant DNS records from Netlify if the Netlify DNS zone contains
mail, verification, or third-party records.

Only the web records for `onepanel.app` and `www.onepanel.app` should move to
Vercel. Do not remove unrelated MX, TXT, CNAME, or verification records.

## Loops launch sequence

1. [x] Create a campaign draft using `docs/marketing-launch-plan.md`.
2. [x] Send a test email first.
3. [x] Verify all links point to `https://onepanel.app`.
4. [x] Send to the audience after the production deploy is verified.

Email 1 was sent through Loops on July 7, 2026. Loops completed 1,000 sends,
reported 12 hard bounces, and automatically marked those bounced contacts as
unsubscribed. The workspace still exceeds the Loops free-plan cap with 1,114
subscribed contacts, so future sends require trimming the audience or upgrading
Loops.
