import "reflect-metadata";
import { ISquidProvider, SquidProvider } from "../../../src/services";
import { StepConfigValidator } from "../../../src/validation";
import {
   ERR_INVALID_ADDRESS,
   ERR_UNSUPPORTED_CHAIN,
   ERR_UNSUPPORTED_TOKEN,
} from "@mate/sdk";
import { StepType } from "../../../src/types";

describe("StepConfigValidator", () => {
   let squidProvider: ISquidProvider;
   let testee: StepConfigValidator;

   const goerliChainId = 5;
   const alfajoresChainId = 44787;

   const alfajoresAxelarUSDC = "0x254d06f33bDc5b8ee05b2ea472107E300226659A";
   const goerliDai = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60";

   const testInvalidAddress = "0xTestAddress";
   const testValidAddress = "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5";

   beforeAll(async () => {
      squidProvider = new SquidProvider();
      testee = new StepConfigValidator(squidProvider);

      // Initialize squidProvider
      const squidProviderConfig = {
         baseUrl: "https://testnet.api.squidrouter.com",
         integratorId: "mate-sdk",
      };
      await squidProvider.init(squidProviderConfig);
   });

   describe("validate", () => {
      it("should validate successfully for a correct config", async () => {
         const validConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: goerliChainId,
               fromToken: goerliDai,
               fromAddress: testValidAddress,
               fromAmount: 10_000,
               toChain: alfajoresChainId,
               toToken: alfajoresAxelarUSDC,
               toAddress: testValidAddress,
               maxSlippage: 0.01,
            },
         };
         await expect(testee.validate(validConfig)).resolves.not.toThrow();
      });

      it("should throw ValidationError for unsupported fromToken", async () => {
         const invalidConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: goerliChainId,
               fromToken: goerliDai + "xE",
               fromAddress: testInvalidAddress,
               fromAmount: 10_000,
               toChain: alfajoresChainId,
               toToken: alfajoresAxelarUSDC,
               toAddress: testInvalidAddress,
               maxSlippage: 0.01,
            },
         };
         await expect(testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_TOKEN(goerliDai + "xE", goerliChainId)}`
         );
      });

      it("should throw ValidationError for unsupported toToken", async () => {
         const invalidConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: goerliChainId,
               fromToken: goerliDai,
               fromAddress: testInvalidAddress,
               fromAmount: 10_000,
               toChain: alfajoresChainId,
               toToken: alfajoresAxelarUSDC + "XX",
               toAddress: testInvalidAddress,
               maxSlippage: 0.01,
            },
         };
         await expect(testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_TOKEN(
               alfajoresAxelarUSDC + "XX",
               alfajoresChainId
            )}`
         );
      });

      it("should throw ValidationError for unsupported fromChain", async () => {
         const invalidConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: 123456,
               fromToken: goerliDai,
               fromAddress: testInvalidAddress,
               fromAmount: 10_000,
               toChain: alfajoresChainId,
               toToken: alfajoresAxelarUSDC,
               toAddress: testInvalidAddress,
               maxSlippage: 0.01,
            },
         };
         await expect(testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_CHAIN("123456")}`
         );
      });

      it("should throw ValidationError for unsupported toChain", async () => {
         const invalidConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: goerliChainId,
               fromToken: goerliDai,
               fromAddress: testInvalidAddress,
               fromAmount: 10_000,
               toChain: 123456,
               toToken: alfajoresAxelarUSDC,
               toAddress: testInvalidAddress,
               maxSlippage: 0.01,
            },
         };
         await expect(testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_CHAIN("123456")}`
         );
      });

      it("should throw ValidationError for invalid from address", async () => {
         const invalidConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: goerliChainId,
               fromToken: goerliDai,
               fromAddress: testInvalidAddress,
               fromAmount: 10_000,
               toChain: alfajoresChainId,
               toToken: alfajoresAxelarUSDC,
               toAddress: testValidAddress,
               maxSlippage: 0.01,
            },
         };
         await expect(testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_INVALID_ADDRESS(testInvalidAddress, "fromAddress")}`
         );
      });
   });
});
