import { Balances, binance } from "ccxt";
import { IExchangeApiService } from ".";
import {
   ERR_API_BALANCE_FETCH_FAILURE,
   ERR_API_FETCH_DEPOSIT_ADDRESS_FAILURE,
   ERR_API_FETCH_MARKETS_FAILURE,
   ERR_BALANCE_NOT_FOUND,
} from "../constants";
import { ChainId } from "../types";
import { ERR_UNSUPPORTED_CHAIN } from "@mate/sdk";

export class BinanceApiService implements IExchangeApiService {
   constructor(private exchange: binance) {}

   public async isAssetSupported(asset: string): Promise<boolean> {
      try {
         const normalizedAsset = asset.trim().toUpperCase();
         const markets = await this.exchange.fetchMarkets();
         return markets.some(
            (market) => market.base.toUpperCase() === normalizedAsset
         );
      } catch (error) {
         throw new Error(
            `${ERR_API_FETCH_MARKETS_FAILURE(this.exchange.id)}:${error}`
         );
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

   public async isMarketSupported(symbol: string): Promise<boolean> {
      try {
         const markets = await this.exchange.fetchMarkets();
         const matchingMarket = markets.find(
            (market) => market.symbol === symbol
         );
         return matchingMarket !== undefined;
      } catch (error) {
         throw new Error(
            `${ERR_API_FETCH_MARKETS_FAILURE(this.exchange.id)}:${error}`
         );
      }
   }

   public async getDepositAddress(
      currency: string,
      chainId: ChainId
   ): Promise<string> {
      try {
         const depositNetwork = this.getNetworkFromChainId(chainId);
         const depositAddressInfo = await this.exchange.fetchDepositAddress(
            currency,
            { network: depositNetwork }
         );

         return depositAddressInfo.address;
      } catch (error) {
         throw new Error(
            `${ERR_API_FETCH_DEPOSIT_ADDRESS_FAILURE(
               currency,
               chainId
            )}:${error}`
         );
      }
   }

   private getNetworkFromChainId(chainId: ChainId): string {
      // Needed to determine network param based on chainId
      // See https://docs.ccxt.com/#/?id=deposit-and-withdrawal-networks
      switch (chainId) {
         case ChainId.ETHEREUM:
            return "ERC20";
         case ChainId.CELO:
            return "CELO";
         default:
            throw new Error(ERR_UNSUPPORTED_CHAIN(chainId));
      }
   }
}
