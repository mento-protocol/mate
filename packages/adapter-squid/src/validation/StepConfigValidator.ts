import { ChainData, Squid, TokenData } from "@0xsquid/sdk";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import {
   ERR_INVALID_STEP_CONFIG,
   ERR_UNSUPPORTED_CHAIN,
   IValidator,
   ValidationError,
} from "@mate/sdk";
import { BridgeSwapStepCodec, SquidStep } from "../types";
import { ISquidProvider } from "../providers";

export class StepConfigValidator implements IValidator<SquidStep> {
   constructor(private squidProvider: ISquidProvider) {}

   public async validate(data: any): Promise<SquidStep> {
      const validationResult = BridgeSwapStepCodec.decode(data);

      if (isRight(validationResult)) {
         return await this.processValidResult(validationResult.right);
      }

      if (isLeft(validationResult)) {
         throw new ValidationError(
            ERR_INVALID_STEP_CONFIG,
            PathReporter.report(validationResult)
         );
      }

      throw new Error("Method not implemented.");
   }

   public async processValidResult(validResult: SquidStep): Promise<SquidStep> {
      const squid = this.squidProvider.getSquid();

      this.validateChains(validResult, squid);
      this.validateTokens(validResult, squid);

      return validResult;
   }

   private validateTokens(stepConfig: SquidStep, squid: Squid): void {
      const tokens = squid.tokens as TokenData[];

      // Verify fromToken is supported
      if (
         !tokens.find(
            (token) =>
               token.address === stepConfig.config.fromToken &&
               token.chainId === stepConfig.config.fromChain
         )
      ) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_CHAIN(stepConfig.config.fromToken)
            )
         );
      }

      // Verify toToken is supported
      if (
         !tokens.find(
            (token) =>
               token.address === stepConfig.config.toToken &&
               token.chainId === stepConfig.config.toChain
         )
      ) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_CHAIN(stepConfig.config.toToken)
            )
         );
      }
   }

   private validateChains(stepConfig: SquidStep, squid: Squid): void {
      const chains = squid.chains as ChainData[];

      // Validate from chain
      if (
         !chains.find((chain) => chain.chainId === stepConfig.config.fromChain)
      ) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_CHAIN(stepConfig.config.fromChain.toString())
            )
         );
      }

      // Validate to chain
      if (
         !chains.find((chain) => chain.chainId === stepConfig.config.toChain)
      ) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_CHAIN(stepConfig.config.toChain.toString())
            )
         );
      }
   }

   private prependGeneralError(specificError: string): string {
      return `${ERR_INVALID_STEP_CONFIG}: ${specificError}`;
   }
}
