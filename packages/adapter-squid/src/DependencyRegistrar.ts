import { container } from "tsyringe";
import { ExecutionResult, IAdapter, IValidator } from "@mate/sdk";
import { SquidStep } from "./types";
import { StepConfigValidator } from "./validation";
import {
   ISignerService,
   ISquidProvider,
   SignerService,
   SquidProvider,
} from "./services";
import pkg from "../package.json";
import { SquidAdapter } from "./SquidAdapter";

export class DependencyRegistrar {
   private constructor() {}

   public static configure(): void {
      container.registerSingleton<ISquidProvider>(SquidProvider);
      container.register<IValidator<SquidStep>>(StepConfigValidator, {
         useClass: StepConfigValidator,
      });

      container.register<ISignerService>(SignerService, {
         useClass: SignerService,
      });

      container.register<IAdapter<ExecutionResult, SquidStep>>(pkg.name, {
         useClass: SquidAdapter,
      });
   }
}
