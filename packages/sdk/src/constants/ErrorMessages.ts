/* Configuration */
export const ERR_INVALID_ADAPTER_CONFIG = "Invalid adapter configuration";
export const ERR_ADAPTER_INIT_FAILURE = "Failed to initialize adapter";
export const ERR_ADAPTER_CONFIG_MISSING = "No configuration found for adapter";
export const ERR_INVALID_STEP_CONFIG = "Invalid step configuration provided";
export const ERR_UNSUPPORTED_STEP = (type: string) =>
   `Step type not supported: ${type}`;
export const ERR_UNSUPPORTED_CHAIN = (id: string) =>
   `Chain ID not supported: ${id}`;
export const ERR_UNSUPPORTED_TOKEN = (token: string) =>
   `Token not supported: ${token}`;
