import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import ImageCanvas from "../components/ImageCanvas";
import InputForm from "../components/InputForm";
import LoadingComponent from "../components/Loading";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  async function inputIsNotValid(chapter_url: string) {
    if (!chapter_url) {
      return true;
    }
    if (!chapter_url.includes("https://tcbscans.me/")) {
      return true;
    }
    return false;
  }

  async function postUrl(chapter_url: string) {
    if (await inputIsNotValid(chapter_url)) {
      // todo: show error
      console.error("invalid input");
      return;
    }
    setLoading(true);

    // const url = `${process.env.SERVER_URL}:${process.env.SERVER_PORT}/chapter`
    const url = `https://api2.onepanel.app/v2/chapter`;
    // const url = `http://localhost:8000/v2/chapter`;

    fetch(url, {
      mode: "cors",
      method: "POST",
      body: JSON.stringify({ chapter_url: chapter_url }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // setData(data);
        setLoading(false);
        router.push(`/chapter/${data["chapter_hash"]}`);
      });
    // .catch(rejected => {
    //     console.log(rejected);
    // });
  }

  async function dummy_postUrl() {
    console.log("dummy fetching");
    setLoading(true);

    fetch("output.json")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }

  return (
    <>
      <Head>
        <title>OnePanel Reader</title>
        <meta name="description" content="Read manga chapters in one seamless panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#64de9f] to-[#13aeae] text-gray-900">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-full">
            {!isLoading && !data && (
              <div className="w-full max-w-md">
                <h1 className="text-4xl font-bold mb-6 text-center text-white">Welcome to OnePanel Reader</h1>
                <p className="text-center mb-8 text-gray-900 dark:text-white">
                  Enter a <a href="https://tcbscans.me" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 underline font-semibold">TCB Scans</a> URL to get started
                </p>
                <InputForm childToParent={postUrl} />
              </div>
            )}
            {isLoading && <LoadingComponent />}
            {data && !isLoading && <ImageCanvas data={data} />}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
