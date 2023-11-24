import { container, injectable } from "tsyringe";
import { IAdapterFactory } from "./interfaces";
import { IAdapter } from "@mate/sdk";

@injectable()
export class AdapterFactory implements IAdapterFactory {
   constructor() {}

   public createAdapter<T extends IAdapter<unknown, unknown>>(
      adapterId: string
   ): T {
      try {
         return container.resolve<T>(adapterId);
      } catch (error) {
         throw new Error(
            `Adapter with id '${adapterId}' could not be created. Verify it has been registered with the container then try again. Error: ${error}`
         );
      }
   }
}
