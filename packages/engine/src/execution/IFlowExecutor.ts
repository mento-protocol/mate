import { ExecutionResult, Flow, IAdapter } from "@mate/sdk";

export interface IFlowExecutor {
   execute(
      flow: Flow,
      adapters: Map<string, IAdapter<any, any>>
   ): Promise<ExecutionResult>;
}
