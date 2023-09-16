import { injectable } from "tsyringe";
import { IValidator } from "./IValidator";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { ValidationError } from "./ValidationError";
import {
   CCXTStep,
   CCXTStepConfig,
   ChainId,
   ExchangeId,
   StepType,
} from "../types";
import { IExchangeServiceRepo } from "../exchanges";
import {
   ERR_ASSET_UNSUPPORTED_ON_EXCHANGE,
   ERR_INVALID_STEP_CONFIG,
   ERR_UNSUPPORTED_CHAIN,
   ERR_UNSUPPORTED_EXCHANGE,
   ERR_UNSUPPORTED_STEP,
} from "../constants";

@injectable()
export class StepConfigValidator implements IValidator<CCXTStep> {
   private chainIdSet = new Set(Object.values(ChainId));
   private exchangeIdSet = new Set(Object.values(ExchangeId));

   constructor(private exchangeServiceRepo: IExchangeServiceRepo) {}

   public validate(data: any): CCXTStep {
      const validationResult = CCXTStepConfig.decode(data);

      if (isRight(validationResult)) {
         return this.processValidResult(validationResult.right);
      }

      if (isLeft(validationResult)) {
         throw new ValidationError(
            ERR_INVALID_STEP_CONFIG,
            PathReporter.report(validationResult)
         );
      }

      throw new Error(this.prependGeneralError(ERR_INVALID_STEP_CONFIG));
   }

   private processValidResult(validResult: CCXTStep): CCXTStep {
      switch (validResult.type) {
         case StepType.ExchangeWithdrawCrypto:
            this.validateEnumValue(
               validResult.config.exchange,
               this.exchangeIdSet,
               ERR_UNSUPPORTED_EXCHANGE
            );
            this.validateEnumValue(
               validResult.config.chain_id,
               this.chainIdSet,
               ERR_UNSUPPORTED_CHAIN
            );
            this.validateExchangeAsset(
               validResult.config.asset,
               validResult.config.exchange as ExchangeId
            );
            break;
         default:
            throw new ValidationError(
               this.prependGeneralError(ERR_UNSUPPORTED_STEP(validResult.type))
            );
      }

      return validResult;
   }

   private validateEnumValue(
      value: string,
      validSet: Set<string>,
      errorFunc: (val: string) => string
   ): void {
      if (!validSet.has(value)) {
         throw new ValidationError(this.prependGeneralError(errorFunc(value)));
      }
   }

   private validateExchangeAsset(asset: string, exchange: ExchangeId): void {
      const exchangeService =
         this.exchangeServiceRepo.getExchangeService(exchange);

      if (!exchangeService) {
         throw new ValidationError(
            this.prependGeneralError(ERR_UNSUPPORTED_EXCHANGE(exchange))
         );
      }

      if (!exchangeService.isAssetSupported(asset)) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_ASSET_UNSUPPORTED_ON_EXCHANGE(asset, exchange)
            )
         );
      }
   }

   private prependGeneralError(specificError: string): string {
      return `${ERR_INVALID_STEP_CONFIG}. ${specificError}`;
   }
}
