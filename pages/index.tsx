import { Button, ButtonsWrapper, Main } from "../styles/main";
import { ftxWs, ftxWsKeepAlive } from "../helpers/ftx-ws";
import { useEffect, useState } from "react";

import type { NextPage } from "next";
import PageHead from "./components/page-head";

const Home: NextPage = () => {
  const [ws, setWs] = useState<WebSocket>();
  const [intervalId, setintervalId] = useState<NodeJS.Timer>();
  const [startPing, setStartPing] = useState<boolean>(false);

  useEffect(() => {
    if (!ws) {
      return;
    }

    ftxWs(ws);
    setStartPing(true);
  }, [ws]);

  useEffect(() => {
    if (startPing && ws) {
      const id = ftxWsKeepAlive(ws);
      setintervalId(id);
    }
    if (!startPing && intervalId) {
      clearInterval(intervalId);
    }
  }, [startPing]);

  return (
    <>
      <PageHead />
      <Main>
        <h1>Just chilling</h1>
        <p>What is this?</p>
        <ButtonsWrapper>
          <Button onClick={() => setWs(new WebSocket("wss://ftx.com/ws/"))}>
            Connect
          </Button>
          <Button
            onClick={() => {
              ws?.close();
              setStartPing(false);
            }}
          >
            Disconnect
          </Button>
        </ButtonsWrapper>
      </Main>
    </>
  );
};

export default Home;
