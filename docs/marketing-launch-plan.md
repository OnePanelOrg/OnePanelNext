# OnePanel Reader marketing launch plan

## Positioning

OnePanel Reader is for manga readers who want every reveal to land cleanly.
The core promise is simple: paste an OP Chapters link and read the chapter one
panel at a time without accidentally seeing the rest of the page.

Primary offer:

- OnePanel Pro
- €4.99 per month
- Unlimited access while subscribed
- Cancel any time

## Launch goals

- Convert the existing email list into the first wave of paid subscribers.
- Make the new version feel like a meaningful upgrade, not just a relaunch.
- Build a repeatable short-form content loop that demonstrates the product in
  under 10 seconds.
- Learn which channel brings paid subscribers before scaling ad spend.

## Email campaign

Send three emails to the existing list.

- [x] Email 1: launch
- [ ] Email 2: use case
- [ ] Email 3: last call for launch week

Launch send status, July 7, 2026:

- Email 1 was sent through Loops with subject
  `The new OnePanel Reader is live`.
- Preview email was verified before the audience send.
- Loops completed 1,000 sends. The workspace is still over the free-plan
  contact cap, so the full 1,126-contact subscribed audience could not be sent.
- Loops reported 12 hard bounces and automatically marked those contacts as
  unsubscribed, reducing the subscribed audience to 1,114 contacts.

### Email 1: launch

Subject options:

- OnePanel Reader is back, and it is much better
- Read OP Chapters one panel at a time
- The new OnePanel Reader is live

Body:

Hi,

You left your email because you were interested in OnePanel Reader. The new
version is now live.

It is faster, cleaner, and built around the thing that made people want it in
the first place: paste an OP Chapters link and read the chapter one panel at a
time, without accidentally spoiling the next page or reveal.

OnePanel Pro is €4.99 per month and includes unlimited access while your
subscription is active. You can cancel any time.

Start reading:
https://onepanel.app

Thanks for being early.

The OnePanel Reader team

### Email 2: use case

Send 48 hours after Email 1 to people who did not subscribe.

Subject options:

- The problem OnePanel Reader solves
- Stop seeing the next manga reveal too early

Body:

Hi,

The best manga moments depend on timing. Full-page chapter scans can show too
much at once, especially on desktop or tablet.

OnePanel Reader keeps the chapter focused on the current panel, so you move
through the scene at the intended pace.

Try OnePanel Pro for €4.99 per month:
https://onepanel.app

### Email 3: last call for launch week

Send 5-7 days after Email 1.

Subject options:

- Last launch-week reminder
- Want to try the new reader?

Body:

Hi,

Quick final reminder: the new OnePanel Reader is live.

If you read OP Chapters and want a cleaner, spoiler-safe panel-by-panel flow,
you can subscribe here:

https://onepanel.app

It is €4.99 per month, with billing handled by Stripe.

Thanks again for checking it out.

## Short-form content

Post 2-3 times per day for the first 14 days, then keep the best-performing
format as a daily post.

Format ideas:

- Screen recording: paste OP Chapters URL, load reader, move panel by panel.
- Split screen: normal full page versus OnePanel Reader.
- Hook: "I built this because manga pages kept spoiling the next reveal."
- Hook: "This makes OP Chapters feel like a proper guided reader."
- Hook: "If you read manga on desktop, this fixes one annoying problem."

Caption template:

Read OP Chapters one panel at a time. OnePanel Reader is live now for €4.99/mo.

Channels:

- TikTok
- Instagram Reels
- YouTube Shorts
- X
- Reddit communities where self-promotion is allowed
- Discord servers where promotion is explicitly allowed

## Paid acquisition

Do not scale ads until conversion tracking is confirmed.

Week 1:

- Install analytics and Stripe conversion tracking.
- Create one landing-page conversion event for sign-up.
- Create one purchase conversion event for completed subscription.
- Run a small retargeting campaign only for site visitors who did not subscribe.

Week 2:

- Test three video ads from the best organic short-form posts.
- Start with low daily budgets.
- Pause any ad that does not produce sign-ups after meaningful spend.

Useful audiences:

- Visitors who reached the homepage but did not subscribe.
- People interested in manga, anime, manga readers, and One Piece.
- Lookalike audiences after enough paying subscribers exist.

## Community launch

Prepare one honest founder-style post:

Title:

I built a panel-by-panel reader for OP Chapters

Body:

I kept running into the same problem when reading manga online: full pages often
show the next reveal before I am ready for it. I built OnePanel Reader to paste
an OP Chapters link and read the chapter one panel at a time.

The new version is live, faster than the prototype, and costs €4.99/month.
Feedback is welcome, especially from people who read on desktop or tablet.

## Metrics to review every week

- Email open rate
- Email click rate
- Visitor to account conversion
- Account to paid conversion
- Checkout abandonment
- Monthly recurring revenue
- Subscriber churn
- Short-form views to site visits
- Paid ad cost per subscriber

## Product improvements that support marketing

- Add a public demo chapter so signed-out visitors can feel the product before
  paying.
- Add referral codes for early subscribers.
- Add a yearly plan once monthly conversion is proven.
- Add simple testimonials from early users.
- Add analytics events for chapter URL submitted, checkout started, and billing
  portal opened. Checkout completion should be tracked by the API or Stripe
  webhook because the frontend cannot reliably observe completed checkout.
