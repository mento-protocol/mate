import { ApiCredentials, ExchangeId } from "./types";

/**
 * Represents the configuration settings for the CCXT adapter.
 */
export class CCXTAdapterConfig {
   private exchangeCredentials: Map<ExchangeId, ApiCredentials>;

   constructor(_exchangeCredentials: Map<ExchangeId, ApiCredentials>) {
      this.exchangeCredentials = _exchangeCredentials;
   }

   /**
    * Get the credentials for a given exchange.
    * @param exchangeId The ID of the exchange.
    * @returns The API credentials for the exchange or undefined if not set.
    */
   public getCredentials(exchangeId: ExchangeId): ApiCredentials | undefined {
      return this.exchangeCredentials.get(exchangeId);
   }

   public get exchanges(): Map<ExchangeId, ApiCredentials> {
      return this.exchangeCredentials;
   }
}
