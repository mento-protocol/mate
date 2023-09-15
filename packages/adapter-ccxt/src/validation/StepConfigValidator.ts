import { injectable } from "tsyringe";
import { IValidator } from "./IValidator";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { ValidationError } from "./ValidationError";
import { CCXTStep, CCXTStepConfig, ExchangeId, StepType } from "../types";
import {
   ASSET_NOT_SUPPORTED_BY_EXCHANGE,
   INVALID_STEP_CONFIGURATION,
   UNSUPPORTED_EXCHANGE_ERROR,
   UNSUPPORTED_STEP_TYPE,
} from "../constants";
import { IExchangeServiceRepo } from "../exchanges";

@injectable()
export class CCXTStepValidator implements IValidator<CCXTStep> {
   constructor(private exchangeServiceRepo: IExchangeServiceRepo) {}

   public validate(data: any): CCXTStep {
      const validationResult = CCXTStepConfig.decode(data);

      if (isRight(validationResult)) {
         return this.processValidResult(validationResult.right);
      } else if (isLeft(validationResult)) {
         throw new ValidationError(
            INVALID_STEP_CONFIGURATION,
            PathReporter.report(validationResult)
         );
      } else {
         throw new Error(INVALID_STEP_CONFIGURATION);
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
                  `${INVALID_STEP_CONFIGURATION}. ${UNSUPPORTED_EXCHANGE_ERROR(
                     validResult.config.exchange
                  )}`
               );
            }

            if (!exchangeService.isAssetSupported(validResult.config.asset)) {
               throw new Error(
                  `${INVALID_STEP_CONFIGURATION}. ${ASSET_NOT_SUPPORTED_BY_EXCHANGE(
                     validResult.config.exchange,
                     validResult.config.asset
                  )}`
               );
            }

            break;
         default:
            throw new Error(
               `${INVALID_STEP_CONFIGURATION}. ${UNSUPPORTED_STEP_TYPE(
                  validResultStepType
               )}`
            );
      }

      return validResult;
   }
}
