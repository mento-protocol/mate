import { injectable } from "tsyringe";
import { IValidator } from "./IValidator";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { AdapterConfigCodec, CCXTAdapterConfig, ExchangeId } from "../types";
import { ValidationError } from "./ValidationError";
import {
   ERR_DUPLICATE_EXCHANGE_ID,
   ERR_INVALID_ADAPTER_CONFIG,
   ERR_UNSUPPORTED_EXCHANGE,
} from "../constants";

@injectable()
export class AdapterConfigValidator implements IValidator<CCXTAdapterConfig> {
   public async validate(data: any): Promise<CCXTAdapterConfig> {
      const validationResult = AdapterConfigCodec.decode(data);

      if (isRight(validationResult)) {
         this.validateExchangeIds(validationResult.right.config);
         return validationResult.right.config;
      } else if (isLeft(validationResult)) {
         //TODO: Think about extracting specific error messages from the PathReporter
         throw new ValidationError(
            ERR_INVALID_ADAPTER_CONFIG,
            PathReporter.report(validationResult)
         );
      } else {
         throw new Error(ERR_INVALID_ADAPTER_CONFIG);
      }
   }

   private validateExchangeIds(config: CCXTAdapterConfig) {
      const existingIds = new Set<string>();

      config.exchanges.forEach((exchange) => {
         const exchangeId = exchange.id.trim().toLowerCase();
         exchange.id = exchangeId; // Update the exchange ID with the normalized value

         // Check if the exchange ID is supported
         if (!Object.values(ExchangeId).includes(exchangeId as ExchangeId)) {
            throw new ValidationError(
               `${ERR_INVALID_ADAPTER_CONFIG}: ${ERR_UNSUPPORTED_EXCHANGE(
                  exchangeId
               )}`
            );
         }

         // Check for duplicate exchange IDs
         if (existingIds.has(exchangeId)) {
            throw new ValidationError(
               `${ERR_INVALID_ADAPTER_CONFIG}: ${ERR_DUPLICATE_EXCHANGE_ID(
                  exchangeId
               )}`
            );
         } else {
            existingIds.add(exchangeId);
         }
      });
   }
}
