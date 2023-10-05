import { Address } from "viem";
export interface IEvmChainService {
   /**
    * Initializes the provider with a map of chain IDs to their corresponding RPC URLs.
    *
    * @param clientConfigs - A map where the key is the chain ID and the value is its RPC URL.
    * @returns A promise that resolves once all clients are set up.
    */
   init(clientConfigs: Map<number, string>): Promise<void>;

   /**
    * Gets the balance of a token for an address on the specified chain.
    * @param chainId - The chain ID.
    * @param address - The address to get the balance for.
    * @param tokenAddress - The token address.
    * @returns A promise that resolves to the balance.
    */
   getBalance(
      chainId: number,
      address: Address,
      tokenAddress: Address
   ): Promise<bigint>;
}
