import { type NextPage } from "next";
import Head from "next/head";
import Header from "../../components/Header";
import { SignInPage } from "../../lib/auth";

const SignIn: NextPage = () => {
  return (
    <>
      <Head>
        <title>Sign in | OnePanel Reader</title>
        <meta
          name="description"
          content="Sign in to OnePanel Reader to open your spoiler-safe manga reader."
        />
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex min-h-screen flex-col bg-[#f6f4ef] text-gray-950">
        <Header />
        <main className="flex flex-grow items-center justify-center px-4 py-12">
          <SignInPage />
        </main>
      </div>
    </>
  );
};

export default SignIn;
