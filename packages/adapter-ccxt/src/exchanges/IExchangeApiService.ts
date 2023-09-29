export interface IExchangeApiService {
   /**
    * Fetches the balance of a specified currency.
    *
    * @param currency - The ISO code of the currency (e.g., "BTC", "ETH", "USD").
    * @returns A Promise that resolves to the balance of the specified currency.
    * @throw Will throw an error if the currency is not supported or if there's an issue fetching the balance.
    */
   getCurrencyBalance(currency: string): Promise<number>;

   /**
    * Determines if the specified asset is supported by the exchange.
    * @param currency - The ISO code of the currency (e.g., "BTC", "ETH", "USD").
    * @returns A Promise that resolves to true if the asset is supported, false otherwise.
    */
   isAssetSupported(asset: string): Promise<boolean>;

   /**
    * Determines if the specified market is supported by the exchange.
    * @param symbol - The symbol of the market (e.g., "BTC/USD", "ETH/BTC", "ETH/USD").
    * @returns A Promise that resolves to true if the market is supported, false otherwise.
    */
   isMarketSupported(symbol: string): Promise<boolean>;
}
