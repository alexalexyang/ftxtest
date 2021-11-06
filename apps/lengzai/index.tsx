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

import Chart from "../../components/chart";
import { Main } from "../../styles/main";
import type { NextPage } from "next";
import PageHead from "../../components/page-head";
import { PriceContext } from "../../pages/_app";
import WsButtons from "../../components/ws-buttons";
import db from "/Users/alex.yang@futurice.com/Desktop/db.json";
import { useContext } from "react";
import { useTickerData } from "./utils";

// const tickers = ["SOL/USD", "BTC/USD"];
const tickers = ["SOL/USD"];

const Lengzai: NextPage = () => {
  const { tickerData } = useContext(PriceContext);
  const { status, data, error, isFetching } = useTickerData();

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
              data={data ? data : []}
              // data={db.trades}
              dataKey="price"
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
