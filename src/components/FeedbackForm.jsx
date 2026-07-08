import { useState } from "react";
import ErrorMessage from "./ErrorMessage";
import { useAuth } from "../lib/auth";
import { submitFeedback } from "../lib/api";

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
    <div className="pointer-events-auto fixed bottom-24 right-4 z-10 w-[calc(100%-2rem)] max-w-sm rounded-lg bg-white p-4 text-gray-950 shadow-xl sm:right-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <h2 className="text-lg font-semibold">Feedback</h2>
          <p className="text-sm text-gray-600">
            How did this chapter reading feel?
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Rating</span>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={rating === value}
                className={`h-9 w-9 rounded-md text-sm font-semibold text-white ${
                  rating === value ? "bg-blue-600" : "bg-gray-300"
                }`}
                onClick={() => handleRatingChange(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="chapter-feedback-comment"
          >
            Comment
          </label>
          <textarea
            id="chapter-feedback-comment"
            className="mt-1 block min-h-24 w-full rounded-md border-gray-300 bg-gray-50 text-gray-950 focus:border-blue-500 focus:ring-blue-500"
            value={comment}
            onChange={handleCommentChange}
          />
        </div>
        {error && <ErrorMessage message={error} />}
        {status && <p className="text-sm font-medium text-green-700">{status}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
