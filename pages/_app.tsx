import type { AppProps } from "next/app";
import router from "next/router";
import { ThemeProvider } from "next-themes";
import { Transition } from "components/Layout/Transition";

import { GlobalStyle } from "styles/globalStyles";
import "styles/nprogress.css";
import "public/assets/fonts/style.css";

const NProgress = require("nprogress");
NProgress.configure({ showSpinner: false });

let progressBarTimeout: NodeJS.Timeout;

const startProgressBar = () => {
  clearTimeout(progressBarTimeout);
  progressBarTimeout = setTimeout(NProgress.start, 200);
};

const stopProgressBar = () => {
  clearTimeout(progressBarTimeout);
  NProgress.done();
};

router.events.on("routeChangeStart", startProgressBar);
router.events.on("routeChangeComplete", stopProgressBar);
router.events.on("routeChangeError", stopProgressBar);

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <ThemeProvider>
      <GlobalStyle />
      <Transition location={router.pathname}>
        <Component {...pageProps} />
      </Transition>
    </ThemeProvider>
  );
}
