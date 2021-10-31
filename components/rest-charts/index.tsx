import Chart from "../chart";
import ChartButtons from "./rest-buttons";
import { NextPage } from "next";
import { PriceContext } from "../../pages/_app";
import { useContext } from "react";

interface Props {
  tickers: string[];
}

const RestCharts: NextPage<Props> = ({ tickers }) => {
  const { tickerData } = useContext(PriceContext);

  return (
    <>
      <ChartButtons tickers={tickers} />

      {/* {tickers.map((ticker) => (
        <Chart
          ticker={ticker}
          data={tickerData[ticker]?.priceData}
          key={ticker}
        />
      ))} */}
    </>
  );
};

export default RestCharts;
