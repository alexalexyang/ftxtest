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
import styled from "styled-components";

const Info = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-left: 10rem;
  gap: 0.5rem;
`;

export interface DataWLinReg {
  data: PricesWLinReg[];
  mean: number;
  spread: number;
  slope: number;
  stanDev: number;
}

// const tickers = ["SOL/USD", "BTC/USD"];
const tickers = ["SOL/USD"];
const initBudget = 35;
const feePercent = 0.07;

const Lengzai: NextPage = () => {
  const { tickerData } = useContext(PriceContext);
  const { status, data, error, isFetching } = useTickerData();

  const [dataWLinRegLongerTerm, setDataWLinRegLongerTerm] =
    useState<DataWLinReg>();

  const [dataWLinRegShorterTerm, setDataWLinRegShorterTerm] =
    useState<DataWLinReg>();

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
  const [wallet, setWallet] = useState<number>(initBudget);

  const [inventory, setInventory] = useState<Ask[]>();

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
  }, [data, buySell]);

  // Trail prices

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

  // Buy-sell action

  // BUY
  useEffect(() => {
    if (!lowestAsk || !dataWLinRegLongerTerm || !buySell) {
      return;
    }

    const latestPrice =
      dataWLinRegLongerTerm.data[dataWLinRegLongerTerm.data.length - 1];

    if (buySell.status === "buy") {
      const diff = latestPrice.price - lowestAsk.ask;
      if (diff > 0 && diff > dataWLinRegLongerTerm.stanDev / 10) {
        const sizePerUnitPrice = lowestAsk.askSize / lowestAsk.ask;
        const sizeICanBuy = sizePerUnitPrice * wallet;
        const myCost = sizeICanBuy * lowestAsk.ask;

        const newPurchase = {
          ask: myCost,
          askSize: sizeICanBuy,
          time: new Date().toLocaleString("en-GB", {
            timeStyle: "medium",
          }),
        };

        setInventory([...(inventory || []), newPurchase]);

        setBuySell({
          status: "sell",
          buy: newPurchase,
        });

        setLowestAsk(undefined);
      }
    }
  }, [lowestAsk, dataWLinRegLongerTerm, buySell, wallet, inventory]);

  // SELL
  useEffect(() => {
    if (!highestBid || !dataWLinRegLongerTerm || !buySell) {
      return;
    }

    const latestPrice =
      dataWLinRegLongerTerm.data[dataWLinRegLongerTerm.data.length - 1];

    if (buySell.status === "sell" && buySell.buy) {
      const diff = highestBid.bid - latestPrice.price;
      if (diff > 0 && diff > dataWLinRegLongerTerm.stanDev / 10) {
        const fee = (highestBid.bid / 100) * feePercent;

        // setWallet(wallet + highestBid.bid - buySell.buy.ask - fee);

        setBuySell({ ...buySell, status: "buy", sell: highestBid });

        // const sizePerUnitPrice = highestBid.bidSize / highestBid.bid;
        inventory?.forEach((item) => {
          if (item.ask < highestBid.bid - fee) {
            const sellAll = item.askSize * highestBid.bid;
            const profit = item.ask - sellAll;
            setWallet(wallet + profit - fee);
            item.ask = 0;
            item.askSize = 0;
          }
          return item;
        });

        const updatedInventory = inventory?.filter(
          (item) => item.ask === 0 && item.askSize === 0
        );
        setInventory(updatedInventory);

        setHighestBid(undefined);
      }
    }
  }, [highestBid, dataWLinRegLongerTerm, buySell, wallet, inventory]);

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

        <Info>
          <span>Latest price: {latestTrade?.price}</span>
          <span>Lowest ask: {lowestAsk && lowestAsk.ask}</span>
          <span>Lowest ask size: {lowestAsk && lowestAsk.askSize}</span>
          <span>Highest bid: {highestBid && highestBid.bid}</span>
          <span>Highest bid size: {highestBid && highestBid.bidSize}</span>
          <span>
            Price-Ask diff:{" "}
            {latestTrade &&
              lowestAsk &&
              round(latestTrade.price - lowestAsk.ask, 5)}
          </span>
          <span>
            Partial Std:{" "}
            {dataWLinRegShorterTerm &&
              round(dataWLinRegShorterTerm.stanDev / 10, 5)}
          </span>

          <span>
            Status: {buySell.status}, Buy: {buySell.buy?.ask}, Sell:{" "}
            {buySell.sell?.bid}
          </span>
          <span>Wallet: {wallet}</span>
        </Info>

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
