export class ValidationError extends Error {
   constructor(message = "", public context: any = null) {
      super(message);
      Object.setPrototypeOf(this, new.target.prototype);
   }
}
