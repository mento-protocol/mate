import { inject, injectable } from "tsyringe";
import { MentoStepConfig, DexSwapConfigCodec } from "../types";
import { isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import {
  ERR_INVALID_STEP_CONFIG,
  ERR_UNSUPPORTED_PAIR,
  ISignerService,
  IValidator,
  SignerService,
  ValidationError,
} from "@mate/sdk";
import { Mento } from "@mento-protocol/mento-sdk";

@injectable()
export class StepConfigValidator implements IValidator<MentoStepConfig> {
  constructor(
    @inject(SignerService) private signerService: ISignerService
    ) {}

  public async validate(data: unknown): Promise<MentoStepConfig> {
    // Assumes step config is a DexSwap step. This should be updated when we add more step types.
    const validationResult = DexSwapConfigCodec.decode(data);

    if (isRight(validationResult)) {
      return await this.processValidResult(validationResult.right);
    } else {
      const error = PathReporter.report(validationResult);
      throw new ValidationError(ERR_INVALID_STEP_CONFIG, error);
    }
  }

  public async processValidResult(
    validResult: MentoStepConfig
  ): Promise<MentoStepConfig> {
    this.validatePair(validResult.fromToken, validResult.toToken, validResult.chainId);
    
    return validResult;
  }

  private async validatePair(
    fromToken: string,
    toToken: string,
    chainId: number
  ): Promise<void> {
    const provider = await this.signerService.getSignerForChain(chainId).provider;       
    const mento = await Mento.create(provider);
    const pairs = await mento.getTradeablePairs();
    let pairFound = false;
    for(const pair of pairs) {
        if (
            (
              (pair[0].address.toLowerCase() === fromToken.toLocaleLowerCase() && pair[1].address.toLowerCase === toToken.toLowerCase) ||
              (pair[1].address.toLowerCase() === toToken.toLowerCase() && pair[0].address.toLowerCase() === fromToken.toLowerCase())
            )
          ){
            pairFound = true;
            break;
        }
    } 
    if(!pairFound) {
        throw new ValidationError(
            this.prependGeneralError(ERR_UNSUPPORTED_PAIR(fromToken, toToken))
          );
    }
  }

  private prependGeneralError(specificError: string): string {
    return `${ERR_INVALID_STEP_CONFIG}: ${specificError}`;
 }

}
