import { injectable } from "tsyringe";
import { ApiCredentials, ExchangeId } from "../types";
import { IExchangeFactory } from "./IExchangeFactory";
import { IExchangeApiService } from "./IExchangeApiService";
import { BinanceApiService } from "./BinanceApiService";
import { binance } from "ccxt";

@injectable()
export class ExchangeFactory implements IExchangeFactory {
   public createExchangeService(
      exchangeId: ExchangeId,
      credentials: ApiCredentials
   ): IExchangeApiService {
      switch (exchangeId) {
         case ExchangeId.BINANCE:
            const exchange = new binance({
               apiKey: credentials.apiKey,
               secret: credentials.apiSecret,
            });
            return new BinanceApiService(exchange);
         default:
            throw new Error(`Unsupported exchange: ${exchangeId}`);
      }
   }
}
