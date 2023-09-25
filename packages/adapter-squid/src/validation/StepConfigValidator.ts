import { ChainData, Squid, TokenData } from "@0xsquid/sdk";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import {
   ERR_INVALID_STEP_CONFIG,
   ERR_UNSUPPORTED_CHAIN,
   ERR_UNSUPPORTED_STEP,
   IValidator,
   ValidationError,
} from "@mate/sdk";
import { BridgeSwapStepCodec, SquidStep, StepType } from "../types";
import { ISquidProvider } from "../providers";

export class StepConfigValidator implements IValidator<SquidStep> {
   constructor(private SquidProvider: ISquidProvider) {}

   // TODO: Validation to do
   // - Verify from and to chains are supported -> squid.chains should contain normalised chain id
   // - Verify from and to tokens are supported -> squid.tokens should contain token address
   // - Verify from chain supports from token
   // - Verify to chain supports to token
   // - Verify from address has enough balance of from token > from amount

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
      const squid = this.SquidProvider.getSquid();

      this.validateChains(validResult, squid);
      this.validateTokens(validResult, squid);

      switch (validResult.type) {
         case StepType.BridgeSwap:
            break;

         default:
            throw new ValidationError(
               this.prependGeneralError(ERR_UNSUPPORTED_STEP(validResult.type))
            );
      }

      return validResult;
   }

   private validateTokens(stepConfig: SquidStep, squid: Squid): void {
      const tokens = squid.tokens as TokenData[];

      // Verify fromToken is supported
      if (
         !tokens.find(
            (token) =>
               token.address === stepConfig.config.from_token &&
               token.chainId === stepConfig.config.from_chain
         )
      ) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_CHAIN(stepConfig.config.from_token)
            )
         );
      }

      // Verify toToken is supported
      if (
         !tokens.find(
            (token) =>
               token.address === stepConfig.config.to_token &&
               token.chainId === stepConfig.config.to_chain
         )
      ) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_CHAIN(stepConfig.config.to_token)
            )
         );
      }
   }

   private validateChains(stepConfig: SquidStep, squid: Squid): void {
      const chains = squid.chains as ChainData[];

      // Validate from chain
      if (
         !chains.find((chain) => chain.chainId === stepConfig.config.from_chain)
      ) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_CHAIN(stepConfig.config.from_chain)
            )
         );
      }

      // Validate to chain
      if (
         !chains.find((chain) => chain.chainId === stepConfig.config.to_chain)
      ) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_CHAIN(stepConfig.config.to_chain)
            )
         );
      }
   }

   private prependGeneralError(specificError: string): string {
      return `${ERR_INVALID_STEP_CONFIG}: ${specificError}`;
   }
}
