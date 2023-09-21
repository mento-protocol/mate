import { injectable } from "tsyringe";
import { IValidator } from "./IValidator";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import {
   DUPLICATE_EXCHANGE_ID_ERROR,
   INVALID_ADAPTER_CONFIGURATION,
   UNSUPPORTED_EXCHANGE_ERROR,
} from "../constants";
import { CCXTAdapterConfig } from "../CCXTAdapterConfig";
import { AdapterConfigCodec, ApiCredentials, ExchangeId } from "../types";
import { ValidationError } from "./ValidationError";

@injectable()
export class AdapterConfigValidator implements IValidator<CCXTAdapterConfig> {
   public validate(data: any): CCXTAdapterConfig {
      // Validate the data using the codec to ensure it matches the expected shape
      const validationResult = AdapterConfigCodec.decode(data);

      // If the validation was successful, proceed to validate the exchange credentials then return the config object
      if (isRight(validationResult)) {
         let exchangeCredentials: Map<ExchangeId, ApiCredentials> = new Map();

         for (const exchange of validationResult.right.config
            .exchanges as Array<{
            id: string;
            api_key: string;
            api_secret: string;
         }>) {
            const exchangeId = exchange.id.trim().toLowerCase();

            // Make sure the exchange is supported
            if (!Object.values(ExchangeId).includes(exchangeId as ExchangeId)) {
               throw new ValidationError(
                  `${INVALID_ADAPTER_CONFIGURATION}: ${UNSUPPORTED_EXCHANGE_ERROR(
                     exchangeId
                  )}`
               );
            }

            // Make sure the exchange ID is unique, e.g. no duplicate exchange IDs in the config
            if (exchangeCredentials.has(exchangeId as ExchangeId)) {
               throw new ValidationError(
                  `${INVALID_ADAPTER_CONFIGURATION}: ${DUPLICATE_EXCHANGE_ID_ERROR(
                     exchange.id
                  )}`
               );
            }

            const exchangeApiCredentials: ApiCredentials = {
               apiKey: exchange.api_key.trim(),
               apiSecret: exchange.api_secret.trim(),
            };

            exchangeCredentials.set(
               exchangeId as ExchangeId,
               exchangeApiCredentials
            );
         }

         return new CCXTAdapterConfig(exchangeCredentials);
      } else if (isLeft(validationResult)) {
         throw new ValidationError(
            INVALID_ADAPTER_CONFIGURATION,
            PathReporter.report(validationResult)
         );
      } else {
         throw new Error(INVALID_ADAPTER_CONFIGURATION);
      }
   }
}
