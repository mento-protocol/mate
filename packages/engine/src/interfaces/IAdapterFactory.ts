import { IAdapter } from "@mate/sdk";

export interface IAdapterFactory {
   createAdapter<T extends IAdapter<unknown, unknown>>(adapterId: string): T;
}
