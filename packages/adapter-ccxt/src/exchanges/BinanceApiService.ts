import { injectable } from "tsyringe";
import { Balances, Exchange, binance } from "ccxt";

import { IExchangeApiService } from ".";
import { ApiCredentials } from "../types";
import {
   ERR_API_BALANCE_FETCH_FAILURE,
   ERR_BALANCE_NOT_FOUND,
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

   public async isAssetSupported(asset: string): Promise<boolean> {
      try {
         const normalizedAsset = asset.trim().toUpperCase();
         const markets = await this.exchange.fetchMarkets();
         return markets.some(
            (market) => market.base.toUpperCase() === normalizedAsset
         );
      } catch (error) {
         console.error(`Error fetching markets for Binance: ${error}`);
         return false;
      }
   }

   public async getCurrencyBalance(currency: string): Promise<number> {
      try {
         const balances: Balances = await this.exchange.fetchBalance();
         const currencyBalance = balances[currency];

         if (!currencyBalance) {
            throw new Error(
               `${ERR_API_BALANCE_FETCH_FAILURE(
                  currency
               )}: ${ERR_BALANCE_NOT_FOUND}`
            );
         }
         return Number(currencyBalance.total) || 0;
      } catch (error) {
         throw new Error(`${ERR_API_BALANCE_FETCH_FAILURE(currency)}:${error}`);
      }
   }
}
