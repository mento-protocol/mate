import "reflect-metadata";
import { mock, instance, when, anyString, verify } from "ts-mockito";
import { ChainId, ExchangeId, StepType } from "../../../src/types";
import { StepConfigValidator } from "../../../src/validation";
import {
   ERR_ASSET_UNSUPPORTED_ON_EXCHANGE,
   ERR_EXCHANGE_SERVICE_NOT_FOUND,
   ERR_INVALID_ADDRESS,
   ERR_UNSUPPORTED_CHAIN,
   ERR_UNSUPPORTED_EXCHANGE,
   ERR_UNSUPPORTED_STEP,
} from "../../../src/constants";
import {
   IExchangeApiService,
   IExchangeServiceRepo,
} from "../../../src/exchanges";

describe("StepConfigValidator", () => {
   let mockExchangeService: IExchangeApiService;
   let mockExchangeServiceRepo: IExchangeServiceRepo;
   let testee: StepConfigValidator;

   beforeEach(() => {
      mockExchangeServiceRepo = mock<IExchangeServiceRepo>();
      mockExchangeService = mock<IExchangeApiService>();
      testee = new StepConfigValidator(instance(mockExchangeServiceRepo));

      // Setup mocks
      when(mockExchangeService.isAssetSupported(anyString())).thenReturn(
         Promise.resolve(true)
      );
      when(mockExchangeServiceRepo.getExchangeService(anyString())).thenReturn(
         instance(mockExchangeService)
      );
   });

   describe("validate", () => {
      it("should throw ValidationError for invalid config", async () => {
         const invalidConfig = {};

         await expect(testee.validate(invalidConfig)).rejects.toThrow(
            "Invalid step configuration provided"
         );
      });

      it("should throw ValidationError for unsupported exchange", async () => {
         const invalidConfig = {
            type: StepType.ExchangeWithdrawCrypto,
            adapter: "ccxt",
            config: {
               exchange: "ftx",
               asset: "BTC",
               chainId: ChainId.CELO,
               destinationAddress: "some address",
               amount: 5000,
            },
         };

         await expect(() => testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_EXCHANGE("ftx")}`
         );
      });

      it("should throw ValidationError for unsupported chain", async () => {
         const invalidConfig = {
            type: StepType.ExchangeWithdrawCrypto,
            adapter: "ccxt",
            config: {
               exchange: ExchangeId.BINANCE,
               asset: "BTC",
               chainId: "1",
               destinationAddress: "some address",
               amount: 5000,
            },
         };

         await expect(() => testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_CHAIN("1")}`
         );
      });

      it("should throw ValidationError for unsupported step", async () => {
         const invalidConfig = {
            type: StepType.ExchangeSwap,
            adapter: "ccxt",
            config: {
               exchange: ExchangeId.BINANCE,
               from: "BTC",
               to: "1",
               maxSlippageBPS: 1,
               amount: 5000,
            },
         };

         await expect(() => testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_UNSUPPORTED_STEP("Exchange.Swap")}`
         );
      });

      it("should throw ValidationError when exchange does not support asset", async () => {
         const invalidConfig = {
            type: StepType.ExchangeWithdrawCrypto,
            adapter: "ccxt",
            config: {
               exchange: ExchangeId.BINANCE,
               asset: "BTC",
               chainId: ChainId.CELO,
               destinationAddress: "some address",
               amount: 5000,
            },
         };

         when(mockExchangeService.isAssetSupported(anyString())).thenReturn(
            Promise.resolve(false)
         );

         await expect(() => testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_ASSET_UNSUPPORTED_ON_EXCHANGE("BTC", ExchangeId.BINANCE)}`
         );
      });

      it("should throw ValidationError when exchange service is not found", async () => {
         const invalidConfig = {
            type: StepType.ExchangeWithdrawCrypto,
            adapter: "ccxt",
            config: {
               exchange: ExchangeId.BINANCE,
               asset: "BTC",
               chainId: ChainId.CELO,
               destinationAddress: "some address",
               amount: 5000,
            },
         };

         when(
            mockExchangeServiceRepo.getExchangeService(ExchangeId.BINANCE)
         ).thenReturn(undefined);

         await expect(() => testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_EXCHANGE_SERVICE_NOT_FOUND(ExchangeId.BINANCE)}`
         );
      });

      it("should throw ValidationError when an invalid destination address is used", async () => {
         const invalidConfig = {
            type: StepType.ExchangeWithdrawCrypto,
            adapter: "ccxt",
            config: {
               exchange: ExchangeId.BINANCE,
               asset: "BTC",
               chainId: ChainId.CELO,
               destinationAddress: "Some Address",
               amount: 5000,
            },
         };

         await expect(() => testee.validate(invalidConfig)).rejects.toThrow(
            `${ERR_INVALID_ADDRESS("Some Address", "destinationAddress")}`
         );
      });

      it("should validate successfully for correct config", async () => {
         const validConfig = {
            type: StepType.ExchangeWithdrawCrypto,
            adapter: "ccxt",
            config: {
               exchange: ExchangeId.BINANCE,
               asset: "BTC",
               chainId: ChainId.CELO,
               destinationAddress: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
               amount: 5000,
            },
         };

         const result = await testee.validate(validConfig);

         expect(result).toEqual(validConfig);
         verify(
            mockExchangeServiceRepo.getExchangeService(ExchangeId.BINANCE)
         ).once();
      });
   });
});
