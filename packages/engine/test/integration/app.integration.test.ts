import "reflect-metadata";
import * as path from "path";
import { bootstrap } from "../../src/app";
import { Engine } from "../../src/Engine";
import { ExecutionResult } from "@mate/sdk";

describe("App", () => {
   let engine: Engine;

   beforeAll(async () => {
      // Override the config file path to use the example config
      process.env["CONFIG_PATH"] = path.resolve(
         process.cwd(),
         "../../config.example.yaml"
      );

      engine = await bootstrap();
   });

   it("should execute sample flow", async () => {
      const result: ExecutionResult = await engine.execute("test-valid-bridge");

      if (!result.success) {
         console.log(result);
      }

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
   });
});
