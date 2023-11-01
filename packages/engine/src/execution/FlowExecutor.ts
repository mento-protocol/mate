import { ExecutionResult, Flow, IAdapter } from "@mate/sdk";
import { IFlowExecutor } from "./IFlowExecutor";

export class FlowExecutor implements IFlowExecutor {
   public async execute(
      flow: Flow,
      adapters: Map<string, IAdapter<any, any>>
   ): Promise<ExecutionResult> {
      let executionResult;

      for (const step of flow.steps) {
         const stepAdapter = adapters.get(step.adapter);
         if (!stepAdapter) {
            // TODO: Will never be the case at this point, but need to handle this better
            throw new Error("Adapter not found");
         }

         executionResult = await stepAdapter.execute(step);
      }

      return executionResult;
   }
}
