import { ExchangeId } from "../types";
import { IExchangeApiService } from "./IExchangeApiService";

/**
 * Interface for managing exchange service instances.
 */
export interface IExchangeServiceRepo {
   /**
    * Retrieve an exchange service by its identifier.
    *
    * @param exchangeId - The identifier of the exchange.
    * @returns The corresponding exchange service, or undefined if not found.
    */
   getExchangeService(exchangeId: ExchangeId): IExchangeApiService | undefined;

   /**
    * Add or update an exchange service.
    *
    * @param exchangeId - The identifier of the exchange.
    * @param exchangeService - The exchange service instance.
    */
   setExchangeService(
      exchangeId: ExchangeId,
      exchangeService: IExchangeApiService
   ): void;
}
