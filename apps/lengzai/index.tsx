import Chart from "../../components/chart";
import { Main } from "../../styles/main";
import type { NextPage } from "next";
import PageHead from "../../components/page-head";
import { PriceContext } from "../../pages/_app";
import RestButtons from "../../components/rest-charts/rest-buttons";
import WsButtons from "../../components/ws-charts/ws-buttons";
import styled from "styled-components";
import { useContext } from "react";

const PanelsBox = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: space-evenly;
  height: 20rem;
  width: calc(100% - 2rem);
`;

const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem;
`;

const BidAskPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1rem;
  overflow-y: auto;
  background-color: aliceblue;
  border-radius: 0.5rem;
  border: 1px solid lightskyblue;
`;

const H2 = styled.h2`
  align-self: center;
`;

const Row = styled.div`
  font-weight: 300;
  display: flex;
  gap: 1rem;
  margin-top: 0.3rem;
`;

const RowItem = styled.span`
  width: 7rem;
`;

// const tickers = ["SOL/USD", "BTC/USD"];
const tickers = ["SOL/USD"];

const Lengzai: NextPage = () => {
  const { tickerData } = useContext(PriceContext);

  return (
    <>
      <PageHead />
      <Main>
        <h1></h1>

        <h2>5s Resolution</h2>
        {/* <RestButtons tickers={tickers} /> */}
        <WsButtons tickers={tickers} />

        {tickers.map((ticker) => (
          <>
            <Chart
              ticker={ticker}
              data={tickerData[ticker]?.bids}
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
          </>
        ))}
      </Main>
    </>
  );
};

export default Lengzai;
