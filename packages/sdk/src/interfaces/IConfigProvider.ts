import { Flow } from "../types";
import { AdapterConfig } from "../types/AdapterConfig";

/**
 * `IConfigProvider` provides an interface for loading configuration details
 * from a given source, ensuring consistency and flexibility in how configurations
 * can be retrieved.
 */
export interface IConfigProvider {
   /**
    * Retrieves the configuration for a specific adapter using its ID.
    *
    * @param adapterId - The unique identifier for the adapter whose config is to be retrieved.
    * @returns The configuration details for the specified adapter or `null` if not found.
    */
   getAdapterConfig(adapterId: string): AdapterConfig | null;

   /**
    * Retrieves the value for the global setting with the specified key.
    * @param variableName - The name of the global variable to retrieve.
    * @returns The value of the global variable or null if not found.
    */
   getGlobalVariable(variableName: string): any | null;

   /**
    * Retrieves the RPC url to use for the chain with the specified chain ID.
    * @param chainId - The chain ID for which to retrieve the RPC url.
    * @returns The RPC url for the specified chain or null if not found.
    */
   getRpcUrl(chainId: number): string | null;

   /**
    * Retrieves a step with a given index from a flow with a given ID.
    * @param flowId The ID of the flow from which to retrieve the step.
    * @param stepIndex The index of the step to retrieve.
    * @returns The step with the specified index from the flow with the specified ID or null if not found.
    */
   getStepFromFlow(flowId: string, stepIndex: number): any | null;

   /**
    * Retrieves the config for all adapters defined.
    * @returns An array of adapter configurations.
    */
   getAdapters(): AdapterConfig[];

   /**
    * Retrieves the flow with the specified ID.
    * @param flowId - The ID of the flow to retrieve.
    * @returns The flow with the specified ID or null if not found.
    */
   getFlowById(flowId: string): Flow | null;
}
