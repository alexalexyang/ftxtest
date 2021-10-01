import Chart from "../components/chart-component";
import { Main } from "../styles/main";
import type { NextPage } from "next";
import PageHead from "../components/page-head";

const Home: NextPage = () => {
  return (
    <>
      <PageHead />
      <Main>
        <h1>Just chilling</h1>
        <p>What is this?</p>
        <Chart />
      </Main>
    </>
  );
};

export default Home;
