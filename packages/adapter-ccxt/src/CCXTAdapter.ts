import { autoInjectable } from "tsyringe";
import {
   ERR_ADAPTER_CONFIG_MISSING,
   ERR_ADAPTER_INIT_FAILURE,
   IAdapter,
   IConfigProvider,
   IValidator,
   Step,
   ValidationResult,
} from "@mate/sdk";
import { ExecutionResult } from "./ExecutionResult";
import {
   ApiCredentials,
   CCXTAdapterConfig,
   CCXTStep,
   ExchangeId,
} from "./types";
import { IExchangeFactory, IExchangeServiceRepo } from "./exchanges";

@autoInjectable()
export class CCXTAdapter implements IAdapter<ExecutionResult, CCXTStep> {
   private adapterConfig: CCXTAdapterConfig;

   public adapterId: string = "ccxt";

   constructor(
      private adapterConfigValidator: IValidator<CCXTAdapterConfig>,
      private stepConfigValidator: IValidator<CCXTStep>,
      private configProvider: IConfigProvider,
      private exchangeFactory: IExchangeFactory,
      private exchangeServiceRepo: IExchangeServiceRepo
   ) {}

   public async init(): Promise<boolean> {
      if (this.adapterConfig) {
         return true; // Already initialized
      }

      const config = this.configProvider.getAdapterConfig(this.adapterId);

      if (!config) {
         throw new Error(
            `${ERR_ADAPTER_INIT_FAILURE}: ${ERR_ADAPTER_CONFIG_MISSING}`
         );
      }

      try {
         this.adapterConfig = await this.adapterConfigValidator.validate(
            config
         );
         await this.initializeExchanges();
      } catch (err: any) {
         throw new Error(`${ERR_ADAPTER_INIT_FAILURE}: ${err.message}`);
      }

      return true;
   }

   public async isValid(step: Step<CCXTStep>): Promise<ValidationResult> {
      let result: ValidationResult = {
         isValid: false,
         errors: [],
      };

      try {
         await this.stepConfigValidator.validate(step);
         result.isValid = true;
      } catch (err) {
         result.errors.push((err as Error).message);
      }

      return result;
   }

   public execute(step: Step<CCXTStep>): Promise<ExecutionResult> {
      console.log(step);
      throw new Error("Method not implemented.");
   }

   private async initializeExchanges(): Promise<void> {
      for (const [exchangeId, exchangeConfig] of Object.entries(
         this.adapterConfig.exchanges
      ) as Array<[ExchangeId, ApiCredentials]>) {
         const exchangeService = this.exchangeFactory.createExchangeService(
            exchangeId,
            exchangeConfig
         );
         this.exchangeServiceRepo.setExchangeService(
            exchangeId,
            exchangeService
         );
      }
   }
}
