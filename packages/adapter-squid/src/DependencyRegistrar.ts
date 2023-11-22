import { container } from "tsyringe";
import { ExecutionResult, IAdapter, IValidator } from "@mate/sdk";
import { SquidAdapterConfig, SquidStepConfig } from "./types";
import { AdapterConfigValidator, StepConfigValidator } from "./validation";
import {
   ISquidProvider,
   SquidProvider,
} from "./services";
import { SquidAdapter } from "./SquidAdapter";

export class DependencyRegistrar {
   public static configure(): void {
      container.registerSingleton<ISquidProvider>(SquidProvider);
      container.register<IValidator<SquidStepConfig>>(StepConfigValidator, {
         useClass: StepConfigValidator,
      });
      container.register<IValidator<SquidAdapterConfig>>(
         AdapterConfigValidator,
         {
            useClass: AdapterConfigValidator,
         }
      );
      container.register<IAdapter<ExecutionResult, SquidStepConfig>>(
         "@mate/adapter-squid",
         {
            useClass: SquidAdapter,
         }
      );
   }
}
