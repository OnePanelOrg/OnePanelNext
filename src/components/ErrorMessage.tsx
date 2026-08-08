import { ui } from "../lib/theme";

type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="border-3 border-ink bg-marker p-5 text-ink">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/60">
        Something stopped
      </p>
      <p className="mt-2 font-medium leading-relaxed">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`mt-4 ${ui.button}`}>
          Try again
        </button>
      )}
    </div>
  );
}
