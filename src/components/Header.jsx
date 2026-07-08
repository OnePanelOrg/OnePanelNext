import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  UserName,
} from "../lib/auth";
import Link from "next/link";

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-gray-950 sm:text-2xl">
          OnePanel Reader
        </Link>
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton>
              <button className="rounded-md border border-gray-300 px-3 py-2 font-semibold text-gray-800 hover:bg-gray-100">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-md bg-gray-950 px-3 py-2 font-semibold text-white hover:bg-gray-800">
                Create account
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserName />
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
};

export default Header;
