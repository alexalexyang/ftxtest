import ChartButtons from "./chart-buttons";
import { NextPage } from "next";
import WsChart from "./ws-chart";

interface Props {
  ticker: string;
}

const ChartWrapper: NextPage<Props> = ({ ticker }) => {
  return (
    <>
      <WsChart ticker={ticker} />
      <ChartButtons ticker={ticker} />
    </>
  );
};

export default ChartWrapper;
