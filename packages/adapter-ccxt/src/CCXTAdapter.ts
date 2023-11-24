import { inject, injectable } from "tsyringe";
import {
   ConfigProvider,
   ERR_ADAPTER_CONFIG_MISSING,
   ERR_ADAPTER_INIT_FAILURE,
   ExecutionResult,
   IAdapter,
   IConfigProvider,
   IValidator,
   Step,
   ValidationResult,
} from "@mate/sdk";
import {
   ApiCredentials,
   CCXTAdapterConfig,
   CCXTStep,
   ExchangeId,
} from "./types";
import {
   ExchangeFactory,
   ExchangeServiceRepo,
   IExchangeFactory,
   IExchangeServiceRepo,
} from "./exchanges";
import { AdapterConfigValidator, StepConfigValidator } from "./validation";

@injectable()
export class CCXTAdapter implements IAdapter<ExecutionResult, CCXTStep> {
   private adapterConfig: CCXTAdapterConfig;

   public adapterId: string = "ccxt";

   constructor(
      @inject(AdapterConfigValidator)
      private adapterConfigValidator: IValidator<CCXTAdapterConfig>,
      @inject(StepConfigValidator)
      private stepConfigValidator: IValidator<CCXTStep>,
      @inject(ConfigProvider) private configProvider: IConfigProvider,
      @inject(ExchangeFactory) private exchangeFactory: IExchangeFactory,
      @inject(ExchangeServiceRepo)
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
         this.initializeExchanges();
      } catch (err) {
         if (err instanceof Error) {
            throw new Error(`${ERR_ADAPTER_INIT_FAILURE}: ${err.message}`);
         } else {
            throw new Error(`${ERR_ADAPTER_INIT_FAILURE}: ${err}`);
         }
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

   private initializeExchanges(): void {
      this.adapterConfig.exchanges.forEach((exchangeConfig) => {
         if (!exchangeConfig) {
            return;
         }

         const { id, apiKey, apiSecret } = exchangeConfig;
         const exchangeCreds: ApiCredentials = { apiKey, apiSecret };

         const exchangeService = this.exchangeFactory.createExchangeService(
            id as ExchangeId,
            exchangeCreds
         );

         this.exchangeServiceRepo.setExchangeService(
            id as ExchangeId,
            exchangeService
         );
      });
   }
}
