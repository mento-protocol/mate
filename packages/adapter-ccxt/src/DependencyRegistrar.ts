import { container } from "tsyringe";
import { StepConfigValidator } from "./validation";
import { CCXTStep, StepType } from "./types";
import {
   ExchangeServiceRepo,
   IExchangeServiceRepo,
   ExchangeFactory,
   IExchangeFactory,
} from "./exchanges";
import {
   DepositCryptoValidationStrategy,
   ExchangeSwapValidationStrategy,
   WithdrawCryptoValidationStrategy,
} from "./validation/strategies";
import { VALIDATION_STRATEGIES_TOKEN } from "./constants";
import { IValidator } from "@mate/sdk";

/**
 * Handles the dependency registration for the adapter.
 * This class ensures all dependencies are correctly set up and registered.
 */
export class DependencyRegistrar {
   public static configure(): void {
      this.registerExchangeServiceDependencies();
      this.registerValidationDependencies();
   }

   /**
    * Registers validation-related dependencies.
    */
   private static registerValidationDependencies(): void {
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
            map.set(
               StepType.ExchangeDepositCrypto,
               c.resolve(DepositCryptoValidationStrategy)
            );
            return map;
         },
      });
   }

   /**
    * Registers exchange service-related dependencies.
    */
   private static registerExchangeServiceDependencies(): void {
      container.registerSingleton<IExchangeServiceRepo>(ExchangeServiceRepo);

      container.register<IExchangeFactory>(ExchangeFactory, {
         useClass: ExchangeFactory,
      });
   }
}
