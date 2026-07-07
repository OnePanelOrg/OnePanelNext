import { type AppType } from "next/dist/shared/lib/utils";
import Script from "next/script";
import { gaMeasurementId } from "../lib/analytics";
import { AuthProvider } from "../lib/auth";
import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      {gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
            `}
          </Script>
        </>
      )}
      <AuthProvider pageProps={pageProps}>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
};

export default MyApp;
