import {
  ClerkProvider, SignedIn,
  SignedOut,
  SignInButton,
  UserButton
} from '@clerk/nextjs';
import { type AppType } from "next/dist/shared/lib/utils";
import Link from "next/link";


function Header() {
  return (
    <header
      style={{ display: "flex", justifyContent: "space-between", padding: 20 }}
    >
      <h1><Link
        className=""
        href={"/"}
      >
        OnePanel
      </Link></h1>
      <SignedIn>
        {/* Mount the UserButton component */}
        <UserButton />
      </SignedIn>
      <SignedOut>
        {/* Signed out users get sign in button */}
        <SignInButton />
      </SignedOut>
    </header>
  );
}

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps} >
      <Header />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default MyApp;
