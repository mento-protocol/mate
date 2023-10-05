export const ERR_DUPLICATE_EXCHANGE_ID = (id: string) =>
   `Duplicate exchange ID detected: ${id}`;
export const ERR_UNSUPPORTED_EXCHANGE = (id: string) =>
   `Exchange not supported: ${id}`;
export const ERR_ASSET_UNSUPPORTED_ON_EXCHANGE = (
   asset: string,
   exchange: string
) => `Asset ${asset} not supported on exchange ${exchange}`;
export const ERR_API_BALANCE_FETCH_FAILURE = (currency: string) =>
   `Failed to fetch balance for currency: ${currency}`;
export const ERR_BALANCE_NOT_FOUND = "Currency balance was not found";
export const ERR_EXCHANGE_SERVICE_NOT_FOUND = (exchange: string) =>
   `Service for exchange "${exchange}" not found. Verify the configuration for the ${exchange} exchange has been added to the config file.`;
export const ERR_API_FETCH_MARKETS_FAILURE = (exchange: string) =>
   `Failed to fetch markets for exchange ${exchange}`;
export const ERR_INVALID_ADDRESS = (address: string, prop: string) =>
   `Invalid address was provided for property "${prop}": ${address}`;
export const ERR_EXCHANGE_UNSUPPORTED_MARKET = (
   exchange: string,
   market: string
) => `Market ${market} not supported on exchange ${exchange}`;
