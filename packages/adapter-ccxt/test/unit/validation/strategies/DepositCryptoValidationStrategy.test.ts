import "reflect-metadata";
import { mock, instance, when, anything } from "ts-mockito";
import { DepositCryptoValidationStrategy } from "../../../../src/validation/strategies";
import {
   IExchangeApiService,
   IExchangeServiceRepo,
} from "../../../../src/exchanges";
import { CCXTStep, ChainId, ExchangeId, StepType } from "../../../../src/types";
import {
   ERR_ASSET_UNSUPPORTED_ON_EXCHANGE,
   ERR_INVALID_DEPOSIT_ADDRESS,
   ERR_UNSUPPORTED_EXCHANGE,
} from "../../../../src/constants";
import { ERR_UNSUPPORTED_CHAIN } from "@mate/sdk";

describe("DepositCryptoValidationStrategy", () => {
   let mockExchangeServiceRepo: IExchangeServiceRepo;
   let mockExchangeService: IExchangeApiService;
   let testee: DepositCryptoValidationStrategy;

   beforeEach(() => {
      mockExchangeServiceRepo = mock<IExchangeServiceRepo>();
      mockExchangeService = mock<IExchangeApiService>();
      testee = new DepositCryptoValidationStrategy(
         instance(mockExchangeServiceRepo)
      );

      when(mockExchangeServiceRepo.getExchangeService(anything())).thenReturn(
         instance(mockExchangeService)
      );
   });

   it("should throw ValidationError for unsupported exchange", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeDepositCrypto,
         adapter: "ccxt",
         config: {
            exchange: "test-exchange",
            toChain: ChainId.ETHEREUM,
            asset: "USDC",
            toAddress: "testAddress",
            amount: 123,
         },
      };

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_UNSUPPORTED_EXCHANGE("test-exchange")
      );
   });

   it("should throw ValidationError for unsupported chain", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeDepositCrypto,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            toChain: "test-chain",
            asset: "USDC",
            toAddress: "testAddress",
            amount: 123,
         },
      };

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_UNSUPPORTED_CHAIN("test-chain")
      );
   });

   it("should throw ValidationError for unsupported asset on exchange", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeDepositCrypto,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            toChain: ChainId.ETHEREUM,
            asset: "test-asset",
            toAddress: "testAddress",
            amount: 123,
         },
      };

      when(mockExchangeService.isAssetSupported("test-asset")).thenResolve(
         false
      );

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_ASSET_UNSUPPORTED_ON_EXCHANGE("test-asset", ExchangeId.BINANCE)
      );
   });

   it("should throw ValidationError for invalid deposit address", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeDepositCrypto,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            toChain: ChainId.ETHEREUM,
            asset: "USDC",
            toAddress: "wrongAddress",
            amount: 123,
         },
      };
      when(mockExchangeService.isAssetSupported(anything())).thenResolve(true);

      when(
         mockExchangeService.getDepositAddress("USDC", ChainId.ETHEREUM)
      ).thenResolve("correctAddress");

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_INVALID_DEPOSIT_ADDRESS
      );
   });

   it("should return validResult when validation is successful", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeDepositCrypto,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            toChain: ChainId.ETHEREUM,
            asset: "USDC",
            toAddress: "correctAddress",
            amount: 123,
         },
      };

      when(mockExchangeService.isAssetSupported(anything())).thenResolve(true);
      when(
         mockExchangeService.getDepositAddress("USDC", ChainId.ETHEREUM)
      ).thenResolve("correctAddress");

      const result = await testee.validate(step);

      expect(result).toEqual(step);
   });
});
