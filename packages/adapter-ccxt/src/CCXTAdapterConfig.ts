import { ApiCredentials } from "./types";

/**
 * Represents the configuration settings for the CCXT adapter.
 */
export class CCXTAdapterConfig {
   private exchangeCredentials: Map<string, ApiCredentials>;

   constructor(_exchangeCredentials: Map<string, ApiCredentials>) {
      this.exchangeCredentials = _exchangeCredentials;
   }

   /**
    * Get the credentials for a given exchange.
    * @param exchangeId The ID of the exchange.
    * @returns The API credentials for the exchange or undefined if not set.
    */
   public getCredentials(exchangeId: string): ApiCredentials | undefined {
      return this.exchangeCredentials.get(exchangeId);
   }
}
