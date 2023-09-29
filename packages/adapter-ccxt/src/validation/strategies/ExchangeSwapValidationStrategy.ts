import { CCXTStep, ExchangeId, ExchangeSwapConfigCodec } from "../../types";
import {
   ERR_EXCHANGE_SERVICE_NOT_FOUND,
   ERR_EXCHANGE_UNSUPPORTED_MARKET,
   ERR_INVALID_STEP_CONFIG,
   ERR_UNSUPPORTED_EXCHANGE,
} from "../../constants";
import { ValidationError } from "../ValidationError";
import { IExchangeServiceRepo } from "../../exchanges";
import { TypeOf } from "io-ts";
import { IStepValidationStrategy } from "./IStepValidationStrategy";
import { injectable } from "tsyringe";

@injectable()
export class ExchangeSwapValidationStrategy implements IStepValidationStrategy {
   constructor(private exchangeServiceRepo: IExchangeServiceRepo) {}

   public async validate(validResult: CCXTStep): Promise<CCXTStep> {
      const config = validResult.config as TypeOf<
         typeof ExchangeSwapConfigCodec
      >;

      // Validate exchange
      this.validateExchange(config.exchange);

      // Validate market
      this.validateMarket(
         config.base,
         config.quote,
         config.exchange as ExchangeId
      );

      return validResult;
   }

   private validateExchange(exchange: string): void {
      if (!new Set(Object.values(ExchangeId)).has(exchange as ExchangeId)) {
         throw new ValidationError(
            this.prependGeneralError(ERR_UNSUPPORTED_EXCHANGE(exchange))
         );
      }
   }

   private validateMarket(
      base: string,
      quote: string,
      exchangeId: ExchangeId
   ): void {
      const exchangeService =
         this.exchangeServiceRepo.getExchangeService(exchangeId);

      if (!exchangeService) {
         throw new ValidationError(
            this.prependGeneralError(ERR_EXCHANGE_SERVICE_NOT_FOUND(exchangeId))
         );
      }

      const normalizedBase = base.trim().toUpperCase();
      const normalizedQuote = quote.trim().toUpperCase();

      const symbol = `${normalizedBase}/${normalizedQuote}`;

      if (!exchangeService.isMarketSupported(symbol)) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_EXCHANGE_UNSUPPORTED_MARKET(exchangeId, symbol)
            )
         );
      }
   }

   private prependGeneralError(specificError: string): string {
      return `${ERR_INVALID_STEP_CONFIG}: ${specificError}`;
   }
}
