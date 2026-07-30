import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  UserName,
  useAuth,
} from "../lib/auth";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  createBillingPortal,
  createCheckout,
  getSubscription,
} from "../lib/api";
import { trackMarketingEvent } from "../lib/analytics";

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
        className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading
          ? "Checking billing…"
          : subscription?.active
            ? "Manage subscription"
            : "Upgrade to Pro"}
      </button>
      {error && (
        <div className="flex items-center gap-2" role="alert">
          <span className="max-w-64 text-right text-xs font-medium text-red-700">
            {error}
          </span>
          <button
            type="button"
            onClick={() => void loadSubscription()}
            className="text-xs font-semibold text-red-800 underline"
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
    <header className="border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold text-gray-950 sm:text-2xl"
          >
            OnePanel Reader
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-gray-700 sm:flex">
            <Link
              href="/spoiler-free-manga-reader"
              className="hover:text-gray-950"
            >
              How it works
            </Link>
            <Link href="/faq" className="hover:text-gray-950">
              FAQ
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton>
              <button className="rounded-md border border-gray-300 px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-md bg-gray-950 px-3 py-2 font-semibold text-white hover:bg-gray-800">
                Create account
              </button>
            </SignUpButton>
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
