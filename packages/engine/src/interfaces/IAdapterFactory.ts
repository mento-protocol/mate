import { IAdapter } from "@mate/sdk";

export interface IAdapterFactory {
   createAdapter<T extends IAdapter<any, any>>(adapterId: string): T;
}
