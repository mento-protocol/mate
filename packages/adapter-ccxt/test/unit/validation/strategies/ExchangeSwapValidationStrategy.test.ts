import "reflect-metadata";
import { mock, instance, when, anything } from "ts-mockito";
import { ExchangeSwapValidationStrategy } from "../../../../src/validation/strategies";
import {
   ERR_EXCHANGE_SERVICE_NOT_FOUND,
   ERR_EXCHANGE_UNSUPPORTED_MARKET,
   ERR_UNSUPPORTED_EXCHANGE,
} from "../../../../src/constants";
import { CCXTStep, ExchangeId, Side, StepType } from "../../../../src/types";
import {
   IExchangeApiService,
   IExchangeServiceRepo,
} from "../../../../src/exchanges";

describe("ExchangeSwapValidationStrategy", () => {
   let mockExchangeServiceRepo: IExchangeServiceRepo;
   let mockExchangeService: IExchangeApiService;
   let testee: ExchangeSwapValidationStrategy;

   beforeEach(() => {
      mockExchangeServiceRepo = mock<IExchangeServiceRepo>();
      mockExchangeService = mock<IExchangeApiService>();
      testee = new ExchangeSwapValidationStrategy(
         instance(mockExchangeServiceRepo)
      );
   });

   it("should throw ValidationError for unsupported exchange", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeSwap,
         adapter: "ccxt",
         config: {
            exchange: "test-exchange",
            base: "BTC",
            quote: "USDT",
            side: Side.Buy,
            maxSlippageBPS: 0.01,
            amount: 123,
         },
      };

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_UNSUPPORTED_EXCHANGE("test-exchange")
      );
   });

   it("should throw ValidationError for unsupported market", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeSwap,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            base: "BTC",
            quote: "USD",
            side: Side.Buy,
            maxSlippageBPS: 0.01,
            amount: 123,
         },
      };

      when(mockExchangeServiceRepo.getExchangeService(anything())).thenReturn(
         instance(mockExchangeService)
      );

      await expect(testee.validate(step)).rejects.toThrow(
         ERR_EXCHANGE_UNSUPPORTED_MARKET(ExchangeId.BINANCE, `BTC/USD`)
      );
   });

   it("should throw ValidationError if exchange service not found", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeSwap,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            base: "BTC",
            quote: "USD",
            side: Side.Buy,
            maxSlippageBPS: 0.01,
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

   it("should return config when validation is successful", async () => {
      const step: CCXTStep = {
         type: StepType.ExchangeSwap,
         adapter: "ccxt",
         config: {
            exchange: ExchangeId.BINANCE,
            base: "BTC",
            quote: "USD",
            side: Side.Buy,
            maxSlippageBPS: 0.01,
            amount: 123,
         },
      };

      when(mockExchangeService.isMarketSupported(anything())).thenResolve(true);

      when(mockExchangeServiceRepo.getExchangeService(anything())).thenReturn(
         instance(mockExchangeService)
      );

      const result = await testee.validate(step);

      expect(result).toEqual(step);
   });
});
