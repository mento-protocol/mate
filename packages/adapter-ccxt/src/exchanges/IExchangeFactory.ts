import { ApiCredentials, ExchangeId } from "../types";
import { IExchangeApiService } from "./IExchangeApiService";

/**
 * Interface for a factory that creates exchange services based on provided exchange IDs and credentials.
 */
export interface IExchangeFactory {
   /**
    * Creates an exchange service instance based on the provided exchange ID.
    *
    * @param exchangeId - Identifier for the exchange service to be created.
    * @param credentials - Optional configuration specific to the exchange.
    * @returns A new instance of the exchange service.
    */
   createExchangeService(
      exchangeId: ExchangeId,
      credentials: ApiCredentials
   ): IExchangeApiService;
}
