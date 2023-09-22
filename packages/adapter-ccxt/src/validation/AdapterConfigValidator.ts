import { injectable } from "tsyringe";
import {
   ERR_INVALID_ADAPTER_CONFIG,
   IValidator,
   ValidationError,
} from "@mate/sdk";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { CCXTAdapterConfig } from "../CCXTAdapterConfig";
import { AdapterConfigCodec, ApiCredentials, ExchangeId } from "../types";
import {
   ERR_DUPLICATE_EXCHANGE_ID,
   ERR_UNSUPPORTED_EXCHANGE,
} from "../constants";

@injectable()
export class AdapterConfigValidator implements IValidator<CCXTAdapterConfig> {
   public async validate(data: any): Promise<CCXTAdapterConfig> {
      const validationResult = AdapterConfigCodec.decode(data);

      if (isRight(validationResult)) {
         return this.processValidResult(validationResult.right);
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

   private processValidResult(validResult: any): CCXTAdapterConfig {
      const exchangeCredentials = this.extractExchangeCredentials(
         validResult.config.exchanges
      );
      return new CCXTAdapterConfig(exchangeCredentials);
   }

   private extractExchangeCredentials(
      exchanges: Array<{ id: string; api_key: string; api_secret: string }>
   ): Map<ExchangeId, ApiCredentials> {
      const exchangeCredentials: Map<ExchangeId, ApiCredentials> = new Map();

      for (const exchange of exchanges) {
         this.validateExchangeId(exchange.id, exchangeCredentials);

         const exchangeApiCredentials = this.extractApiCredentials(exchange);
         exchangeCredentials.set(
            exchange.id.trim().toLowerCase() as ExchangeId,
            exchangeApiCredentials
         );
      }
      return exchangeCredentials;
   }

   private validateExchangeId(
      id: string,
      exchangeCredentials: Map<ExchangeId, ApiCredentials>
   ): void {
      const exchangeId = id.trim().toLowerCase();

      if (!Object.values(ExchangeId).includes(exchangeId as ExchangeId)) {
         throw new ValidationError(
            `${ERR_INVALID_ADAPTER_CONFIG}: ${ERR_UNSUPPORTED_EXCHANGE(
               exchangeId
            )}`
         );
      }

      if (exchangeCredentials.has(exchangeId as ExchangeId)) {
         throw new ValidationError(
            `${ERR_INVALID_ADAPTER_CONFIG}: ${ERR_DUPLICATE_EXCHANGE_ID(id)}`
         );
      }
   }

   private extractApiCredentials(exchange: {
      api_key: string;
      api_secret: string;
   }): ApiCredentials {
      return {
         apiKey: exchange.api_key.trim(),
         apiSecret: exchange.api_secret.trim(),
      };
   }
}
