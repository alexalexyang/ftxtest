import Head from "next/head";
import type { NextPage } from "next";

const PageHead: NextPage = () => {
  return (
    <Head>
      <title>Bauhinia</title>
      <meta
        name="A whisper in the wind"
        content="The sound of a mote in a howl"
      />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default PageHead;
