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
   ERR_EXCHANGE_SERVICE_NOT_FOUND,
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

   public async validate(data: any): Promise<CCXTStep> {
      const validationResult = CCXTStepConfig.decode(data);

      if (isRight(validationResult)) {
         return await this.processValidResult(validationResult.right);
      }

      if (isLeft(validationResult)) {
         //TODO: Think about extracting specific error messages from the PathReporter
         throw new ValidationError(
            ERR_INVALID_STEP_CONFIG,
            PathReporter.report(validationResult)
         );
      }

      throw new Error(this.prependGeneralError(ERR_INVALID_STEP_CONFIG));
   }

   private async processValidResult(validResult: CCXTStep): Promise<CCXTStep> {
      //TODO: Refactor to use strategies for validation so we can add new step types without modifying this.
      switch (validResult.type) {
         case StepType.ExchangeWithdrawCrypto:
            // Validate exchange
            this.validateEnumValue(
               validResult.config.exchange,
               this.exchangeIdSet,
               ERR_UNSUPPORTED_EXCHANGE
            );

            // Validate chain
            this.validateEnumValue(
               validResult.config.chain_id,
               this.chainIdSet,
               ERR_UNSUPPORTED_CHAIN
            );

            // Validate asset
            await this.validateExchangeAsset(
               validResult.config.asset,
               validResult.config.exchange as ExchangeId
            );
            break;
         default:
            // This should only happen if a new step type is added without updating this code.
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

   private async validateExchangeAsset(
      asset: string,
      exchange: ExchangeId
   ): Promise<void> {
      const exchangeService =
         this.exchangeServiceRepo.getExchangeService(exchange);

      if (!exchangeService) {
         throw new ValidationError(
            this.prependGeneralError(ERR_EXCHANGE_SERVICE_NOT_FOUND(exchange))
         );
      }

      const isSupported = await exchangeService.isAssetSupported(asset);

      if (!isSupported) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_ASSET_UNSUPPORTED_ON_EXCHANGE(asset, exchange)
            )
         );
      }
   }

   private prependGeneralError(specificError: string): string {
      return `${ERR_INVALID_STEP_CONFIG}: ${specificError}`;
   }
}
