import "reflect-metadata";
import { IValidator, AdapterConfigValidator } from "./../../src/validation/";
import { CCXTAdapterConfig } from "../../src/CCXTAdapterConfig";
import { INVALID_ADAPTER_CONFIGURATION } from "../../src/constants";
import { ExchangeId } from "../../src/types";

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
         ExchangeId.BINANCE
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
                  igd: "binance",
                  api_secret: "TestSecret",
               },
            ],
         },
      };

      expect(() => validator.validate(invalidData)).toThrowError(
         INVALID_ADAPTER_CONFIGURATION
      );
   });

   it("should throw an error if the exchange ID is not supported", () => {
      const invalidData = {
         id: "some-id",
         adapter: "@test-org/adapter-plug",

         config: {
            exchanges: [
               {
                  id: "ftx",
                  api_key: "TestKey",
                  api_secret: "TestSecret",
               },
            ],
         },
      };

      expect(() => validator.validate(invalidData)).toThrowError(
         `${INVALID_ADAPTER_CONFIGURATION}: Unsupported exchange: ftx`
      );
   });

   it("should throw an error if the exchange ID is duplicated", () => {
      const invalidData = {
         id: "some-id",
         adapter: "@test-org/adapter-plug",

         config: {
            exchanges: [
               {
                  id: "binance",
                  api_key: "TestKey",
                  api_secret: "TestSecret",
               },
               {
                  id: "binance",
                  api_key: "TestKey",
                  api_secret: "TestSecret",
               },
            ],
         },
      };

      expect(() => validator.validate(invalidData)).toThrowError(
         `${INVALID_ADAPTER_CONFIGURATION}: Duplicate exchange ID: binance`
      );
   });
});
