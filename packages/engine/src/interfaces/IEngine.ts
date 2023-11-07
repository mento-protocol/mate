import { ExecutionResult } from "@mate/sdk";

export interface IEngine {
   /**
    * Initializes the engine
    *
    * @returns A promise that resolves to a boolean indicating success of initialization.
    */
   init(): Promise<Boolean>;

   /**
    * Executes the flow with the provided id.
    *
    * @param flowId - The id of the flow to execute.
    * @returns A promise that resolves to the result of executing the flow.
    */
   execute(flowId: string): Promise<ExecutionResult>;
}
