import * as t from "io-ts";

// Codecs used for the validation of data in the config source.

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

// Types derived from the codecs.

// Type for the CCXT adapter configuration.
// export type CCXTAdapterConfig = t.TypeOf<typeof CCXTAdapterConfigCodec>;
