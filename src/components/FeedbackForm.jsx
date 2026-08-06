import { useState } from "react";
import ErrorMessage from "./ErrorMessage";
import { useAuth } from "../lib/auth";
import { submitFeedback } from "../lib/api";
import { ui } from "../lib/theme";

const FeedbackForm = ({ chapterHash }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const handleRatingChange = (value) => {
    setRating(value);
    setStatus(null);
    setError(null);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
    setStatus(null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (rating === 0) {
      setError("Choose a rating before submitting feedback.");
      return;
    }

    setSubmitting(true);
    setStatus(null);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session expired. Please sign in again.");
      await submitFeedback(chapterHash, rating, comment, token);
      setRating(0);
      setComment("");
      setStatus("Thanks for the feedback.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not submit feedback.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pointer-events-auto fixed bottom-24 right-4 z-10 w-[calc(100%-2rem)] max-w-sm border-3 border-ink bg-paper p-4 text-ink sm:right-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <h2 className={ui.h3}>How did that read?</h2>
          <p className={`mt-1 ${ui.prose}`}>
            Rate the panel order and cuts for this chapter.
          </p>
        </div>
        <div>
          <span className={ui.eyebrow}>Rating</span>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={rating === value}
                className={`h-9 w-9 border-2 border-ink font-mono text-sm font-semibold transition ${
                  rating === value
                    ? "bg-ink text-paper"
                    : "bg-white text-ink hover:bg-marker"
                }`}
                onClick={() => handleRatingChange(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={`block ${ui.eyebrow}`} htmlFor="chapter-feedback-comment">
            Comment
          </label>
          <textarea
            id="chapter-feedback-comment"
            className="mt-2 block min-h-24 w-full border-3 border-ink bg-white px-3 py-2 text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none focus:ring-0"
            value={comment}
            onChange={handleCommentChange}
          />
        </div>
        {error && <ErrorMessage message={error} />}
        {status && (
          <p className="bg-marker px-3 py-2 text-sm font-medium text-ink">
            {status}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${ui.button}`}
        >
          {isSubmitting ? "Sending…" : "Send feedback"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
