import React, { use, useState, useEffect } from "react";

const FeedbackForm = ({ chapter_hash }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Handle form submission logic here
    const feedback = { rating, comment, chapter_hash };

    try {
      const response = await fetch("http://localhost:8000/v2/feedback", {
        mode: "cors",
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Show a success message to the user
      // alert("Feedback submitted successfully!");

      // Reset the form
      setRating(0);
      setComment("");
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  };

  return (
    <div
      className="m-3 mx-auto max-w-md overflow-hidden rounded-xl bg-white p-5 shadow-md md:max-w-2xl"
      style={{ position: "absolute", bottom: 200, right: 20 }}
    >
      <form onSubmit={handleSubmit}>
        <h1 className="mb-4 text-2xl font-bold">Feedback</h1>
        <div className="mb-4">
          <span className="text-gray-700">Rating:</span>
          <div className="mt-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`mx-1 rounded-md py-2 px-3 text-white ${
                  rating === value ? "bg-blue-600" : "bg-gray-300"
                }`}
                onClick={() => handleRatingChange(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">
            Comment:
            <textarea
              className="mt-1 block w-full rounded-md border-transparent bg-gray-100 focus:border-gray-500 focus:bg-white focus:ring-0"
              value={comment}
              onChange={handleCommentChange}
            />
          </label>
        </div>
        <button
          type="submit"
          key="submit"
          className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
