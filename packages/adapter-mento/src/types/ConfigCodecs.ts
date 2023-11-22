import * as t from "io-ts";
import { TypeOf } from "io-ts";

/**
 * Codec for the Bridge.Swap step configuration.
 */
export const MentoSwapConfigCodec = t.type({
   fromToken: t.string,
   fromAmount: t.string,
   toToken: t.string,
   slippage: t.number,
   chainId: t.number,
});

export type MentoStepConfig = TypeOf<typeof MentoSwapConfigCodec>;
