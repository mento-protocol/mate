import * as t from "io-ts";
import { TypeOf } from "io-ts";
import { StepType } from ".";

/**
 * Codec for the Bridge.Swap step configuration.
 */
export const BridgeSwapConfigCodec = t.type({
   from_chain: t.string,
   from_token: t.string,
   from_address: t.string,
   to_chain: t.string,
   to_token: t.string,
   to_address: t.string,
   amount: t.number,
   max_slippage: t.number,
});

/**
 * Codec for the Bridge.Swap step.
 */
export const BridgeSwapStepCodec = t.type({
   type: t.literal(StepType.BridgeSwap),
   adapter: t.literal("squid"),
   config: BridgeSwapConfigCodec,
});

export type SquidStep = TypeOf<typeof BridgeSwapStepCodec>;
