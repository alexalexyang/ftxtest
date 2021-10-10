import { Button, ButtonsWrapper } from "../../styles/main";
import {
  ftxWs,
  ftxWsKeepAlive,
  subscribeChannels,
  unSubscribeChannels,
} from "../../helpers/ftx-ws";
import { useContext, useEffect, useState } from "react";

import { NextPage } from "next";
import { PriceContext } from "../../pages/_app";

interface Props {
  tickers: string[];
}

const ChartButtons: NextPage<Props> = ({ tickers }) => {
  const [ws, setWs] = useState<WebSocket>();

  const [pingId, setPingId] = useState<NodeJS.Timer>();
  const [ping, setPing] = useState<boolean>(false);

  const { setTickerData } = useContext(PriceContext);

  useEffect(() => {
    if (!ws) {
      return;
    }

    ftxWs({ ws, setTickerData });
    setPing(true);
  }, [ws]);

  useEffect(() => {
    if (ping && ws) {
      const id = ftxWsKeepAlive(ws);
      return setPingId(id);
    }

    if (!ping && pingId) {
      clearInterval(pingId);
    }
  }, [ping]);

  return (
    <ButtonsWrapper>
      <Button
        onClick={() => {
          setWs(new WebSocket("wss://ftx.com/ws/"));
        }}
      >
        Connect
      </Button>
      <Button
        onClick={() => {
          if (!ws) {
            return;
          }
          subscribeChannels(ws, tickers);
        }}
      >
        Subscribe
      </Button>
      <Button
        onClick={() => {
          if (!ws) {
            return;
          }

          unSubscribeChannels(ws, tickers);
          ws.close();
          setWs(undefined);
          setPing(false);
        }}
      >
        Disconnect
      </Button>
    </ButtonsWrapper>
  );
};

export default ChartButtons;
