// const symbols = ["BTC-PERP", "BTC/USD", "ETH-PERP", "ETH/USD"];
const symbols = ["BTC-PERP"];

export const ftxWs = (ws: WebSocket) => {
  console.log({ ws });

  ws.onopen = () => {
    symbols.forEach((s) => {
      console.log(s);
      ws.send(`{"op": "subscribe", "channel": "trades", "market": "${s}"}`);
    });
  };

  ws.onmessage = (e) => {
    let data = JSON.parse(e.data);
    if (data.channel === "trades" && data.type === "update") {
      console.log(data);
    }

    // if (data.type === "pong") {
    //   console.log(data);
    // }
  };
};

export const ftxWsKeepAlive = (ws: WebSocket) => {
  //   let counter = 0;
  return setInterval(() => {
    // counter++;
    // console.log(`ping ~ ${counter}`);
    ws.send(JSON.stringify({ op: "ping" }));
  }, 15000);
};
