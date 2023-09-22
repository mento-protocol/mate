import { isLeft } from "fp-ts/lib/Either";
import { IValidator } from "@mate/sdk";
import { BridgeSwapStepCodec, SquidStep } from "../types";

export class StepConfigValidator implements IValidator<SquidStep> {
   // TODO: Validation to do
   // - Verify from and to chains are supported -> squid.chains should contain normalised chain id
   // - Verify from and to tokens are supported -> squid.tokens should contain token address
   // - Verify from chain supports from token
   // - Verify to chain supports to token
   // - Verify from address has enough balance of from token > from amount

   public async validate(data: any): Promise<SquidStep> {
      const validationResult = BridgeSwapStepCodec.decode(data);

      if (isLeft(validationResult)) {
      }

      throw new Error("Method not implemented.");
   }
}
