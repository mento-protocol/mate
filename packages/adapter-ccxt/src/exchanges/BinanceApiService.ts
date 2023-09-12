import { injectable } from "tsyringe";
import { Balances, Exchange, binance } from "ccxt";

import { IExchangeApiService } from ".";
import { ApiCredentials } from "../types";
import {
   API_CURRENCY_BALANCE_FETCH_ERROR,
   API_CURRENCY_BALANCE_NOT_FOUND,
} from "../constants";

@injectable()
export class BinanceApiService implements IExchangeApiService {
   private exchange: Exchange;

   constructor(apiCredentials: ApiCredentials) {
      this.exchange = new binance({
         apiKey: apiCredentials.apiKey,
         secret: apiCredentials.apiSecret,
      });
   }

   public async getCurrencyBalance(currency: string): Promise<number> {
      try {
         const balances: Balances = await this.exchange.fetchBalance();
         const currencyBalance = balances[currency];

         if (!currencyBalance) {
            throw new Error(
               `${API_CURRENCY_BALANCE_FETCH_ERROR(
                  currency
               )}: ${API_CURRENCY_BALANCE_NOT_FOUND}`
            );
         }
         return Number(currencyBalance.total) || 0;
      } catch (error) {
         throw new Error(
            `${API_CURRENCY_BALANCE_FETCH_ERROR(currency)}:${error}`
         );
      }
   }
}
