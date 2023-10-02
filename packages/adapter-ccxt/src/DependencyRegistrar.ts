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
      this.registerExchangeServices();
      this.registerValidation();
   }

   private registerValidation(): void {
      container.register<IValidator<CCXTStep>>(StepConfigValidator, {
         useClass: StepConfigValidator,
      });

      // Register the valiation strategies
      container.register("ValidationStrategies", {
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

   private registerExchangeServices(): void {
      container.registerSingleton<IExchangeServiceRepo>(ExchangeServiceRepo);

      container.register<IExchangeFactory>(ExchangeFactory, {
         useClass: ExchangeFactory,
      });

      // Note: Individual exchange services are managed by the ExchangeServiceRepo repo,
      // so we don't need to register them here
   }
}
