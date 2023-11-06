import { inject, injectable } from "tsyringe";
import { IValidator } from "./IValidator";
import { isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { ValidationError } from "./ValidationError";
import { CCXTStep, CCXTStepConfig, StepType } from "../types";
import { VALIDATION_STRATEGIES_TOKEN } from "../constants";
import { ERR_INVALID_STEP_CONFIG, ERR_UNSUPPORTED_STEP } from "@mate/sdk";
import { IStepValidationStrategy } from "./strategies";

@injectable()
export class StepConfigValidator implements IValidator<CCXTStep> {
   constructor(
      @inject(VALIDATION_STRATEGIES_TOKEN)
      private strategies: Map<StepType, IStepValidationStrategy>
   ) {}

   public async validate(data: unknown): Promise<CCXTStep> {
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
      const strategy = this.strategies.get(validResult.type);

      if (strategy) {
         return strategy.validate(validResult);
      }

      throw new ValidationError(
         this.prependGeneralError(ERR_UNSUPPORTED_STEP(validResult.type))
      );
   }

   private prependGeneralError(specificError: string): string {
      return `${ERR_INVALID_STEP_CONFIG}: ${specificError}`;
   }
}
