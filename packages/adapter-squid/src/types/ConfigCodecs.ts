import * as t from "io-ts";
import { TypeOf } from "io-ts";
import { StepType } from ".";

/**
 * Codec for the Squid adapter configuration.
 */
export const SquidAdapterConfigCodec = t.type({
   integratorId: t.string,
   baseUrl: t.string,
});

/**
 * Codec for the Bridge.Swap step configuration.
 */
export const BridgeSwapConfigCodec = t.type({
   fromChain: t.number,
   fromToken: t.string,
   fromAmount: t.string,
   toChain: t.number,
   toToken: t.string,
   toAddress: t.string,
   slippage: t.number,
});

/**
 * Codec for the Bridge.Swap step.
 */
export const BridgeSwapStepCodec = t.type({
   type: t.literal(StepType.BridgeSwap),
   adapter: t.literal("squid"),
   config: BridgeSwapConfigCodec,
});

// This assumes we will only ever have one step type for the Squid adapter.
// When we add more, this type should be updated to be a union of all the step type configs.
export type SquidStepConfig = TypeOf<typeof BridgeSwapConfigCodec>;
export type SquidAdapterConfig = TypeOf<typeof SquidAdapterConfigCodec>;
export type BridgeSwapConfig = TypeOf<typeof BridgeSwapConfigCodec>;
