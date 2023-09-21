import { injectable } from "tsyringe";
import { ApiCredentials, ExchangeId } from "../types";
import { IExchangeFactory } from "./IExchangeFactory";
import { IExchangeApiService } from "./IExchangeApiService";
import { BinanceApiService } from "./BinanceApiService";

@injectable()
export class ExchangeFactory implements IExchangeFactory {
   public createExchangeService(
      exchangeId: ExchangeId,
      credentials: ApiCredentials
   ): IExchangeApiService {
      switch (exchangeId) {
         case ExchangeId.BINANCE:
            return new BinanceApiService(credentials);
         default:
            throw new Error(`Unsupported exchange: ${exchangeId}`);
      }
   }
}
