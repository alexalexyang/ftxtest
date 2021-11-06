import {
  BidAskPanel,
  ButtonRow,
  ButtonWrappers,
  H2,
  PanelWrapper,
  PanelsBox,
  Row,
  RowItem,
  TickerSection,
} from "./styles";
import {
  linearRegression,
  linearRegressionLine,
  mean,
  standardDeviation,
} from "simple-statistics";
import { useContext, useEffect, useState } from "react";

import Chart from "../../components/chart";
import { Main } from "../../styles/main";
import type { NextPage } from "next";
import PageHead from "../../components/page-head";
import { PriceContext } from "../../pages/_app";
import { PricesWLinReg } from "../../types/ftx";
import WsButtons from "../../components/ws-buttons";
import db from "/Users/alex.yang@futurice.com/Desktop/db.json";
import { useTickerData } from "./utils";

// const tickers = ["SOL/USD", "BTC/USD"];
const tickers = ["SOL/USD"];

const Lengzai: NextPage = () => {
  const { tickerData } = useContext(PriceContext);
  const { status, data, error, isFetching } = useTickerData();
  const [chartData, setChartData] = useState<{
    data: PricesWLinReg[];
    mean: number;
    spread: number;
  }>();

  useEffect(() => {
    if (!data) {
      return;
    }

    const linRegData = data.map((datum, idx) => [idx, datum.price]);
    const linRegSlopeAndIntercept = linearRegression(linRegData);

    const pricesOnly = data.map((datum) => datum.price);
    const stanDev = standardDeviation(pricesOnly);

    const pricesWLinReg: PricesWLinReg[] = data.map((datum, idx) => {
      const newDatum: PricesWLinReg = {
        ...datum,
        linRegY: 0,
        stanDevUpperBound: 0,
        stanDevLowerBound: 0,
      };
      newDatum.linRegY = linearRegressionLine(linRegSlopeAndIntercept)(idx);
      newDatum.stanDevUpperBound = newDatum.linRegY + stanDev * 1;
      newDatum.stanDevLowerBound = newDatum.linRegY - stanDev * 1;
      return newDatum;
    });

    setChartData({
      data: pricesWLinReg,
      mean: mean(pricesOnly),
      spread: stanDev * 2,
    });
  }, [data]);

  return (
    <>
      <PageHead />
      <Main>
        <h1>Trade!</h1>

        <h2>5s Resolution</h2>
        <ButtonWrappers>
          <ButtonRow>REST: disabled.</ButtonRow>
          <ButtonRow>
            WS: <WsButtons tickers={tickers} />
          </ButtonRow>
        </ButtonWrappers>

        {tickers.map((ticker, idx) => (
          <TickerSection key={idx}>
            <Chart
              ticker={ticker}
              data={chartData?.data ? chartData.data : []}
              // data={db.trades}
              dataKey="price"
              mean={chartData?.mean ? chartData.mean : 0}
              spread={chartData?.spread ? chartData.spread : 0}
              key={ticker}
              property="bid"
            />
            <PanelsBox>
              <PanelWrapper>
                <H2>Bids</H2>
                <BidAskPanel>
                  {tickerData[ticker]?.bids.map((bid, idx) => (
                    <Row key={idx}>
                      <RowItem>{bid.bid}</RowItem>
                      <RowItem>{bid.bidSize}</RowItem>
                      <RowItem>{bid.time}</RowItem>
                    </Row>
                  ))}
                </BidAskPanel>
              </PanelWrapper>
              <PanelWrapper>
                <H2>Asks</H2>
                <BidAskPanel>
                  {tickerData[ticker]?.asks.map((ask, idx) => (
                    <Row key={idx}>
                      <RowItem>{ask.ask}</RowItem>
                      <RowItem>{ask.askSize}</RowItem>
                      <RowItem>{ask.time}</RowItem>
                    </Row>
                  ))}
                </BidAskPanel>
              </PanelWrapper>
            </PanelsBox>
          </TickerSection>
        ))}
      </Main>
    </>
  );
};

export default Lengzai;
