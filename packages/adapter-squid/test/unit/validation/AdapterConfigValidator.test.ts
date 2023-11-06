import "reflect-metadata";
import { AdapterConfigValidator } from "../../../src/validation/AdapterConfigValidator";
import { SquidAdapterConfig } from "../../../src/types";
import { ERR_INVALID_ADAPTER_CONFIG, IValidator } from "@mate/sdk";

describe("AdapterConfigValidator", () => {
   let testee: IValidator<SquidAdapterConfig>;

   beforeEach(() => {
      testee = new AdapterConfigValidator();
   });

   it("should validate correct SquidAdapterConfig data", async () => {
      const validData = {
         integratorId: "some-integrator-id",
         baseUrl: "https://example.com",
      };

      const adapterConfig = await testee.validate(validData);
      expect(adapterConfig).toBeDefined();
      expect(adapterConfig.integratorId).toEqual("some-integrator-id");
      expect(adapterConfig.baseUrl).toEqual("https://example.com");
   });

   it("should invalidate incorrect SquidAdapterConfig data (missing fields)", async () => {
      const invalidData = {
         integratorId: "some-integrator-id",
      };

      await expect(() => testee.validate(invalidData)).rejects.toThrowError(
         ERR_INVALID_ADAPTER_CONFIG
      );
   });

   it("should invalidate incorrect SquidAdapterConfig data (wrong types)", async () => {
      const invalidData = {
         integratorId: 12345,
         baseUrl: "https://example.com",
      };

      await expect(() => testee.validate(invalidData)).rejects.toThrowError(
         ERR_INVALID_ADAPTER_CONFIG
      );
   });
});
