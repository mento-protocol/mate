import { container } from "tsyringe";
import { DependencyRegistrar as SdkRegistrar } from "@mate/sdk";
import { DependencyRegistrar as CCXTRegistrar } from "@mate/adapter-ccxt";
import { DependencyRegistrar as SquidRegistrar } from "@mate/adapter-squid";
import { IAdapterFactory } from "./interfaces";
import { AdapterFactory } from "./AdapterFactory";
import { FlowValidator, IFlowValidator } from "./validation";
import { FlowExecutor, IFlowExecutor } from "./execution";

export class DependencyRegistrar {
   public static configure(): void {
      // Registrations from external packages
      SdkRegistrar.configure();
      CCXTRegistrar.configure();
      SquidRegistrar.configure();

      // Registrations from this package
      container.register<IFlowValidator>(FlowValidator, {
         useClass: FlowValidator,
      });

      container.register<IFlowExecutor>(FlowExecutor, {
         useClass: FlowExecutor,
      });

      container.register<IAdapterFactory>(AdapterFactory, {
         useClass: AdapterFactory,
      });
   }
}
