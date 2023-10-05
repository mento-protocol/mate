import "reflect-metadata";
import { anything, instance, mock, verify, when } from "ts-mockito";
import { StepConfigValidator } from "../../../src/validation";
import { IStepValidationStrategy } from "../../../src/validation/strategies";
import { CCXTStep, Side, StepType } from "../../../src/types";
import { ERR_INVALID_STEP_CONFIG, ERR_UNSUPPORTED_STEP } from "@mate/sdk";

describe("StepConfigValidator", () => {
   let validator: StepConfigValidator;
   let mockStrategy: IStepValidationStrategy;
   let mockStrategiesMap: Map<StepType, IStepValidationStrategy>;

   beforeEach(() => {
      mockStrategy = mock<IStepValidationStrategy>();
      mockStrategiesMap = new Map<StepType, IStepValidationStrategy>();
      mockStrategiesMap.set(
         StepType.ExchangeWithdrawCrypto,
         instance(mockStrategy)
      );

      validator = new StepConfigValidator(mockStrategiesMap);
   });

   it("should validate using the correct strategy when data is valid", async () => {
      const validData: CCXTStep = {
         type: StepType.ExchangeWithdrawCrypto,
         adapter: "ccxt",
         config: {
            exchange: "test-exchange",
            asset: "BTC",
            chainId: "test-chain",
            destinationAddress: "test-address",
            amount: 123,
         },
      };

      when(mockStrategy.validate(anything())).thenResolve(validData);

      const result = await validator.validate(validData);
      expect(result).toEqual(validData);

      verify(mockStrategy.validate(validData)).once();
   });

   it("should throw ValidationError on invalid data structure", async () => {
      const invalidConfig = {
         type: "Tall, dark & handsome",
      };

      await expect(validator.validate(invalidConfig)).rejects.toThrow(
         ERR_INVALID_STEP_CONFIG
      );
   });

   it("should throw ValidationError when no strategy found for a step type", async () => {
      const dataWithNoStrategy: CCXTStep = {
         type: StepType.ExchangeSwap,
         adapter: "ccxt",
         config: {
            exchange: "test-exchange",
            base: "BTC",
            quote: "USDT",
            side: Side.Buy,
            maxSlippageBPS: 100,
            amount: 123,
         },
      };

      await expect(validator.validate(dataWithNoStrategy)).rejects.toThrow(
         ERR_UNSUPPORTED_STEP(StepType.ExchangeSwap)
      );
   });
});
