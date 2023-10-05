import { injectable } from "tsyringe";
import { ExchangeId } from "../types";
import { IExchangeApiService } from "./IExchangeApiService";
import { IExchangeServiceRepo } from "./IExchangeServiceRepo";

@injectable()
export class ExchangeServiceRepo implements IExchangeServiceRepo {
   private exchangeServices: Map<ExchangeId, IExchangeApiService>;

   constructor() {
      this.exchangeServices = new Map<ExchangeId, IExchangeApiService>();
   }

   public setExchangeService(
      exchangeId: ExchangeId,
      service: IExchangeApiService
   ) {
      this.exchangeServices.set(exchangeId, service);
   }

   public getExchangeService(
      exchangeId: ExchangeId
   ): IExchangeApiService | undefined {
      return this.exchangeServices.get(exchangeId);
   }
}
