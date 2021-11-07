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
import { addLinReg, useTickerData } from "./utils";
import { useContext, useEffect, useState } from "react";

import Chart from "../../components/chart";
import { Main } from "../../styles/main";
import type { NextPage } from "next";
import PageHead from "../../components/page-head";
import { PriceContext } from "../../pages/_app";
import { PricesWLinReg } from "../../types/ftx-types";
import WsButtons from "../../components/ws-buttons";
// import db from "/Users/alex.yang@futurice.com/Desktop/db.json";
import { floor } from "lodash";

interface DataWLinReg {
  data: PricesWLinReg[];
  mean: number;
  spread: number;
  slope: number;
}

interface Purchase {
  size: number;
  ask: number;
  buy?: number;
  sell?: number;
}

// const tickers = ["SOL/USD", "BTC/USD"];
const tickers = ["SOL/USD"];
const initBudget = 35;
const fee = 0.07;

const Lengzai: NextPage = () => {
  const { tickerData } = useContext(PriceContext);
  const { status, data, error, isFetching } = useTickerData();

  const [dataWLinRegLongerTerm, setDataWLinRegLongerTerm] =
    useState<DataWLinReg>();

  const [dataWLinRegShorterTerm, setDataWLinRegShorterTerm] =
    useState<DataWLinReg>();

  const [myBudget, setMyBudget] = useState<number>(initBudget);
  const [purchase, setPurchase] = useState<Purchase>();
  const [profit, setProfit] = useState<number>(0);

  // Transform raw data

  useEffect(() => {
    if (!data) {
      return;
    }

    const dataWLinReg = addLinReg(data);
    setDataWLinRegLongerTerm(dataWLinReg);
  }, [data]);

  // BUY

  const latestAsk =
    tickerData["SOL/USD"]?.asks[tickerData["SOL/USD"]?.asks?.length - 1];

  useEffect(() => {
    if (
      !latestAsk ||
      !dataWLinRegLongerTerm ||
      dataWLinRegLongerTerm.slope < 0
    ) {
      return;
    }

    const latestDatum =
      dataWLinRegLongerTerm.data[dataWLinRegLongerTerm.data.length - 1];
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
  }, [latestAsk, dataWLinRegLongerTerm, myBudget, purchase]);

  // SELL

  const latestBid =
    tickerData["SOL/USD"]?.bids[tickerData["SOL/USD"]?.bids?.length - 1];

  useEffect(() => {
    if (!latestBid || !dataWLinRegLongerTerm || !purchase?.ask) {
      return;
    }
    // const latestDatum =
    //   dataWLinRegLongerTerm.data[dataWLinRegLongerTerm.data.length - 1];
    // const latestLinRegY = latestDatum.linRegY;
    // const latestUpperBound = latestDatum.stanDevUpperBound;
    // const UpperSpread = latestUpperBound - latestLinRegY;
    // const sellPoint = latestUpperBound - UpperSpread / 2 + fee;

    if (!purchase?.buy) {
      return;
    }

    const revenue = latestBid.bid * purchase.size; // Assume we sell everything in one bid.
    const profit = revenue - purchase.buy - fee; // Assume min. profit is break-even.
    setProfit(profit);

    if (profit > 0) {
      const newBudget = myBudget + revenue + profit;
      setMyBudget(newBudget);
      console.log("PROFIT! ", newBudget);

      if (purchase) {
        setPurchase(undefined);
      }
    }
  }, [latestBid, dataWLinRegLongerTerm, myBudget, purchase]);

  return (
    <>
      <PageHead />
      <Main>
        <h1>Trade!</h1>

        <ButtonWrappers>
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
            <h2>2 min</h2>
            <Chart
              ticker={ticker}
              data={
                dataWLinRegLongerTerm?.data ? dataWLinRegLongerTerm.data : []
              }
              dataKey="price"
              mean={
                dataWLinRegLongerTerm?.mean ? dataWLinRegLongerTerm.mean : 0
              }
              spread={
                dataWLinRegLongerTerm?.spread ? dataWLinRegLongerTerm.spread : 0
              }
              key={`${ticker}-long-term`}
              property="bid"
            />

            <h2>Last 1 min</h2>
            <Chart
              ticker={ticker}
              data={
                dataWLinRegLongerTerm?.data
                  ? dataWLinRegLongerTerm.data.slice(
                      dataWLinRegLongerTerm.data.length - 30 <= 0
                        ? 0
                        : dataWLinRegLongerTerm.data.length - 30,
                      dataWLinRegLongerTerm.data.length
                    )
                  : []
              }
              dataKey="price"
              mean={
                dataWLinRegLongerTerm?.mean ? dataWLinRegLongerTerm.mean : 0
              }
              spread={
                dataWLinRegLongerTerm?.spread ? dataWLinRegLongerTerm.spread : 0
              }
              key={`${ticker}-short-term`}
              property="bid"
            />
            {/* <PanelsBox>
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
            </PanelsBox> */}
          </TickerSection>
        ))}
      </Main>
    </>
  );
};

export default Lengzai;
