import { Step } from "../types/Step";

/**
 * Represents a generic interface for adapters.
 *
 * @template TResult The type of the result returned after executing the step.
 * @template TInitConfig The type of the configuration required during initialization.
 * @template TStepConfig The type of the configuration specific to a step.
 */
export interface IAdapter<TResult, TInitConfig, TStepConfig> {
   /**
    * Initializes the adapter with the given configuration.
    *
    * @param config - Configuration to initialize the adapter.
    * @returns A promise that resolves to a boolean indicating success of initialization.
    */
   init(config: TInitConfig): Promise<Boolean>;

   /**
    * Checks if the adapter supports the provided step based on its configuration.
    *
    * @param step - The step to check support for.
    * @returns A boolean indicating if the step is supported by this adapter.
    */
   supportsStep(step: Step<TStepConfig>): Boolean;

   /**
    * Validates if the provided step is valid and can be executed by the adapter.
    *
    * @param step - The step to validate.
    * @returns A boolean indicating if the step is valid.
    */
   isValid(step: Step<TStepConfig>): Boolean;

   /**
    * Executes the provided step and returns the result.
    *
    * @param step - The step to execute.
    * @returns A promise that resolves to the result of executing the step.
    */
   execute(step: Step<TStepConfig>): Promise<TResult>;
}
