/**
 * `IConfigLoader` provides an interface for loading configuration details
 * from a given source, ensuring consistency and flexibility in how configurations
 * can be retrieved.
 */
export interface IConfigLoader {
   /**
    * Retrieves the configuration for a specific adapter using its ID.
    *
    * @param adapterId - The unique identifier for the adapter whose config is to be retrieved.
    * @returns The configuration details for the specified adapter or `null` if not found.
    */
   getAdapterConfig(adapterId: string): AdapterConfig | null;
}
