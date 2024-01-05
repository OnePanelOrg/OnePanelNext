import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import ImageCanvas from "../../components/ImageCanvas";

export default function Page() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const url = `https://api.onepanel.app/v2/chapter/${router.query.hash}`;

    fetch(url, {
      mode: "cors",
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [router.isReady]);

  return <>{data && !isLoading && <ImageCanvas data={data}></ImageCanvas>}</>;
}
