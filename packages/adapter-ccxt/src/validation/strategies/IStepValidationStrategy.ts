import { CCXTStep } from "../../types";

/**
 * Represents a strategy for validating a specific type of step supported by the adapter.
 *
 * This interface enforces a `validate` method that each concrete step validation
 * strategy must implement to provide the specific validation logic for a particular step type.
 *
 * This allows the addition of new step types by simply adding new strategies that adhere to this interface, without
 * the need to modify existing validation logic.
 */
export interface IStepValidationStrategy {
   /**
    * Validates the provided CCXTStep according to the specific rules and logic of the strategy.
    *
    * @param validResult - The CCXTStep instance to be validated.
    * @returns A promise that resolves to the validated CCXTStep instance.
    * @throws ValidationError if the validation fails for any reason.
    */
   validate(validResult: CCXTStep): Promise<CCXTStep>;
}
