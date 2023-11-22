import { ethers } from "ethers";

export interface ISignerService {
   /**
    * Gets an ethers signer for the chain with specifiedId.
    *
    * @param chainID - The chain ID for the chain to get the signer for.
    * @returns A promise that resolves to the signer for the chain with specified ID.
    */
   getSignerForChain(chainID: number): ethers.Wallet;
}
