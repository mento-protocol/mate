import { container } from "tsyringe";
import { IValidator } from "@mate/sdk";
import { SquidStep } from "./types";
import { StepConfigValidator } from "./validation";
import { ISquidProvider, SquidProvider } from "./services";

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
      container.register<IValidator<SquidStep>>(StepConfigValidator, {
         useClass: StepConfigValidator,
      });
   }
}
