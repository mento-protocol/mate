import { container } from "tsyringe";
import { IValidator, StepConfigValidator } from "./validation";
import { CCXTStep, StepType } from "./types";
import {
   ExchangeServiceRepo,
   IExchangeServiceRepo,
   ExchangeFactory,
   IExchangeFactory,
} from "./exchanges";
import {
   ExchangeSwapValidationStrategy,
   WithdrawCryptoValidationStrategy,
} from "./validation/strategies";
import { VALIDATION_STRATEGIES_TOKEN } from "./constants";

/**
 * Handles the dependency registration for the adapter.
 * This class ensures all dependencies are correctly set up and registered.
 */
export class DependencyRegistrar {
   private static instance: DependencyRegistrar | null = null;

   private constructor() {}

   public static getInstance(): DependencyRegistrar {
      if (!this.instance) {
         this.instance = new DependencyRegistrar();
      }
      return this.instance;
   }

   public configure(): void {
      this.registerExchangeServiceDependencies();
      this.registerValidationDependencies();
   }

   /**
    * Registers validation-related dependencies.
    */
   private registerValidationDependencies(): void {
      container.register<IValidator<CCXTStep>>(StepConfigValidator, {
         useClass: StepConfigValidator,
      });

      container.register(VALIDATION_STRATEGIES_TOKEN, {
         useFactory: (c) => {
            const map = new Map();
            map.set(
               StepType.ExchangeSwap,
               c.resolve(ExchangeSwapValidationStrategy)
            );
            map.set(
               StepType.ExchangeWithdrawCrypto,
               c.resolve(WithdrawCryptoValidationStrategy)
            );
            return map;
         },
      });
   }

   /**
    * Registers exchange service-related dependencies.
    */
   private registerExchangeServiceDependencies(): void {
      container.registerSingleton<IExchangeServiceRepo>(ExchangeServiceRepo);

      container.register<IExchangeFactory>(ExchangeFactory, {
         useClass: ExchangeFactory,
      });
   }
}
