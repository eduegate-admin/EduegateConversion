import clientSettings from "./clientSettings";
import { CLIENT, LOCALHOST } from "@env";

const ENVIRONMENT = process.env.ENVIRONMENT || "test";

const getClientSettings = () => {

  let clientKey = LOCALHOST ? "localhost" : CLIENT;
  let envKey = LOCALHOST ? LOCALHOST : ENVIRONMENT;

  const clientConfig = clientSettings[clientKey]?.[envKey];
  if (!clientConfig) {
    throw new Error(`Missing config for client: ${clientKey}, environment: ${envKey}`);
  }

  return {
    RootUrl: clientConfig,
  };
};

export default getClientSettings;
