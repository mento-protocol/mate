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
    * @param {string} adapterId - The unique identifier for the adapter whose config is to be retrieved.
    * @returns {AdapterConfig|null} The configuration details for the specified adapter or `null` if not found.
    */
   getAdapterConfig(adapterId: string): AdapterConfig | null;
}
