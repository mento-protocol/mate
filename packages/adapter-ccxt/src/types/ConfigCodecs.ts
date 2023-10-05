import * as t from "io-ts";
import { StepType } from ".";
import { Side } from "./Side";
import { TypeOf } from "io-ts";

// Codecs used for the structural validation of data in the config source.

/**
 * Codec for individual exchange configurations.
 * This defines the expected structure for configurations associated with specific exchanges,
 * such as their unique identifier, API key, and API secret.
 */
export const ExchangeConfigCodec = t.type({
   id: t.string, // Identifier for the exchange
   apiKey: t.string, // API key for authenticating with the exchange
   apiSecret: t.string, // API secret key for authenticating with the exchange
});

/**
 * Codec for the configuration of the CCXT adapter.
 * It outlines the expected structure for an array of exchange configurations that the
 * CCXT adapter should support.
 */
export const CCXTAdapterConfigCodec = t.type({
   exchanges: t.array(ExchangeConfigCodec), // List of supported exchanges with their configurations
});

/**
 * Codec for general adapter configurations.
 * This captures the expected structure for any adapter configuration, including its
 * unique identifier, the specific adapter it refers to, and its detailed configuration.
 */
export const AdapterConfigCodec = t.type({
   id: t.string, // Identifier for the adapter
   adapter: t.string, // Adapter reference, e.g., "@mate/adapter-ccxt"
   config: CCXTAdapterConfigCodec, // Configuration specific to this adapter
});

// ---- Exchange.Swap ---- //

/**
 * Codec for the Exchange.WithdrawCrypto configuration.
 */
export const ExchangeWithdrawCryptoConfigCodec = t.type({
   exchange: t.string, // Identifier for the exchange
   asset: t.string, // Asset to withdraw e.g. "BTC"
   chainId: t.string, // Chain identifier for destination chain
   destinationAddress: t.string, // Destination address
   amount: t.number, // Amount to withdraw
});

/**
 * Codec for the Exchange.WithdrawCrypto step.
 */
export const ExchangeWithdrawCrypto = t.type({
   type: t.literal(StepType.ExchangeWithdrawCrypto),
   adapter: t.literal("ccxt"),
   config: ExchangeWithdrawCryptoConfigCodec,
});

// ---- Exchange.Swap ---- //

/**
 * Codec for the Exchange.Swap configuration.
 */
export const ExchangeSwapConfigCodec = t.type({
   exchange: t.string, // Identifier for the exchange
   base: t.string, // Base asset e.g. "BTC"
   quote: t.string, // Quote asset e.g. "USDT"
   side: t.union([t.literal(Side.Buy), t.literal(Side.Sell)]), // Side of the order
   maxSlippageBPS: t.number, // Maximum slippage in basis points
   amount: t.number, // Amount to swap
});

/**
 * Codec for the Exchange.Swap step.
 */
export const ExchangeSwap = t.type({
   type: t.literal(StepType.ExchangeSwap),
   adapter: t.literal("ccxt"),
   config: ExchangeSwapConfigCodec,
});

export const CCXTStepConfig = t.union([ExchangeWithdrawCrypto, ExchangeSwap]);

// Types derived from the codecs

//TODO: Consider renaming this.
export type CCXTStep = TypeOf<typeof CCXTStepConfig>;
export type CCXTAdapterConfig = TypeOf<typeof CCXTAdapterConfigCodec>;
