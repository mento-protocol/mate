/**
 * IValidator interface
 *
 * This interface defines a contract for implementing validation logic in the application.
 * It provides a single method `validate` which should be implemented by any class that
 * adheres to this interface.
 *
 * @template T The type of the object that the validator will validate.
 */
export interface IValidator<T> {
   /**
    * Validate method
    *
    * This method should contain the validation logic for the implementing class. It takes
    * an argument of any type and should return an object of type T if the validation is
    * successful. If the validation fails, it should throw an error or return a value
    * that signifies a validation failure.
    *
    * @param {any} data The data to be validated.
    * @returns {T} The validated object of type T.
    * @throws {ValidationError} If the validation fails.
    */
   validate(data: any): Promise<T>;
}
