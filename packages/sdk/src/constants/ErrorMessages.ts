/* Configuration */
export const ERR_INVALID_ADAPTER_CONFIG = "Invalid adapter configuration";
export const ERR_ADAPTER_INIT_FAILURE = "Failed to initialize adapter";
export const ERR_ADAPTER_CONFIG_MISSING = "No configuration found for adapter";
export const ERR_INVALID_STEP_CONFIG = "Invalid step configuration provided";
export const ERR_UNSUPPORTED_STEP = (type: string) =>
   `Step type not supported: ${type}`;
export const ERR_UNSUPPORTED_CHAIN = (id: string) =>
   `Chain ID not supported: ${id}`;
export const ERR_UNSUPPORTED_TOKEN = (token: string, chain: number) =>
   `Token ${token} not supported on chain ${chain}`;
export const ERR_INVALID_ADDRESS = (address: string, prop: string) =>
   `Invalid address was provided for property '${prop}': ${address}`;
export const ERR_GLOBAL_VARIABLE_MISSING = (name: string) =>
   `Global variable ${name} was not found. Please check configuration file and try again`;
export const ERR_ADAPTER_EXECUTE_FAILURE = "Adapter execution failed.";
export const ERR_RPC_URL_MISSING = (chainId: number) =>
   `RPC URL not found for chain with id ${chainId}. Please check configuration file and try again`;
