export interface IValidator<T> {
   validate(data: any): T;
}
