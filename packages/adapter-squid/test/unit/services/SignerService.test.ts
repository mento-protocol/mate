import "reflect-metadata";
import { mock, instance, when, anything, verify } from "ts-mockito";
import { SignerService } from "../../../src/services";
import { ERR_GLOBAL_VARIABLE_MISSING, IConfigProvider } from "@mate/sdk";
import { Wallet } from "ethers";

describe("SignerService", () => {
   let mockConfigProvider: IConfigProvider;
   let testee: SignerService;

   beforeEach(() => {
      mockConfigProvider = mock<IConfigProvider>();
      testee = new SignerService(instance(mockConfigProvider));
   });

   describe("getSignerForChain", () => {
      it("should return a Wallet when valid chainID is provided", () => {
         // Set up mock to return a mock private key and rpcUrl
         when(
            mockConfigProvider.getGlobalVariable("primaryPrivateKey")
         ).thenReturn(
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
         );
         when(mockConfigProvider.getRpcUrl(anything())).thenReturn(
            "mockRpcUrl"
         );

         // Actual call
         const result = testee.getSignerForChain(1);

         // Validate
         expect(result).toBeInstanceOf(Wallet);
         verify(
            mockConfigProvider.getGlobalVariable("primaryPrivateKey")
         ).once();
         verify(mockConfigProvider.getRpcUrl(1)).once();
      });

      it("should throw an error when primaryPrivateKey is missing", () => {
         // Set up mock to return undefined for primaryPrivateKey
         when(
            mockConfigProvider.getGlobalVariable("primaryPrivateKey")
         ).thenReturn(undefined);

         // Validate error thrown
         expect(() => testee.getSignerForChain(1)).toThrowError(
            ERR_GLOBAL_VARIABLE_MISSING("primaryPrivateKey")
         );
         verify(
            mockConfigProvider.getGlobalVariable("primaryPrivateKey")
         ).once();
      });

      it("should throw an error when rpcUrl for the chainID is missing", () => {
         // Set up mock to return a mock private key but undefined for rpcUrl
         when(
            mockConfigProvider.getGlobalVariable("primaryPrivateKey")
         ).thenReturn("mockPrivateKey");
         when(mockConfigProvider.getRpcUrl(anything())).thenReturn(null);

         // Validate error thrown
         expect(() => testee.getSignerForChain(1)).toThrowError(
            ERR_GLOBAL_VARIABLE_MISSING("rpcUrl")
         );
         verify(
            mockConfigProvider.getGlobalVariable("primaryPrivateKey")
         ).once();
         verify(mockConfigProvider.getRpcUrl(anything())).once();
      });
   });
});
