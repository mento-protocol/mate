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
   maxSlippage: t.number,
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
export type SquidAdapterConfig = TypeOf<typeof SquidAdapterConfigCodec>;
