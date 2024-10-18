import Link from "next/link";
import { useState } from "react";

export default function InputForm({ childToParent }) {
  let [chapterValue, setChapterValue] = useState("");
  return (
    <>
      <div className="rounded-md bg-white p-20 shadow-sm">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Insert the{" "}
              <Link
                href="https://tcb-backup.bihar-mirchi.com/"
                className="bg:blue"
              >
                TCBScans
              </Link>{" "}
              link of the manga chapter you would like to read
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-12">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Chapter
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      autoComplete="username"
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="chapter url
                      onChange={(event) => setChapterValue(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            onClick={() => childToParent(chapterValue)}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go!
          </button>
        </div>
      </div>
    </>
  );
}
