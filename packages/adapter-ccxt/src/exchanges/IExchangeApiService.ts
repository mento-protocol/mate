export interface IExchangeApiService {
   /**
    * Fetches the balance of a specified currency.
    *
    * @param {string} currency The ISO code of the currency (e.g., "BTC", "ETH", "USD").
    * @returns {Promise<number>} A Promise that resolves to the balance of the specified currency.
    * @throws {Error} Will throw an error if the currency is not supported or if there's an issue fetching the balance.
    */
   getCurrencyBalance(currency: string): Promise<number>;
}
