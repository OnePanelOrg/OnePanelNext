import { Show, SignInButton, UserButton, UserName, useAuth } from "../lib/auth";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  createBillingPortal,
  createCheckout,
  getSubscription,
} from "../lib/api";
import { trackMarketingEvent } from "../lib/analytics";
import { ui } from "../lib/theme";

const navLink =
  "font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink hover:underline";

function SubscriptionManagement() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const loadSubscription = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setSubscription(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token)
        throw new Error("Your session expired. Please sign in again.");
      setSubscription(await getSubscription(token));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not check your subscription.",
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  async function openBilling() {
    setLoading(true);
    setError(null);
    const eventName = subscription?.active
      ? "billing_portal_opened"
      : "checkout_started";
    trackMarketingEvent(eventName, { source: "header" });
    try {
      const token = await getToken();
      if (!token)
        throw new Error("Your session expired. Please sign in again.");
      const url = subscription?.active
        ? await createBillingPortal(token)
        : await createCheckout(token);
      trackMarketingEvent(
        subscription?.active
          ? "billing_portal_redirect_created"
          : "checkout_redirect_created",
        { source: "header" },
      );
      window.location.assign(url);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not open billing.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isLoading || !subscription}
        onClick={() => void openBilling()}
        className={ui.buttonSmall}
      >
        {isLoading
          ? "Checking billing"
          : subscription?.active
            ? "Manage plan"
            : "Upgrade to Pro"}
      </button>
      {error && (
        <div className="flex items-center gap-2" role="alert">
          <span className="max-w-64 bg-marker px-2 py-1 text-right text-[11px] font-medium text-ink">
            {error}
          </span>
          <button
            type="button"
            onClick={() => void loadSubscription()}
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

const Header = () => {
  return (
    <header className="border-b-3 border-ink bg-paper">
      <div
        className={`${ui.container} flex items-center justify-between gap-6 py-4`}
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-display text-xl font-extrabold tracking-[-0.03em] text-ink"
          >
            ONE<span className="bg-ink px-1 text-paper">PANEL</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link href="/spoiler-free-manga-reader" className={navLink}>
              How it works
            </Link>
            <Link href="/faq" className={navLink}>
              FAQ
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <Link
              href="/#start-reader"
              className="bg-ink px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-ink-soft"
            >
              Read free
            </Link>
            <SignInButton>
              <button className={navLink}>Sign in</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <SubscriptionManagement />
            <UserName />
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
};

export default Header;
