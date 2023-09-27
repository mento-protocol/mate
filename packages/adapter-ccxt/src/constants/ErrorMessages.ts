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
   `Service for exchange "${exchange}" not found. It might not have been initialized or properly registered in repo.`;
export const ERR_API_FETCH_MARKETS_FAILURE = (exchange: string) =>
   `Failed to fetch markets for exchange ${exchange}`;
