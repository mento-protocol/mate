export const INVALID_ADAPTER_CONFIGURATION = "Invalid adapter configuration";
export const DUPLICATE_EXCHANGE_ID_ERROR = (id: string) =>
   `Duplicate exchange ID: ${id} was found`;
export const UNSUPPORTED_EXCHANGE_ERROR = (id: string) =>
   `Unsupported exchange: ${id}`;
export const ASSET_NOT_SUPPORTED_BY_EXCHANGE = (
   asset: string,
   exchange: string
) => `Exchange ${exchange} does not support asset: ${asset}`;
export const ADAPTER_FAILED_INITIALIZE = "Adapter failed to initialize";
export const ADAPTER_CONFIG_NOT_FOUND = "Adapter config was not found";
export const API_CURRENCY_BALANCE_FETCH_ERROR = (currency: string) =>
   `Error fetching balance for currency: ${currency}`;
export const API_CURRENCY_BALANCE_NOT_FOUND = "Currency balance not found";
export const INVALID_STEP_CONFIGURATION = "Invalid step configuration";
export const UNSUPPORTED_STEP_TYPE = (type: string) =>
   `Unsupported step type: ${type}`;
