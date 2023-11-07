import { container, injectable } from "tsyringe";
import { IAdapterFactory } from "./interfaces";
import { IAdapter } from "@mate/sdk";

@injectable()
export class AdapterFactory implements IAdapterFactory {
   constructor() {}

   public createAdapter<T extends IAdapter<any, any>>(adapterId: string): T {
      return container.resolve<T>(adapterId);
   }
}
