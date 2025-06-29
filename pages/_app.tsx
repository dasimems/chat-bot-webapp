import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Heritage spa chatbot</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
