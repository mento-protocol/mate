import { inject, injectable } from "tsyringe";
import { ChainData, Squid, TokenData } from "@0xsquid/sdk";
import { isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import {
   ERR_INVALID_ADDRESS,
   ERR_INVALID_STEP_CONFIG,
   ERR_UNSUPPORTED_CHAIN,
   ERR_UNSUPPORTED_TOKEN,
   IValidator,
   ValidationError,
} from "@mate/sdk";
import { BridgeSwapConfigCodec, SquidStepConfig } from "../types";
import { ISquidProvider, SquidProvider } from "../services";
import { isAddress } from "viem";

@injectable()
export class StepConfigValidator implements IValidator<SquidStepConfig> {
   constructor(@inject(SquidProvider) private squidProvider: ISquidProvider) {}

   public async validate(data: any): Promise<SquidStepConfig> {
      // Assumes step config is a BridgeSwap step. This should be updated when we add more step types.
      const validationResult = BridgeSwapConfigCodec.decode(data);

      if (isRight(validationResult)) {
         return await this.processValidResult(validationResult.right);
      } else {
         const error = PathReporter.report(validationResult);
         throw new ValidationError(ERR_INVALID_STEP_CONFIG, error);
      }
   }

   public async processValidResult(
      validResult: SquidStepConfig
   ): Promise<SquidStepConfig> {
      const squid = this.squidProvider.getSquid();

      this.validateAddress(validResult.fromToken, "fromToken");
      this.validateAddress(validResult.toAddress, "toAddress");
      this.validateAddress(validResult.toToken, "toToken");

      this.validateChains(validResult, squid);

      this.validateTokens(validResult, squid);

      return validResult;
   }

   private validateAddress(address: string, propName: string): void {
      if (!isAddress(address)) {
         throw new ValidationError(
            this.prependGeneralError(ERR_INVALID_ADDRESS(address, propName))
         );
      }
   }

   private validateTokens(stepConfig: SquidStepConfig, squid: Squid): void {
      const tokens = squid.tokens as TokenData[];

      // Verify fromToken is supported on fromChain
      if (
         !tokens.find(
            (token) =>
               token.address === stepConfig.fromToken &&
               token.chainId === stepConfig.fromChain
         )
      ) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_TOKEN(stepConfig.fromToken, stepConfig.fromChain)
            )
         );
      }

      // Verify toToken is supported on toChain
      if (
         !tokens.find(
            (token) =>
               token.address === stepConfig.toToken &&
               token.chainId === stepConfig.toChain
         )
      ) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_TOKEN(stepConfig.toToken, stepConfig.toChain)
            )
         );
      }
   }

   private validateChains(stepConfig: SquidStepConfig, squid: Squid): void {
      const chains = squid.chains as ChainData[];

      // Validate from chain
      if (!chains.find((chain) => chain.chainId === stepConfig.fromChain)) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_CHAIN(stepConfig.fromChain.toString())
            )
         );
      }

      // Validate to chain
      if (!chains.find((chain) => chain.chainId === stepConfig.toChain)) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_UNSUPPORTED_CHAIN(stepConfig.toChain.toString())
            )
         );
      }
   }

   private prependGeneralError(specificError: string): string {
      return `${ERR_INVALID_STEP_CONFIG}: ${specificError}`;
   }
}
