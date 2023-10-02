import "reflect-metadata";
import { container } from "tsyringe";
import { DependencyRegistrar } from "../../src/DependencyRegistrar";
import {
   ExchangeSwapValidationStrategy,
   IStepValidationStrategy,
   WithdrawCryptoValidationStrategy,
} from "../../src/validation/strategies";
import { ExchangeId, StepType } from "../../src/types";
import { StepConfigValidator } from "../../src/validation";
import {
   ExchangeFactory,
   ExchangeServiceRepo,
   IExchangeFactory,
   IExchangeServiceRepo,
} from "../../src/exchanges";

describe("DependencyRegistrar", () => {
   let testee: DependencyRegistrar;

   beforeAll(() => {
      testee = DependencyRegistrar.getInstance();
      testee.configure();
   });

   it("should correctly register the named validation strategies map", async () => {
      const strategies = container.resolve<
         Map<StepType, IStepValidationStrategy>
      >("ValidationStrategies");

      expect(strategies.size).toBe(2);

      expect(strategies.has(StepType.ExchangeSwap)).toBe(true);
      expect(strategies.has(StepType.ExchangeWithdrawCrypto)).toBe(true);

      expect(strategies.get(StepType.ExchangeSwap)).toBeInstanceOf(
         ExchangeSwapValidationStrategy
      );
      expect(strategies.get(StepType.ExchangeWithdrawCrypto)).toBeInstanceOf(
         WithdrawCryptoValidationStrategy
      );
   });

   it("should correctly register the StepConfigValidator", async () => {
      const validator =
         container.resolve<IStepValidationStrategy>(StepConfigValidator);

      expect(validator).toBeInstanceOf(StepConfigValidator);
   });

   it("should correctly register the ExchangeFactory", async () => {
      const factory = container.resolve<IExchangeFactory>(ExchangeFactory);

      expect(factory).toBeInstanceOf(ExchangeFactory);
   });

   it("should correctly register the ExchangeServiceRepo as a singleton", async () => {
      // Resolve the repo and verify it's an instance of ExchangeServiceRepo
      const repoInstance =
         container.resolve<IExchangeServiceRepo>(ExchangeServiceRepo);
      expect(repoInstance).toBeInstanceOf(ExchangeServiceRepo);

      // Add an exchange service to the repo
      const exchangeService = {} as any;
      repoInstance.setExchangeService(ExchangeId.BINANCE, exchangeService);

      // Resolve the repo again and verify it's the same instance
      const repoInstance2 =
         container.resolve<IExchangeServiceRepo>(ExchangeServiceRepo);
      expect(repoInstance2).toBe(repoInstance);

      // Verify the exchange service is retrievable from the second instance
      const retrievedExchangeService = repoInstance2.getExchangeService(
         ExchangeId.BINANCE
      );
      expect(retrievedExchangeService).toBe(exchangeService);
   });
});
