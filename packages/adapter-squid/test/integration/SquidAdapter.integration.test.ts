import "reflect-metadata";
import * as path from "path";
import pkg from "../../package.json";
import { DependencyRegistrar } from "../../src/DependencyRegistrar";
import {
   ConfigProvider,
   IConfigProvider,
   DependencyRegistrar as SdkDependencyRegistrar,
} from "@mate/sdk";
import { SquidAdapter } from "../../src/SquidAdapter";
import { container } from "tsyringe";

describe("SquidAdapter Integration", () => {
   let adapter: SquidAdapter;
   let configProvider: IConfigProvider;

   beforeAll(() => {
      // Override the config file path to use the example config
      process.env["CONFIG_PATH"] = path.resolve(
         process.cwd(),
         "../../config.example.yaml"
      );

      // Configure the global container
      SdkDependencyRegistrar.configure();
      DependencyRegistrar.configure();

      // Get an instance of the adapter from the container
      adapter = container.resolve(pkg.name);

      // Get an instance of the config provider from the container
      configProvider = container.resolve(ConfigProvider);
   });

   describe("Init", () => {
      it("should initialize the adapter", async () => {
         expect(await adapter.init()).toBe(true);
      });
   });

   describe("IsValid", () => {
      beforeAll(async () => {
         await adapter.init();
      });

      it("should return true for a valid step", async () => {
         // Get a valid step from the config
         const step = configProvider.getStepFromFlow("bridge-and-deposit", 0);

         // Validate the step
         const result = await adapter.isValid(step);

         // Check the result
         expect(result.isValid).toBe(true);
      });

      it("should return false for an invalid step", async () => {
         // Get an invalid step from the config
         const step = configProvider.getStepFromFlow("bridge-and-deposit", 1);

         // Validate the step
         const result = await adapter.isValid(step);

         // Check the result
         expect(result.isValid).toBe(false);
      });
   });

   describe("Execute", () => {
      beforeAll(async () => {
         await adapter.init();
      });

      it("should execute a valid step", async () => {
         // Get a valid step from the config
         const step = configProvider.getStepFromFlow("bridge-and-deposit", 0);

         // Execute the step
         const result = await adapter.execute(step);

         // Check the result
         expect(result).toBeDefined();

         // To help with debugging the integration test in workflow runs
         if (result.data?.errorMessage) {
            console.log("errorMessage: " + result.data.errorMessage);
         }

         expect(result.success).toBe(true);
         expect(result.data.txHash).not.toBeNull();
         console.log("txHash: " + result.data.txHash);
      });
   });
});
