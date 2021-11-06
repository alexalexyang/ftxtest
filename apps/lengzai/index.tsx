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
import { floor } from "lodash";
import { useTickerData } from "./utils";

// const tickers = ["SOL/USD", "BTC/USD"];
const tickers = ["SOL/USD"];
const initBudget = 35;
const fee = 0.07;

const Lengzai: NextPage = () => {
  const { tickerData } = useContext(PriceContext);
  const { status, data, error, isFetching } = useTickerData();
  const [dataWLinReg, setDataWLinReg] = useState<{
    data: PricesWLinReg[];
    mean: number;
    spread: number;
    slope: number;
  }>();

  const [myBudget, setMyBudget] = useState<number>(initBudget);
  const [purchase, setPurchase] = useState<{
    size: number;
    ask: number;
    buy?: number;
    sell?: number;
  }>();

  const [profit, setProfit] = useState<number>(0);

  useEffect(() => {
    if (!data) {
      return;
    }

    const linRegData = data.map((datum, idx) => [idx, datum.price]);
    const linRegSlopeAndIntercept = linearRegression(linRegData);

    const pricesOnly = data.map((datum) => datum.price);
    const stanDev = standardDeviation(pricesOnly);

    const pricesWLinReg: PricesWLinReg[] = data.map((datum, idx) => {
      const linRegY = linearRegressionLine(linRegSlopeAndIntercept)(idx);

      const newDatum: PricesWLinReg = {
        ...datum,
        linRegY,
        stanDevUpperBound: linRegY + stanDev * 1,
        stanDevLowerBound: linRegY - stanDev * 1,
      };

      return newDatum;
    });

    setDataWLinReg({
      data: pricesWLinReg,
      mean: mean(pricesOnly),
      spread: stanDev * 2,
      slope: linRegSlopeAndIntercept.m,
    });
  }, [data]);

  const latestAsk =
    tickerData["SOL/USD"]?.asks[tickerData["SOL/USD"]?.asks?.length - 1];

  useEffect(() => {
    if (!latestAsk || !dataWLinReg || dataWLinReg.slope < 0) {
      return;
    }
    const latestDatum = dataWLinReg.data[dataWLinReg.data.length - 1];
    const latestLinRegY = latestDatum.linRegY;
    const latestLowerBound = latestDatum.stanDevLowerBound;
    const lowerSpread = latestLinRegY - latestLowerBound;

    const buyPoint = latestLowerBound + lowerSpread / 2;

    if (latestAsk.ask < buyPoint) {
      const affordableSize = floor(myBudget / latestAsk.ask, 2);

      const buy = latestAsk.ask * affordableSize;

      if (!purchase) {
        const newPurchase = {
          size: affordableSize,
          ask: latestAsk.ask,
          buy,
          sell: undefined,
        };

        setPurchase(newPurchase);
        setMyBudget(myBudget - buy);

        console.log("BUY!");
        console.log(newPurchase);
      }
    }
  }, [latestAsk, dataWLinReg, myBudget, purchase]);

  const latestBid =
    tickerData["SOL/USD"]?.bids[tickerData["SOL/USD"]?.bids?.length - 1];

  useEffect(() => {
    if (!latestBid || !dataWLinReg || !purchase?.ask) {
      return;
    }
    const latestDatum = dataWLinReg.data[dataWLinReg.data.length - 1];
    const latestLinRegY = latestDatum.linRegY;
    const latestUpperBound = latestDatum.stanDevUpperBound;
    const UpperSpread = latestUpperBound - latestLinRegY;

    // const sellPoint = latestUpperBound - UpperSpread / 2 + fee;

    if (!purchase?.buy) {
      return;
    }

    const revenue = latestBid.bid * purchase.size;
    const profit = revenue - purchase.buy - fee;
    setProfit(profit);

    if (profit > 0) {
      console.log("PROFIT!");
      console.log(
        purchase.buy,
        purchase.size,
        latestBid.bid,
        latestBid.bid * purchase.size
      );
      console.log(revenue);

      setMyBudget(myBudget + revenue + profit);

      if (purchase) {
        setPurchase(undefined);
      }
    }
  }, [latestBid, dataWLinReg, myBudget, purchase]);

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

        <span>
          Ask: {purchase?.ask}, Buy: {purchase?.buy}
        </span>
        <span>Budget: {myBudget}</span>
        <span>Profit: {profit}</span>

        {tickers.map((ticker, idx) => (
          <TickerSection key={idx}>
            <Chart
              ticker={ticker}
              data={dataWLinReg?.data ? dataWLinReg.data : []}
              // data={db.trades}
              dataKey="price"
              mean={dataWLinReg?.mean ? dataWLinReg.mean : 0}
              spread={dataWLinReg?.spread ? dataWLinReg.spread : 0}
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
