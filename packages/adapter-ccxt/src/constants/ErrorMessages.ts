export const ERR_INVALID_ADAPTER_CONFIG = "Invalid adapter configuration";
export const ERR_DUPLICATE_EXCHANGE_ID = (id: string) =>
   `Duplicate exchange ID detected: ${id}`;
export const ERR_UNSUPPORTED_EXCHANGE = (id: string) =>
   `Exchange not supported: ${id}`;
export const ERR_ASSET_UNSUPPORTED_ON_EXCHANGE = (
   asset: string,
   exchange: string
) => `Asset ${asset} not supported on exchange ${exchange}`;
export const ERR_ADAPTER_INIT_FAILURE = "Failed to initialize adapter";
export const ERR_ADAPTER_CONFIG_MISSING = "No configuration found for adapter";
export const ERR_API_BALANCE_FETCH_FAILURE = (currency: string) =>
   `Failed to fetch balance for currency: ${currency}`;
export const ERR_BALANCE_NOT_FOUND = "Currency balance was not found";
export const ERR_INVALID_STEP_CONFIG = "Invalid step configuration provided";
export const ERR_UNSUPPORTED_STEP = (type: string) =>
   `Step type not supported: ${type}`;
