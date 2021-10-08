import "../styles/globals.css";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useMemo,
  useState,
} from "react";

import type { AppProps } from "next/app";
import { TickerData } from "../types/state-types";

export const PriceContext = createContext({
  tickerData: {},
  setTickerData: () => {},
} as {
  tickerData: TickerData;
  setTickerData: Dispatch<SetStateAction<TickerData>>;
});

function MyApp({ Component, pageProps }: AppProps) {
  const [tickerData, setTickerData] = useState<TickerData>({});

  const value = useMemo(() => ({ tickerData, setTickerData }), [tickerData]);

  return (
    <>
      <PriceContext.Provider value={value}>
        <Component {...pageProps} />
      </PriceContext.Provider>
    </>
  );
}
export default MyApp;
