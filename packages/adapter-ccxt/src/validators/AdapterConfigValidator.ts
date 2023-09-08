import { injectable } from "tsyringe";
import { CCXTAdapterConfig } from "../CCXTAdapterConfig";
import { IValidator } from "./IValidator";
import { isLeft, isRight } from "fp-ts/lib/Either";
import {
   AdapterType,
   ApiCredentials,
   SupportedExchanges,
   ValidationError,
} from "../types";
import { PathReporter } from "io-ts/lib/PathReporter";
import {
   DUPLICATE_EXCHANGE_ID_ERROR,
   INVALID_ADAPTER_CONFIGURATION,
   UNSUPPORTED_EXCHANGE_ERROR,
} from "../constants";

@injectable()
export class AdapterConfigValidator implements IValidator<CCXTAdapterConfig> {
   public validate(data: any): CCXTAdapterConfig {
      const validationResult = AdapterType.decode(data);

      if (isRight(validationResult)) {
         let exchangeCredentials: Map<string, ApiCredentials> = new Map();

         for (const exchange of validationResult.right.config
            .exchanges as Array<{
            id: string;
            api_key: string;
            api_secret: string;
         }>) {
            const exchangeId = exchange.id.trim().toLowerCase();

            if (
               !Object.values(SupportedExchanges).includes(
                  exchangeId as SupportedExchanges
               )
            ) {
               throw new ValidationError(
                  `${INVALID_ADAPTER_CONFIGURATION}: ${UNSUPPORTED_EXCHANGE_ERROR(
                     exchangeId
                  )}`
               );
            }

            if (exchangeCredentials.has(exchangeId)) {
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

            exchangeCredentials.set(exchangeId, exchangeApiCredentials);
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
