import {
   ERR_INVALID_ADAPTER_CONFIG,
   IValidator,
   ValidationError,
} from "@mate/sdk";
import { injectable } from "tsyringe";
import { SquidAdapterConfig, SquidAdapterConfigCodec } from "../types";
import { isRight, isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";

@injectable()
export class AdapterConfigValidator implements IValidator<SquidAdapterConfig> {
   public async validate(data: any): Promise<SquidAdapterConfig> {
      const validationResult = SquidAdapterConfigCodec.decode(data);

      if (isRight(validationResult)) {
         return validationResult.right;
      } else if (isLeft(validationResult)) {
         throw new ValidationError(
            ERR_INVALID_ADAPTER_CONFIG,
            PathReporter.report(validationResult)
         );
      } else {
         throw new Error(ERR_INVALID_ADAPTER_CONFIG);
      }
   }
}
