import "reflect-metadata";
import { container } from "tsyringe";
import { IValidator } from "@mate/sdk";
import { DependencyRegistrar } from "../../src/DependencyRegistrar";
import { ISquidProvider, SquidProvider } from "../../src/services";
import { SquidStep } from "../../src/types";
import { StepConfigValidator } from "../../src/validation";

describe("DependencyRegistrar", () => {
   let registrar: DependencyRegistrar;

   const baseUrl = "https://testnet.api.squidrouter.com";
   const integratorId = "mate-sdk";

   beforeAll(() => {
      registrar = DependencyRegistrar.getInstance();
      registrar.configure();
   });

   it("should correctly register ISquidProvider as singleton", async () => {
      // Resolve the provider and verify it's an instance of SquidProvider
      const instance = container.resolve<ISquidProvider>(SquidProvider);
      expect(instance).toBeInstanceOf(SquidProvider);

      // Initialize the provider
      await instance.init({
         baseUrl: baseUrl,
         integratorId: integratorId,
      });

      // Resolve the provider again and verify it's the same instance
      const secondInstance = container.resolve<ISquidProvider>(SquidProvider);
      expect(secondInstance).toBe(instance);

      // Initialize the provider again and verify it throws an error
      await expect(
         secondInstance.init({
            baseUrl: baseUrl,
            integratorId: integratorId,
         })
      ).rejects.toThrow("SquidProvider is already initialised");
   });

   it("should correctly register IValidator<SquidStep>", () => {
      const instance =
         container.resolve<IValidator<SquidStep>>(StepConfigValidator);
      expect(instance).toBeInstanceOf(StepConfigValidator);
   });
});
