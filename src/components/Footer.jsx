import Link from "next/link";
import { ui } from "../lib/theme";

const footerLink = "hover:text-ink hover:underline";

const Footer = () => {
  return (
    <footer className="mt-auto border-t-3 border-ink bg-paper">
      <div
        className={`${ui.container} flex flex-col gap-4 py-8 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/60 sm:flex-row sm:items-center sm:justify-between`}
      >
        <p>&copy; {new Date().getFullYear()} OnePanel Reader</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/spoiler-free-manga-reader" className={footerLink}>
            How it works
          </Link>
          <Link href="/faq" className={footerLink}>
            FAQ
          </Link>
          <Link href="/#start-reader" className={footerLink}>
            Upload a file
          </Link>
          <a
            href="https://opchapters.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLink}
          >
            OP Chapters
          </a>
          <a
            href="https://tcbonepiecechapters.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLink}
          >
            TCB Chapters
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
