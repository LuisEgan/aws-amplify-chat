import Amplify from "@aws-amplify/core";
import awsExports from "../src/aws-exports";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

Amplify.configure(awsExports);
export default MyApp;
