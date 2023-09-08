import * as t from "io-ts";

// Type for individual exchange configurations using CCXT.
export const CCXTExchangeConfigType = t.type({
   id: t.string,
   api_key: t.string,
   api_secret: t.string,
});

// Type for the CCXT adapter configuration containing multiple exchange configurations.
export const CCXTAdapterConfigType = t.type({
   exchanges: t.array(CCXTExchangeConfigType),
});

// Type for individual adapter configurations.
export const AdapterType = t.type({
   id: t.string,
   adapter: t.string,
   config: CCXTAdapterConfigType,
});
