import { Main } from "../styles/main";
import type { NextPage } from "next";
import PageHead from "../components/page-head";
import dynamic from "next/dynamic";

const ChartWrapper = dynamic(() => import("../components/chart-wrapper"), {
  ssr: false,
});

const Home: NextPage = () => {
  return (
    <>
      <PageHead />
      <Main>
        <h1>Just chilling</h1>
        <p>What is this?</p>
        <ChartWrapper ticker={"SOL-PERP"} />
      </Main>
    </>
  );
};

export default Home;
