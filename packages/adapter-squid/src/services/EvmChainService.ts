import * as chains from "viem/chains";
import { PublicClient, createPublicClient, http, Address } from "viem";
import { singleton } from "tsyringe";

import { IEvmChainService } from ".";
import { erc20Abi } from "../constants";

@singleton()
export class EvmChainService implements IEvmChainService {
   private publicClients: Map<number, PublicClient>;
   private initialised: boolean = false;

   constructor() {
      this.publicClients = new Map<number, PublicClient>();
   }

   public async init(clientConfigs: Map<number, string>): Promise<void> {
      if (this.initialised) {
         throw new Error("EvmChainProvider is already initialised");
      }

      for (const [chainId, rpcUrl] of clientConfigs.entries()) {
         const thisChain = this.getChainById(chainId);
         const thisTransport = rpcUrl ? http(rpcUrl) : http();

         const client = createPublicClient({
            chain: thisChain,
            transport: thisTransport,
         });
         this.publicClients.set(chainId, client);
      }
   }

   public async getBalance(
      chainId: number,
      address: Address,
      tokenAddress: Address
   ): Promise<bigint> {
      const client = this.getPublicClient(chainId);

      const balance = await client.readContract({
         address: tokenAddress,
         abi: erc20Abi,
         functionName: "balanceOf",
         args: [address],
      });

      return balance;
   }

   private getPublicClient(chainId: number): PublicClient {
      if (!this.initialised) {
         throw new Error("EvmChainProvider not initialised");
      }

      const client = this.publicClients.get(chainId);

      if (!client) {
         throw new Error(`No client found for chain with id ${chainId}`);
      }

      return client;
   }

   private getChainById(chainId: number): any {
      for (const chain of Object.values(chains)) {
         if (chain.id === chainId) {
            return chain;
         }
      }
   }
}
