import { autoInjectable } from "tsyringe";
import { IAdapter, IConfigProvider, Step, AdapterConfig } from "@mate/sdk";
import { ExecutionResult } from "./ExecutionResult";
import { CCXTStepConfig } from "./CCXTStepConfig";
import {
   ADAPTER_CONFIG_NOT_FOUND,
   ADAPTER_FAILED_INITIALIZE,
} from "./constants";
import { IValidator } from "./validation";
import { CCXTAdapterConfig } from "./CCXTAdapterConfig";
import { ApiCredentials, CCXTStep, ExchangeId } from "./types";
import { IExchangeFactory, IExchangeServiceRepo } from "./exchanges";

@autoInjectable()
export class CCXTAdapter implements IAdapter<ExecutionResult, CCXTStep> {
   private adapterConfig: CCXTAdapterConfig;

   public adapterId: string = "ccxt";

   constructor(
      private adapterConfigValidator: IValidator<CCXTAdapterConfig>,
      private stepConfigValidator: IValidator<CCXTStepConfig>,
      private configProvider: IConfigProvider,
      private exchangeFactory: IExchangeFactory,
      private exchangeServiceRepo: IExchangeServiceRepo
   ) {}

   public async init(): Promise<Boolean> {
      const config: AdapterConfig | null = this.configProvider.getAdapterConfig(
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

            // Add the exchange service to the repo to allow for retrieval later in other steps.
            this.exchangeServiceRepo.setExchangeService(
               exchangeId,
               exchangeService
            );
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

   public supportsStep(step: Step<CCXTStep>): Boolean {
      console.log(step);
      throw new Error("Method not implemented.");
   }
   public isValid(step: Step<CCXTStep>): Boolean {
      console.log(step);
      throw new Error("Method not implemented.");
   }
   public execute(step: Step<CCXTStep>): Promise<ExecutionResult> {
      console.log(step);
      throw new Error("Method not implemented.");
   }
}
