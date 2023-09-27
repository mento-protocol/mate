import { container } from "tsyringe";
import {
   EvmChainService,
   IEvmChainService,
   ISquidProvider,
   SquidProvider,
} from "./services";
import { IValidator } from "@mate/sdk";
import { SquidStep } from "./types";
import { StepConfigValidator } from "./validation";
import { STEP_CONFIG_VALIDATOR } from "./constants";

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
      container.registerSingleton<ISquidProvider>(SquidProvider);
      container.registerSingleton<IEvmChainService>(EvmChainService);
      container.register<IValidator<SquidStep>>(STEP_CONFIG_VALIDATOR, {
         useClass: StepConfigValidator,
      });
   }
}
