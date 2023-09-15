import { injectable } from "tsyringe";
import { IValidator } from "./IValidator";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { ValidationError } from "./ValidationError";
import { CCXTStep, CCXTStepConfig, ExchangeId, StepType } from "../types";
import { IExchangeServiceRepo } from "../exchanges";
import {
   ERR_ASSET_UNSUPPORTED_ON_EXCHANGE,
   ERR_INVALID_STEP_CONFIG,
   ERR_UNSUPPORTED_EXCHANGE,
   ERR_UNSUPPORTED_STEP,
} from "../constants";

@injectable()
export class CCXTStepValidator implements IValidator<CCXTStep> {
   constructor(private exchangeServiceRepo: IExchangeServiceRepo) {}

   public validate(data: any): CCXTStep {
      const validationResult = CCXTStepConfig.decode(data);

      if (isRight(validationResult)) {
         return this.processValidResult(validationResult.right);
      } else if (isLeft(validationResult)) {
         throw new ValidationError(
            ERR_INVALID_STEP_CONFIG,
            PathReporter.report(validationResult)
         );
      } else {
         throw new Error(ERR_INVALID_STEP_CONFIG);
      }
   }

   private processValidResult(validResult: CCXTStep): CCXTStep {
      const validResultStepType = validResult.type;

      switch (validResultStepType) {
         case StepType.ExchangeWithdrawCrypto:
            const exchangeService = this.exchangeServiceRepo.getExchangeService(
               validResult.config.exchange as ExchangeId
            );

            //TODO: Accurate? Message could be exchange service was not found. It's not possible to get unsupported exchange here.
            if (!exchangeService) {
               throw new Error(
                  `${ERR_INVALID_STEP_CONFIG}. ${ERR_UNSUPPORTED_EXCHANGE(
                     validResult.config.exchange
                  )}`
               );
            }

            if (!exchangeService.isAssetSupported(validResult.config.asset)) {
               throw new Error(
                  `${ERR_INVALID_STEP_CONFIG}. ${ERR_ASSET_UNSUPPORTED_ON_EXCHANGE(
                     validResult.config.exchange,
                     validResult.config.asset
                  )}`
               );
            }

            break;
         default:
            throw new Error(
               `${ERR_INVALID_STEP_CONFIG}. ${ERR_UNSUPPORTED_STEP(
                  validResultStepType
               )}`
            );
      }

      return validResult;
   }
}
