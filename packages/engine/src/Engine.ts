import { inject, injectable } from "tsyringe";
import { IAdapterFactory, IEngine } from "./interfaces";
import {
   ConfigProvider,
   ExecutionResult,
   IAdapter,
   IConfigProvider,
} from "@mate/sdk";
import { AdapterFactory } from "./AdapterFactory";
import { FlowExecutor, IFlowExecutor } from "./execution";
import { FlowValidator, IFlowValidator } from "./validation";

@injectable()
export class Engine implements IEngine {
   private adapters: Map<string, IAdapter<any, any>>;
   private initialised: boolean = false;

   constructor(
      @inject(ConfigProvider) private configProvider: IConfigProvider,
      @inject(AdapterFactory) private adapterFactory: IAdapterFactory,
      @inject(FlowValidator) private flowValidator: IFlowValidator,
      @inject(FlowExecutor) private flowExecutor: IFlowExecutor
   ) {
      this.adapters = new Map<string, IAdapter<any, any>>();
   }

   public async init(): Promise<Boolean> {
      if (this.initialised) {
         throw new Error("Engine is already initialised");
      }

      await this.initializeAdapters();

      this.initialised = true;
      return true;
   }

   public async execute(flowId: string): Promise<ExecutionResult> {
      let executionResult: ExecutionResult;
      const flow = this.configProvider.getFlowById(flowId);

      if (!flow) {
         throw new Error(
            `Flow with id ${flowId} was not found. Please check the config.`
         );
      }

      // Validate the flow
      try {
         await this.flowValidator.validate(flow, this.adapters);
      } catch (error) {
         throw new Error(`Flow ${flowId} failed validation: ${error}`);
      }

      // Execute the flow
      try {
         executionResult = await this.flowExecutor.execute(flow, this.adapters);
      } catch (error) {
         throw new Error(`Flow ${flowId} failed execution: ${error}`);
      }

      return executionResult;
   }

   private async initializeAdapters(): Promise<void> {
      const configuredAdapters = this.configProvider.getAdapters();

      for (const adapterConfig of configuredAdapters) {
         // Create the adapter using the adapter factory
         const adapter = await this.adapterFactory.createAdapter(
            adapterConfig.adapter
         );

         // Try to initialize the adapter
         try {
            await adapter.init();
         } catch (error) {
            throw new Error(
               `${adapterConfig.id} failed to initialize: ${error}`
            );
         }

         // After successful initialization, add the adapter to the map of adapters
         this.adapters.set(adapterConfig.id, adapter);
      }
   }
}
