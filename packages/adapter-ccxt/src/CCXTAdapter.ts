import { autoInjectable } from "tsyringe";
import { IAdapter, IConfigLoader, Step, AdapterConfig } from "@mate/sdk";
import { ExecutionResult } from "./ExecutionResult";
import { CCXTStepConfig } from "./CCXTStepConfig";
import {
   ADAPTER_CONFIG_NOT_FOUND,
   ADAPTER_FAILED_INITIALIZE,
} from "./constants";
import { IValidator } from "./validation";
import { CCXTAdapterConfig } from "./CCXTAdapterConfig";
import { ApiCredentials, ExchangeId } from "./types";
import { IExchangeApiService, IExchangeFactory } from "./exchanges";

@autoInjectable()
export class CCXTAdapter implements IAdapter<ExecutionResult, CCXTStepConfig> {
   private exchangeServices: Map<ExchangeId, IExchangeApiService>;
   private adapterConfig: CCXTAdapterConfig;

   public adapterId: string = "ccxt";

   constructor(
      private adapterConfigValidator: IValidator<CCXTAdapterConfig>,
      private stepConfigValidator: IValidator<CCXTStepConfig>,
      private configLoader: IConfigLoader,
      private exchangeFactory: IExchangeFactory
   ) {
      this.exchangeServices = new Map<ExchangeId, IExchangeApiService>();
   }

   public async init(): Promise<Boolean> {
      const config: AdapterConfig | null = this.configLoader.getAdapterConfig(
         this.adapterId
      );

      if (!config) {
         throw new Error(
            `${ADAPTER_FAILED_INITIALIZE}: ${ADAPTER_CONFIG_NOT_FOUND}`
         );
      }

      try {
         this.adapterConfig = this.adapterConfigValidator.validate(config);

         // for each exchange in the config, initialize the exchange then add to collection of exchange services.
         for (const [exchangeId, exchangeConfig] of Object.entries(
            this.adapterConfig.exchanges
         ) as Array<[ExchangeId, ApiCredentials]>) {
            const exchangeService = this.exchangeFactory.createExchangeService(
               exchangeId,
               exchangeConfig
            );
            this.exchangeServices.set(exchangeId, exchangeService);
         }
      } catch (err: any) {
         throw new Error(`${ADAPTER_FAILED_INITIALIZE}: ${err.message}`);
      }

      // TODO: Will be removed once step confiv validation is implemented.
      //       This is just here to stop the compiler from complaining.
      const stepConfigValidationResult =
         this.stepConfigValidator.validate(config);
      console.log(stepConfigValidationResult);

      return Promise.resolve(true);
   }

   public supportsStep(step: Step<CCXTStepConfig>): Boolean {
      console.log(step);
      throw new Error("Method not implemented.");
   }
   public isValid(step: Step<CCXTStepConfig>): Boolean {
      console.log(step);
      throw new Error("Method not implemented.");
   }
   public execute(step: Step<CCXTStepConfig>): Promise<ExecutionResult> {
      console.log(step);
      throw new Error("Method not implemented.");
   }
}
