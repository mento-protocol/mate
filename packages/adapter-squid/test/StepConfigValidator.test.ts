import "reflect-metadata";
import { ISquidProvider } from "../src/providers";
import { StepConfigValidator } from "../src/validation";
import "reflect-metadata";
import { mock, instance, when } from "ts-mockito";
import { Squid, TokenData, ChainData } from "@0xsquid/sdk";
import {
   ERR_INVALID_STEP_CONFIG,
   ERR_UNSUPPORTED_CHAIN,
   ERR_UNSUPPORTED_TOKEN,
} from "@mate/sdk";
import { StepType } from "../src/types";

describe("StepConfigValidator", () => {
   let mockSquidProvider: ISquidProvider;
   let mockSquid: Squid;
   let testee: StepConfigValidator;

   beforeEach(() => {
      mockSquidProvider = mock<ISquidProvider>();
      mockSquid = mock<Squid>();
      testee = new StepConfigValidator(instance(mockSquidProvider));

      // Setup default mocks
      when(mockSquidProvider.getSquid()).thenReturn(instance(mockSquid));
      when(mockSquid.tokens).thenReturn([
         {
            chainId: 1111,
            address: "0xSupportedToken1",
            name: "TNK",
            symbol: "TKN",
            decimals: 18,
         },
         {
            chainId: 2222,
            address: "0xSupportedToken2",
            name: "TKN2",
            symbol: "TKN2",
            decimals: 18,
         },
      ] as TokenData[]);
      when(mockSquid.chains).thenReturn([
         { chainId: 1111, chainName: "celo" },
         { chainId: 2222, chainName: "osmosis" },
      ] as ChainData[]);
   });

   describe("validate", () => {
      it("should throw ValidationError for invalid config", async () => {
         const invalidConfig = {
            type: StepType.BridgeSwap,
            adapter: "octopus",
            config: {
               fromChain: 999536,
               toChain: 987654,
               fromAmount: 10_000,
            },
         };

         await expect(testee.validate(invalidConfig)).rejects.toThrow(
            ERR_INVALID_STEP_CONFIG
         );
      });

      it("should throw ValidationError for unsupported fromToken", async () => {
         const invalidConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: 1111,
               fromToken: "0xUnSupportedToken",
               fromAddress: "0xTestAddress1",
               fromAmount: 10_000,
               toChain: 2222,
               toToken: "0xSupportedToken2",
               toAddress: "0xTestAddress2",
               maxSlippage: 0.01,
            },
         };

         await expect(() => testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_TOKEN(invalidConfig.config.fromToken)}`
         );
      });

      it("should throw ValidationError for unsupported toToken", async () => {
         const invalidConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: 1111,
               fromToken: "0xSupportedToken1",
               fromAddress: "0xTestAddress1",
               fromAmount: 10_000,
               toChain: 2222,
               toToken: "0xUnSupportedToken",
               toAddress: "0xTestAddress2",
               maxSlippage: 0.01,
            },
         };

         await expect(() => testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_TOKEN(invalidConfig.config.toToken)}`
         );
      });

      it("should throw ValidationError for unsupported fromChain", async () => {
         const invalidConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: 44444,
               fromToken: "0xSupportedToken1",
               fromAddress: "0xTestAddress1",
               fromAmount: 10_000,
               toChain: 2222,
               toToken: "0xSupportedToken2",
               toAddress: "0xTestAddress2",
               maxSlippage: 0.01,
            },
         };

         await expect(() => testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_CHAIN(
               invalidConfig.config.fromChain.toString()
            )}`
         );
      });

      it("should throw ValidationError for unsupported toChain", async () => {
         const invalidConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: 1111,
               fromToken: "0xSupportedToken1",
               fromAddress: "0xTestAddress1",
               fromAmount: 10_000,
               toChain: 9999,
               toToken: "0xSupportedToken2",
               toAddress: "0xTestAddress2",
               maxSlippage: 0.01,
            },
         };

         await expect(() => testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_CHAIN(invalidConfig.config.toChain.toString())}`
         );
      });

      it("should validate successfully for correct config", async () => {
         const validConfig = {
            type: StepType.BridgeSwap,
            adapter: "squid",
            config: {
               fromChain: 1111,
               fromToken: "0xSupportedToken1",
               fromAddress: "0xTestAddress1",
               fromAmount: 10_000,
               toChain: 2222,
               toToken: "0xSupportedToken2",
               toAddress: "0xTestAddress2",
               maxSlippage: 0.01,
            },
         };

         const result = await testee.validate(validConfig);
         expect(result).toEqual(validConfig);
      });
   });
});
