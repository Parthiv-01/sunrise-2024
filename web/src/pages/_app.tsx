import React from "react";
import { AppProps } from "next/app";
import { CssBaseline } from "@mui/material";
import { Roboto } from "next/font/google";

// Load Roboto font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"], // Specify the font weights you need
});

// Import global CSS file
import "@/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={roboto.className}>
      <CssBaseline />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
