import { injectable } from "tsyringe";
import { CCXTAdapterConfig } from "../CCXTAdapterConfig";
import { IValidator } from "./IValidator";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { AdapterType, ApiCredentials, ValidationError } from "../types";
import { PathReporter } from "io-ts/lib/PathReporter";
import {
   DUPLICATE_EXCHANGE_ID_ERROR,
   INVALID_ADAPTER_CONFIGURATION,
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
            // TODO: @bayo - Think about blocking/filtereing exchanges at this level with an array for supported exchanges
            // Check if exchange ID is in the list of supported exchanges

            const exchangeApiCredentials: ApiCredentials = {
               apiKey: exchange.api_key,
               apiSecret: exchange.api_secret,
            };

            if (exchangeCredentials.has(exchange.id)) {
               throw new ValidationError(
                  `${INVALID_ADAPTER_CONFIGURATION}: ${DUPLICATE_EXCHANGE_ID_ERROR(
                     exchange.id
                  )}`
               );
            }

            exchangeCredentials.set(exchange.id, exchangeApiCredentials);
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
