import "reflect-metadata";
import { mock, instance, when, anything } from "ts-mockito";
import { WithdrawCryptoValidationStrategy } from "../../../../src/validation/strategies";
import {
   ERR_EXCHANGE_SERVICE_NOT_FOUND,
   ERR_ASSET_UNSUPPORTED_ON_EXCHANGE,
   ERR_INVALID_ADDRESS,
   ERR_UNSUPPORTED_EXCHANGE,
} from "../../../../src/constants";
import { CCXTStep, ChainId, ExchangeId, StepType } from "../../../../src/types";
import {
   IExchangeApiService,
   IExchangeServiceRepo,
} from "../../../../src/exchanges";
import { ERR_UNSUPPORTED_CHAIN } from "@mate/sdk";

describe("WithdrawCryptoValidationStrategy", () => {
   let mockExchangeServiceRepo: IExchangeServiceRepo;
   let mockExchangeService: IExchangeApiService;
   let testee: WithdrawCryptoValidationStrategy;

   const validTestAddress = "0xcFF428319834eB8d57bEaBd41cf2D535F1347D3b";

   beforeEach(() => {
      mockExchangeServiceRepo = mock<IExchangeServiceRepo>();
      mockExchangeService = mock<IExchangeApiService>();
      testee = new WithdrawCryptoValidationStrategy(
         instance(mockExchangeServiceRepo)
      );
   });

   it("should throw ValidationError for unsupported exchange", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeWithdrawCrypto,
         adapter: "ccxt",
         config: {
            exchange: "test-exchange",
            asset: "USDC",
            chainId: ChainId.CELO,
            destinationAddress: validTestAddress,
            amount: 123,
         },
      };

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_UNSUPPORTED_EXCHANGE("test-exchange")
      );
   });

   it("should throw ValidationError for unsupported chain", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeWithdrawCrypto,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            asset: "USDC",
            chainId: "TESTCHAIN",
            destinationAddress: validTestAddress,
            amount: 123,
         },
      };

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_UNSUPPORTED_CHAIN("TESTCHAIN")
      );
   });

   it("should throw ValidationError for invalid address", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeWithdrawCrypto,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            asset: "USDC",
            chainId: ChainId.CELO,
            destinationAddress: "invalid-address",
            amount: 123,
         },
      };

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_INVALID_ADDRESS("invalid-address", "destinationAddress")
      );
   });

   it("should throw ValidationError if exchange service not found", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeWithdrawCrypto,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            asset: "BTC",
            chainId: ChainId.CELO,
            destinationAddress: validTestAddress,
            amount: 123,
         },
      };

      when(
         mockExchangeServiceRepo.getExchangeService(ExchangeId.BINANCE)
      ).thenReturn(undefined);

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_EXCHANGE_SERVICE_NOT_FOUND(ExchangeId.BINANCE)
      );
   });

   it("should throw ValidationError for unsupported asset", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeWithdrawCrypto,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            asset: "UNKNOWN_ASSET",
            chainId: ChainId.CELO,
            destinationAddress: validTestAddress,
            amount: 123,
         },
      };

      when(mockExchangeServiceRepo.getExchangeService(anything())).thenReturn(
         instance(mockExchangeService)
      );
      when(mockExchangeService.isAssetSupported(anything())).thenResolve(false);

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_ASSET_UNSUPPORTED_ON_EXCHANGE("UNKNOWN_ASSET", ExchangeId.BINANCE)
      );
   });

   it("should return config when validation is successful", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeWithdrawCrypto,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            asset: "BTC",
            chainId: ChainId.CELO,
            destinationAddress: validTestAddress,
            amount: 123,
         },
      };

      when(mockExchangeService.isAssetSupported(anything())).thenResolve(true);
      when(mockExchangeServiceRepo.getExchangeService(anything())).thenReturn(
         instance(mockExchangeService)
      );

      const result = await testee.validate(step);

      expect(result).toEqual(step);
   });
});
