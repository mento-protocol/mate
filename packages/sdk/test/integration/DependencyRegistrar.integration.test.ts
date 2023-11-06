import "reflect-metadata";
import * as path from "path";
import { container } from "tsyringe";
import { DependencyRegistrar } from "../../src/DependencyRegistrar";
import { IConfigProvider } from "../../src/interfaces/IConfigProvider";
import { ConfigProvider } from "../../src/ConfigProvider";

describe("DependencyRegistrar", () => {
   beforeAll(() => {
      // Override the config file path to point to the exapmle config
      process.env["CONFIG_PATH"] = path.resolve(
         process.cwd(),
         "../../config.example.yaml"
      );
      DependencyRegistrar.configure();
   });

   it("should correctly register IConfigProvider as singleton", async () => {
      const instance = container.resolve<IConfigProvider>(ConfigProvider);
      expect(instance).toBeInstanceOf(ConfigProvider);

      // Resolve the provider again and verify it's the same instance
      const secondInstance = container.resolve<IConfigProvider>(ConfigProvider);
      expect(secondInstance).toBe(instance);
   });
});
