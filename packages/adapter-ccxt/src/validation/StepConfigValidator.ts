import { injectable } from "tsyringe";
import {
   IValidator,
   ValidationError,
   ERR_INVALID_STEP_CONFIG,
   ERR_UNSUPPORTED_STEP,
   ERR_UNSUPPORTED_CHAIN,
   ERR_INVALID_ADDRESS,
} from "@mate/sdk";
import { isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
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
   ERR_UNSUPPORTED_EXCHANGE,
} from "../constants";
import { isAddress } from "viem";

@injectable()
export class StepConfigValidator implements IValidator<CCXTStep> {
   private chainIdSet = new Set(Object.values(ChainId));
   private exchangeIdSet = new Set(Object.values(ExchangeId));

   constructor(private exchangeServiceRepo: IExchangeServiceRepo) {}

   public async validate(data: any): Promise<CCXTStep> {
      const validationResult = CCXTStepConfig.decode(data);

      if (isRight(validationResult)) {
         return await this.processValidResult(validationResult.right);
      } else {
         throw new ValidationError(
            ERR_INVALID_STEP_CONFIG,
            PathReporter.report(validationResult)
         );
      }
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
               validResult.config.chainId,
               this.chainIdSet,
               ERR_UNSUPPORTED_CHAIN
            );

            // Validate asset
            await this.validateExchangeAsset(
               validResult.config.asset,
               validResult.config.exchange as ExchangeId
            );

            //Validate address
            this.validateAddress(validResult.config.destinationAddress);

            break;
         default:
            // This should only happen if a new step type is added without updating this code.
            throw new ValidationError(
               this.prependGeneralError(ERR_UNSUPPORTED_STEP(validResult.type))
            );
      }

      return validResult;
   }

   private validateAddress(address: string): void {
      if (!isAddress(address)) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_INVALID_ADDRESS(address, "destinationAddress")
            )
         );
      }
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
