import { useState } from "react";

const InputForm = ({ childToParent, disabled = false }) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    void childToParent(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="url"
        required
        disabled={disabled}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter TCB Scans URL"
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-[#64de9f] focus:outline-none focus:ring-2 focus:ring-[#64de9f] dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-[#64de9f]"
      />
      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
      >
        Load Chapter
      </button>
    </form>
  );
};

export default InputForm;
