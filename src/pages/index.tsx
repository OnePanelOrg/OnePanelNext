import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import ImageCanvas from "../components/ImageCanvas";
import InputForm from "../components/InputForm";
import LoadingComponent from "../components/Loading";
import Header from "../components/Header";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  async function inputIsNotValid(chapter_url: string) {
    if (!chapter_url) {
      return true;
    }
    if (!chapter_url.includes("https://tcbscans.com/")) {
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
    const url = `https://api.onepanel.app/v2/chapter`;
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
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#64de9f] to-[#13aeae]">
        {/* todo: center canvas */}
        {!isLoading && !data && <Header></Header>}
        <div className="flex items-center justify-center">
          {!isLoading && !data && (
            <InputForm childToParent={postUrl}></InputForm>
          )}
          {isLoading && <LoadingComponent></LoadingComponent>}
          <div>
            {data && !isLoading && <ImageCanvas data={data}></ImageCanvas>}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
