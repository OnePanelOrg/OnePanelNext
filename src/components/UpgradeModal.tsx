import { useEffect, useRef } from "react";
import { SignInButton, SignUpButton } from "../lib/auth";
import { ui } from "../lib/theme";

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
      className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        className="w-full max-w-md border-3 border-ink bg-paper"
      >
        <div className="flex items-start justify-between gap-4 bg-ink px-5 py-3">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            OnePanel Pro
          </p>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close upgrade dialog"
            disabled={isLoading}
            onClick={onClose}
            className="font-mono text-sm font-semibold text-white/70 transition hover:text-white"
          >
            Close
          </button>
        </div>
        <div className="p-6">
          <h2 id="upgrade-title" className={ui.h3}>
            This page is drawn to break the grid
          </h2>
          <p className={`mt-3 ${ui.prose}`}>
            Splash spreads, diagonal cuts, and panels inside panels are where
            Standard has to guess. Pro reads them the way they were drawn, for
            €4.99 per month. Cancel any time.
          </p>
          <div className="mt-6 grid gap-3">
            {isSignedIn ? (
              <button
                type="button"
                disabled={isLoading}
                onClick={onContinue}
                className={ui.button}
              >
                {isLoading ? "Opening checkout…" : "Continue to checkout"}
              </button>
            ) : (
              <>
                <SignUpButton forceRedirectUrl="/reader">
                  <button
                    type="button"
                    onClick={onAuthenticate}
                    className={ui.button}
                  >
                    Create account and continue
                  </button>
                </SignUpButton>
                <SignInButton forceRedirectUrl="/reader">
                  <button
                    type="button"
                    onClick={onAuthenticate}
                    className={ui.buttonGhost}
                  >
                    Sign in and continue
                  </button>
                </SignInButton>
              </>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className={`${ui.micro} py-1 underline hover:text-ink`}
            >
              Keep reading with Standard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
