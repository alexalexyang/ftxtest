import { Ask, Bid, PricesWLinReg } from "../../types/ftx-types";
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
// import db from "/Users/alex.yang@futurice.com/Desktop/db.json";
import { floor, round } from "lodash";
import { useContext, useEffect, useState } from "react";

import Chart from "../../components/chart";
import { Main } from "../../styles/main";
import type { NextPage } from "next";
import PageHead from "../../components/page-head";
import { PriceContext } from "../../pages/_app";
import WsButtons from "../../components/ws-buttons";

export interface DataWLinReg {
  data: PricesWLinReg[];
  mean: number;
  spread: number;
  slope: number;
  stanDev: number;
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

  // Trailing strategy
  const [lowestAsk, setLowestAsk] = useState<Ask>();
  const [highestBid, setHighestBid] = useState<Bid>();
  const [buySell, setBuySell] = useState<{
    status: "buy" | "sell";
    buy?: Ask;
    sell?: Bid;
  }>({
    status: "buy",
  });
  const [trailingProfit, setTrailingProfit] = useState<number>(0);

  // Transform raw data

  useEffect(() => {
    if (!data) {
      return;
    }

    const dataLongerTerm = addLinReg(data);
    setDataWLinRegLongerTerm(dataLongerTerm);

    const arrLength = data.length - 30;

    const dataShorterTermRaw = data
      ? data.slice(arrLength <= 0 ? 0 : arrLength, data.length)
      : [];

    const dataShorterTerm = addLinReg(dataShorterTermRaw);

    setDataWLinRegShorterTerm(dataShorterTerm);
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

  // Trailing strategy
  useEffect(() => {
    const ticker = tickerData["SOL/USD"];

    if (buySell.status === "buy") {
      if (!ticker || !ticker.asks) {
        return;
      }

      const latestAsk = ticker.asks[ticker.asks.length - 1];

      if (!lowestAsk || latestAsk.ask < lowestAsk.ask) {
        setLowestAsk(latestAsk);
      }
    }

    if (buySell.status === "sell") {
      if (!ticker || !ticker.bids) {
        return;
      }

      const latestBid = ticker.bids[ticker.bids.length - 1];

      if (!highestBid || latestBid.bid > highestBid.bid) {
        setHighestBid(latestBid);
      }
    }
  }, [tickerData, lowestAsk, highestBid, buySell]);

  useEffect(() => {
    if (!lowestAsk || !dataWLinRegLongerTerm || !buySell) {
      return;
    }

    const latestPrice =
      dataWLinRegLongerTerm.data[dataWLinRegLongerTerm.data.length - 1];

    if (buySell.status === "buy") {
      const diff = latestPrice.price - lowestAsk.ask;
      if (diff > 0 && diff > dataWLinRegLongerTerm.stanDev / 10) {
        setBuySell({ status: "sell", buy: lowestAsk });
        setLowestAsk(undefined);
      }
    }
  }, [lowestAsk, dataWLinRegLongerTerm, buySell, trailingProfit]);

  useEffect(() => {
    if (!highestBid || !dataWLinRegLongerTerm || !buySell) {
      return;
    }

    const latestPrice =
      dataWLinRegLongerTerm.data[dataWLinRegLongerTerm.data.length - 1];

    if (buySell.status === "sell" && buySell.buy) {
      const diff = highestBid.bid - latestPrice.price;
      if (diff > 0 && diff > dataWLinRegLongerTerm.stanDev / 10) {
        setTrailingProfit(trailingProfit + highestBid.bid - buySell.buy.ask);

        setBuySell({ ...buySell, status: "buy", sell: highestBid });
        setHighestBid(undefined);
      }
    }
  }, [highestBid, dataWLinRegLongerTerm, buySell, trailingProfit]);

  const latestTrade =
    dataWLinRegShorterTerm?.data[dataWLinRegShorterTerm.data.length - 1];

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

        <span>Latest price: {latestTrade?.price}</span>
        <span>Lowest ask: {lowestAsk && lowestAsk.ask}</span>
        <span>Lowest ask size: {lowestAsk && lowestAsk.askSize}</span>
        <span>Highest bid: {highestBid && highestBid.bid}</span>
        <span>Highest bid size: {highestBid && highestBid.bidSize}</span>
        {latestTrade?.price && lowestAsk?.ask && dataWLinRegShorterTerm && (
          <>
            <span>
              Price-Ask diff: {round(latestTrade.price - lowestAsk.ask, 5)}
            </span>
            <span>
              Partial Std: {round(dataWLinRegShorterTerm.stanDev / 10, 5)}
            </span>
          </>
        )}

        <span>Trailing profit: {trailingProfit}</span>
        <span>
          Status: {buySell.status}, Buy: {buySell.buy?.ask}, Sell:{" "}
          {buySell.sell?.bid}
        </span>

        {tickers.map((ticker, idx) => (
          <TickerSection key={idx}>
            <h2>2 min</h2>
            <Chart
              ticker={ticker}
              data={dataWLinRegLongerTerm?.data || []}
              dataKey="price"
              mean={dataWLinRegLongerTerm?.mean || 0}
              spread={dataWLinRegLongerTerm?.spread || 0}
              key={`${ticker}-long-term`}
              property="bid"
            />

            <h2>Last 1 min</h2>
            <Chart
              ticker={ticker}
              data={dataWLinRegShorterTerm?.data || []}
              dataKey="price"
              mean={dataWLinRegShorterTerm?.mean || 0}
              spread={dataWLinRegShorterTerm?.spread || 0}
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
