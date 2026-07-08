import { useState } from "react";

const InputForm = ({ childToParent, disabled = false }) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    void childToParent(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="url"
        required
        disabled={disabled}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste an https://opchapters.com chapter URL"
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
      />
      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-md bg-gray-950 px-4 py-3 font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {disabled ? "Loading chapter..." : "Load chapter"}
      </button>
    </form>
  );
};

export default InputForm;
