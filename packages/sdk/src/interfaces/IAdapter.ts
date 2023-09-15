import { Step } from "../types/Step";

/**
 * Represents a generic interface for adapters.
 *
 * @template TResult The type of the result returned after executing the step.
 * @template TInitConfig The type of the configuration required during initialization.
 * @template TStepConfig The type of the configuration specific to a step.
 */
export interface IAdapter<TResult, TStepConfig> {
   /**
    * The id of the adapter.
    */
   readonly adapterId: string;

   /**
    * Initializes the adapter with the given configuration.
    *
    * @returns A promise that resolves to a boolean indicating success of initialization.
    */
   init(): Promise<Boolean>;

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
