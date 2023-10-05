import { Squid } from "@0xsquid/sdk";

export interface ISquidProvider {
   /**
    * Initializes the Squid SDK with the provided configuration.
    *
    * @param config - The configuration needed to initialize the Squid SDK.
    * @param config.baseUrl - The base URL for the Squid API.
    * @param config.integratorId - The unique identifier for the integrator.
    * @throws Error if the provider is already initialized or if there is an issue during initialization.
    * @returns A promise that resolves once the initialization is complete.
    */
   init(config: { baseUrl: string; integratorId: string }): Promise<void>;

   /**
    * Retrieves the initialized instance of the Squid SDK.
    *
    * @throws Error if the provider has not been initialized.
    * @returns The initialized Squid SDK instance.
    */
   getSquid(): Squid;
}
