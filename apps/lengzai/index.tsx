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
import { floor, round, sum } from "lodash";
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
  const { status, data, error, isFetching } = useTickerData();
  const [dataWLinRegLongerTerm, setDataWLinRegLongerTerm] =
    useState<DataWLinReg>();

  useEffect(() => {
    if (!data) {
      return;
    }
    const dataLongerTerm = addLinReg(data);
    setDataWLinRegLongerTerm(dataLongerTerm);
  }, [data]);

  const { tickerData } = useContext(PriceContext);

  const [wallet, setWallet] = useState<number>(initBudget);
  const [inventory, setInventory] = useState<Ask[]>();

  const [lowestAsk, setLowestAsk] = useState<Ask>();
  const [aveAsk, setAveAsk] = useState<number>();
  const [buyPrice, setBuyPrice] = useState<number>();
  const [availableBuyPrice, setAvailableBuyPrice] = useState<number>();

  // Prepare data
  useEffect(() => {
    const ticker = tickerData["SOL/USD"];
    if (!ticker || !ticker.asks) {
      return;
    }

    const latestAsk = ticker.asks[ticker.asks.length - 1];

    if (!lowestAsk || latestAsk.ask < lowestAsk.ask) {
      setLowestAsk(latestAsk);
    }

    const onlyAskPrices = ticker.asks.map((item) => item.ask);
    const averageAskPrices = sum(onlyAskPrices) / ticker.asks.length;

    setAveAsk(averageAskPrices);
  }, [tickerData, lowestAsk]);

  // Decide buy price
  useEffect(() => {
    if (!lowestAsk || !dataWLinRegLongerTerm) {
      return;
    }
    setBuyPrice(lowestAsk.ask + dataWLinRegLongerTerm?.stanDev * 2);
  }, [lowestAsk, dataWLinRegLongerTerm]);

  // Buy
  useEffect(() => {
    const ticker = tickerData["SOL/USD"];
    if (!ticker || !ticker.asks || !buyPrice) {
      return;
    }
    const latestAsk = ticker.asks[ticker.asks.length - 1];

    if (latestAsk.ask >= buyPrice) {
      setAvailableBuyPrice(latestAsk.ask);
    }
  }, [tickerData, buyPrice]);

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
          <span>stanDev: {dataWLinRegLongerTerm?.stanDev}</span>
          <span>slope: {dataWLinRegLongerTerm?.slope}</span>
          <span>lowestAsk: {lowestAsk?.ask}</span>
          <span>buyPrice: {buyPrice}</span>
          <span>availableBuyPrice: {availableBuyPrice}</span>
        </Info>

        {tickers.map((ticker, idx) => (
          <TickerSection key={idx}>
            <PanelsBox>
              <PanelWrapper>
                <H2>Bids</H2>
                <BidAskPanel>
                  {tickerData[ticker]?.bids.map((bid, idx) => (
                    <Row key={idx}>
                      <RowItem>{bid.time}</RowItem>
                      <RowItem>{bid.bid}</RowItem>
                      <RowItem>{bid.bidSize}</RowItem>
                    </Row>
                  ))}
                </BidAskPanel>
              </PanelWrapper>
              <PanelWrapper>
                <H2>Asks</H2>
                <BidAskPanel>
                  {tickerData[ticker]?.asks.map((ask, idx) => (
                    <Row key={idx}>
                      <RowItem>{ask.time}</RowItem>
                      <RowItem>{ask.ask}</RowItem>
                      <RowItem>{ask.askSize}</RowItem>
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
