import { type NextPage } from "next";
import Head from "next/head";
import Header from "../../components/Header";
import { SignUpPage } from "../../lib/auth";

const SignUp: NextPage = () => {
  return (
    <>
      <Head>
        <title>Sign up | OnePanel Reader</title>
        <meta
          name="description"
          content="Create a OnePanel Reader account to read manga one panel at a time."
        />
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex min-h-screen flex-col bg-[#f6f4ef] text-gray-950">
        <Header />
        <main className="flex flex-grow items-center justify-center px-4 py-12">
          <SignUpPage />
        </main>
      </div>
    </>
  );
};

export default SignUp;
