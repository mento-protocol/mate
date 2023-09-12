export const INVALID_ADAPTER_CONFIGURATION = "Invalid adapter configuration";
export const DUPLICATE_EXCHANGE_ID_ERROR = (id: string) =>
   `Duplicate exchange ID: ${id} was found`;
export const UNSUPPORTED_EXCHANGE_ERROR = (id: string) =>
   `Unsupported exchange: ${id}`;
export const ADAPTER_FAILED_INITIALIZE = "Adapter failed to initialize";
export const ADAPTER_CONFIG_NOT_FOUND = "Adapter config was not found";
export const API_CURRENCY_BALANCE_FETCH_ERROR = (currency: string) =>
   `Error fetching balance for currency: ${currency}`;
export const API_CURRENCY_BALANCE_NOT_FOUND = "Currency balance not found";
