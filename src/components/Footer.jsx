import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-5 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} OnePanel Reader.</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/spoiler-free-manga-reader"
            className="font-semibold text-gray-800 underline underline-offset-4 hover:text-gray-950"
          >
            How it works
          </Link>
          <Link
            href="/faq"
            className="font-semibold text-gray-800 underline underline-offset-4 hover:text-gray-950"
          >
            FAQ
          </Link>
          <a
            href="https://opchapters.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-800 underline underline-offset-4 hover:text-gray-950"
          >
            Find OP Chapters
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
