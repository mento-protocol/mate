import { AdapterConfig } from "../types/AdapterConfig";

/**
 * `IConfigProvider` provides an interface for loading configuration details
 * from a given source, ensuring consistency and flexibility in how configurations
 * can be retrieved.
 */
export interface IConfigProvider {
   /**
    * Retrieves the configuration for a specific adapter using its ID.
    *
    * @param adapterId - The unique identifier for the adapter whose config is to be retrieved.
    * @returns The configuration details for the specified adapter or `null` if not found.
    */
   getAdapterConfig(adapterId: string): AdapterConfig | null;

   /**
    * Retrieves the value for the global setting with the specified key.
    * @param variableName - The name of the global variable to retrieve.
    * @returns The value of the global variable or null if not found.
    */
   getGlobalVariable(variableName: string): any | null;
}
