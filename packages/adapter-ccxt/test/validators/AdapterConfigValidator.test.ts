import "reflect-metadata";

import { CCXTAdapterConfig } from "../../src/CCXTAdapterConfig";
import { IValidator } from "../../src/validators/IValidator";
import { AdapterConfigValidator } from "./../../src/validators/AdapterConfigValidator";
import { INVALID_ADAPTER_CONFIGURATION } from "../../src/constants";

describe("AdapterConfigValidator", () => {
   let validator: IValidator<CCXTAdapterConfig>;

   beforeEach(() => {
      validator = new AdapterConfigValidator();
   });

   it("should validate correct CCXTAdapterConfig data", () => {
      const validData = {
         id: "some-id",
         adapter: "@test-org/adapter-plug",

         config: {
            exchanges: [
               {
                  id: "binance",
                  api_key: "TestKey",
                  api_secret: "TestSecret",
               },
            ],
         },
      };

      const adapterConfig = validator.validate(validData);
      expect(adapterConfig).toBeDefined();

      const credentials = (adapterConfig as CCXTAdapterConfig).getCredentials(
         "binance"
      );

      expect(credentials).toBeDefined();
      expect(credentials?.apiKey).toEqual("TestKey");
      expect(credentials?.apiSecret).toEqual("TestSecret");
   });

   it("should invalidate incorrect CCXTAdapterConfig data", () => {
      const invalidData = {
         id: "some-id",
         adapter: "@test-org/adapter-plug",

         config: {
            exchanges: [
               {
                  id: "binance",
                  api_secret: "TestSecret",
               },
            ],
         },
      };

      expect(() => validator.validate(invalidData)).toThrowError(
         INVALID_ADAPTER_CONFIGURATION
      );
   });
});
