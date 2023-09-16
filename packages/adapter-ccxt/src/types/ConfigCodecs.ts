import * as t from "io-ts";
import { StepType } from ".";
import { TypeOf } from "io-ts";

// Codecs used for the structural validation of data in the config source.

/**
 * Codec for individual exchange configurations.
 * This defines the expected structure for configurations associated with specific exchanges,
 * such as their unique identifier, API key, and API secret.
 */
export const ExchangeConfigCodec = t.type({
   id: t.string, // Identifier for the exchange
   api_key: t.string, // API key for authenticating with the exchange
   api_secret: t.string, // API secret key for authenticating with the exchange
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

/**
 * Codec for the Exchange.WithdrawCrypto configuration.
 */
export const ExchangeWithdrawCryptoConfigCodec = t.type({
   exchange: t.string, // Identifier for the exchange
   asset: t.string, // Asset to withdraw e.g. "BTC"
   chain_id: t.string, // Chain identifier for destination chain
   destination_address: t.string, // Destination address
});

/**
 * Codec for the Exchange.WithdrawCrypto step.
 */
export const ExchangeWithdrawCrypto = t.type({
   type: t.literal(StepType.ExchangeWithdrawCrypto),
   adapter: t.literal("ccxt"),
   config: ExchangeWithdrawCryptoConfigCodec,
});

/**
 * Codec for the Exchange.Swap configuration.
 */
export const ExchangeSwapConfigCodec = t.type({
   exchange: t.string,
   from: t.string,
   to: t.string,
   maxSlippageBPS: t.number,
   amount: t.number,
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
