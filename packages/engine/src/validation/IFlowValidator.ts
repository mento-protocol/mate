import { Flow, IAdapter } from "@mate/sdk";

export interface IFlowValidator {
   validate(
      flow: Flow,
      adapters: Map<string, IAdapter<any, any>>
   ): Promise<void>;
}
