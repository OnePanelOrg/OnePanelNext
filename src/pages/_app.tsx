import { type AppType } from "next/dist/shared/lib/utils";
import { AuthProvider } from "../lib/auth";
import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AuthProvider pageProps={pageProps}>
      <Component {...pageProps} />
    </AuthProvider>
  );
};

export default MyApp;
