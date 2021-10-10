import { Main } from "../styles/main";
import type { NextPage } from "next";
import PageHead from "../components/page-head";
import dynamic from "next/dynamic";

const WsCharts = dynamic(() => import("../components/ws-charts"), {
  ssr: false,
});

const tickers = ["SOL/USD", "BTC/USD"];

const Home: NextPage = () => {
  return (
    <>
      <PageHead />
      <Main>
        <h1>Just chilling</h1>
        <p>What is this?</p>
        <WsCharts tickers={tickers} />
      </Main>
    </>
  );
};

export default Home;
