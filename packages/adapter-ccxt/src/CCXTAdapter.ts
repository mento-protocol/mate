import { autoInjectable } from "tsyringe";
import {
   IAdapter,
   IConfigProvider,
   Step,
   AdapterConfig,
   ValidationResult,
} from "@mate/sdk";
import { ExecutionResult } from "./ExecutionResult";
import { IValidator } from "./validation";
import { CCXTAdapterConfig } from "./CCXTAdapterConfig";
import { ApiCredentials, CCXTStep, ExchangeId } from "./types";
import { IExchangeFactory, IExchangeServiceRepo } from "./exchanges";
import {
   ERR_ADAPTER_CONFIG_MISSING,
   ERR_ADAPTER_INIT_FAILURE,
} from "./constants";

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

   public async init(): Promise<Boolean> {
      const config: AdapterConfig | null = this.configProvider.getAdapterConfig(
         this.adapterId
      );

      if (!config) {
         throw new Error(
            `${ERR_ADAPTER_INIT_FAILURE}: ${ERR_ADAPTER_CONFIG_MISSING}`
         );
      }

      try {
         this.adapterConfig = await this.adapterConfigValidator.validate(
            config
         );

         // for each exchange in the config, initialize the exchange then.
         for (const [exchangeId, exchangeConfig] of Object.entries(
            this.adapterConfig.exchanges
         ) as Array<[ExchangeId, ApiCredentials]>) {
            const exchangeService = this.exchangeFactory.createExchangeService(
               exchangeId,
               exchangeConfig
            );

            // Add the exchange service to the repo to allow for retrieval later in other steps or parts of the adapter.
            this.exchangeServiceRepo.setExchangeService(
               exchangeId,
               exchangeService
            );
         }
      } catch (err: any) {
         throw new Error(`${ERR_ADAPTER_INIT_FAILURE}: ${err.message}`);
      }

      return Promise.resolve(true);
   }

   //TODO: CCXTStep type is not correct.
   //TODO: Refactor, do not need to prefix everyting with CCXT.

   public isValid(step: Step<CCXTStep>): ValidationResult {
      let result: ValidationResult = {
         isValid: false,
         errors: [],
      };

      try {
         this.stepConfigValidator.validate(step);
      } catch (err) {
         result.errors?.push((err as Error).message);
         result.isValid;

         return result;
      }

      // If the validator does not throw an error then the step is valid.
      result.isValid = true;

      return result;
   }

   public execute(step: Step<CCXTStep>): Promise<ExecutionResult> {
      console.log(step);
      throw new Error("Method not implemented.");
   }
}
