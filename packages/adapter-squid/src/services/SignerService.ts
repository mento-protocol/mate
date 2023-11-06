import { Wallet, ethers } from "ethers";
import { ISignerService } from "./ISignerService";
import { inject, injectable } from "tsyringe";
import {
   ConfigProvider,
   ERR_GLOBAL_VARIABLE_MISSING,
   IConfigProvider,
} from "@mate/sdk";

@injectable()
export class SignerService implements ISignerService {
   constructor(
      @inject(ConfigProvider) private configProvider: IConfigProvider
   ) {}

   public getSignerForChain(chainID: number): Wallet {
      //TODO: Consider caching signer.
      const privateKey =
         this.configProvider.getGlobalVariable("primaryPrivateKey");
      if (!privateKey) {
         throw new Error(`${ERR_GLOBAL_VARIABLE_MISSING("primaryPrivateKey")}`);
      }

      const rpcUrl = this.configProvider.getRpcUrl(chainID);
      if (!rpcUrl) {
         throw new Error(`${ERR_GLOBAL_VARIABLE_MISSING("rpcUrl")}`);
      }

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      return new ethers.Wallet(privateKey, provider);
   }
}
