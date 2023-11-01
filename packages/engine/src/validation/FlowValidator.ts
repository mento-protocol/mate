import { Flow, IAdapter } from "@mate/sdk";
import { IFlowValidator } from "./IFlowValidator";
import { injectable } from "tsyringe";

@injectable()
export class FlowValidator implements IFlowValidator {
   public async validate(
      flow: Flow,
      adapters: Map<string, IAdapter<any, any>>
   ): Promise<void> {
      // Validate the steps in the flow
      for (const step of flow.steps) {
         const stepIndex = flow.steps.indexOf(step);

         // Get the adapter for this step
         const stepAdapter = adapters.get(step.adapter);
         if (!stepAdapter) {
            throw new Error(
               `Adapter ${step.adapter} was not found. Please check the config.`
            );
         }

         // Validate the step config using the adapter
         const stepValidationResult = await stepAdapter.isValid(step);
         if (!stepValidationResult.isValid) {
            throw new Error(
               `Step at index ${stepIndex} is not valid: ${stepValidationResult.errors.join(
                  ","
               )}`
            );
         }
      }
   }
}
