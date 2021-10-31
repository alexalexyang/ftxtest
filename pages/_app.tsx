import "../styles/globals.css";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useMemo,
  useState,
} from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import type { AppProps } from "next/app";
import { TickerData } from "../types/state-types";
import dynamic from "next/dynamic";

const queryClient = new QueryClient();

export const PriceContext = createContext({
  tickerData: {},
  setTickerData: () => {},
} as {
  tickerData: TickerData;
  setTickerData: Dispatch<SetStateAction<TickerData>>;
});

function App({ Component, pageProps }: AppProps) {
  const [tickerData, setTickerData] = useState<TickerData>({});

  const value = useMemo(() => ({ tickerData, setTickerData }), [tickerData]);

  return (
    <>
      <PriceContext.Provider value={value}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </PriceContext.Provider>
    </>
  );
}
export default process.env.NODE_ENV === "development"
  ? dynamic(() => Promise.resolve(App), {
      ssr: false,
    })
  : App;
