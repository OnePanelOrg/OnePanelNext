import { useEffect, useRef } from "react";
import { SignInButton, SignUpButton } from "../lib/auth";

type Props = {
  isSignedIn: boolean;
  isLoading: boolean;
  onClose: () => void;
  onContinue: () => void;
  onAuthenticate: () => void;
};

export default function UpgradeModal({
  isSignedIn,
  isLoading,
  onClose,
  onContinue,
  onAuthenticate,
}: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isLoading, onClose]);

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 grid place-items-center bg-gray-950/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-700">OnePanel Pro</p>
            <h2 id="upgrade-title" className="mt-1 text-2xl font-black">
              Unlock GPT-5.6 Layout
            </h2>
          </div>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close upgrade dialog"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
          >
            ×
          </button>
        </div>
        <p className="mt-3 text-gray-700">
          Get better panel detection for complex page layouts for €4.99 / month.
          Cancel any time.
        </p>
        <div className="mt-6 grid gap-3">
          {isSignedIn ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={onContinue}
              className="rounded-lg bg-gray-950 px-4 py-3 font-bold text-white disabled:bg-gray-400"
            >
              {isLoading ? "Opening Checkout…" : "Continue to Checkout"}
            </button>
          ) : (
            <>
              <SignUpButton forceRedirectUrl="/reader">
                <button
                  type="button"
                  onClick={onAuthenticate}
                  className="rounded-lg bg-gray-950 px-4 py-3 font-bold text-white"
                >
                  Create account and continue
                </button>
              </SignUpButton>
              <SignInButton forceRedirectUrl="/reader">
                <button
                  type="button"
                  onClick={onAuthenticate}
                  className="rounded-lg border border-gray-300 px-4 py-3 font-bold text-gray-900"
                >
                  Sign in and continue
                </button>
              </SignInButton>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
