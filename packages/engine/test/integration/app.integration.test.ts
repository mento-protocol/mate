import "reflect-metadata";
import { bootstrap } from "../../src/app";
import { Engine } from "../../src/Engine";
import { ExecutionResult } from "@mate/sdk";

describe("App", () => {
   let engine: Engine;

   beforeAll(() => {
      bootstrap().then((eng) => {
         engine = eng;
      });
   });

   // TODO: Execution depends on open PR https://github.com/mento-protocol/mate/pull/28
   //       Omce that is merged, this test can be enabled
   it.skip("should execute sample flow", async () => {
      const result: ExecutionResult = await engine.execute("auscd-to-ausdc");
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
   });
});
