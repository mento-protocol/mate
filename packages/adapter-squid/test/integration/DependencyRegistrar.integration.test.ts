import "reflect-metadata";
import * as path from "path";
import { container } from "tsyringe";
import {
   IValidator,
   DependencyRegistrar as SdkDependencyRegistrar,
} from "@mate/sdk";
import { DependencyRegistrar as SquidDependencyRegistrar } from "../../src/DependencyRegistrar";
import {
   ISignerService,
   ISquidProvider,
   SignerService,
   SquidProvider,
} from "../../src/services";
import { SquidStep } from "../../src/types";
import { StepConfigValidator } from "../../src/validation";

describe("DependencyRegistrar", () => {
   const baseUrl = "https://testnet.api.squidrouter.com";
   const integratorId = "mate-sdk";

   beforeAll(() => {
      // Override the config file path to point to the exapmle config
      process.env["CONFIG_PATH"] = path.resolve(
         __dirname,
         "../../../../config.example.yaml"
      );

      SdkDependencyRegistrar.configure();
      SquidDependencyRegistrar.configure();
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

   it("should correctly register SignerService", () => {
      const instance = container.resolve<ISignerService>(SignerService);
      expect(instance).toBeInstanceOf(SignerService);
   });
});
