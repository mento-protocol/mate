import "reflect-metadata";
import { AdapterConfigValidator } from "../../../src/validation";
import {
   ERR_DUPLICATE_EXCHANGE_ID, 
   ERR_UNSUPPORTED_EXCHANGE,
} from "../../../src/constants"; 
import { CCXTAdapterConfig } from "../../../src/types";
import { ERR_INVALID_ADAPTER_CONFIG, IValidator } from "@mate/sdk";

describe("AdapterConfigValidator", () => {
   let testee: IValidator<CCXTAdapterConfig>;

   beforeEach(() => {
      testee = new AdapterConfigValidator();
   });

   it("should validate correct CCXTAdapterConfig data", async () => {
      const validData = {
         id: "some-id",
         adapter: "@test-org/adapter-plug",

         config: {
            exchanges: [
               {
                  id: "binance",
                  apiKey: "TestKey",
                  apiSecret: "TestSecret",
               },
            ],
         },
      };

      const adapterConfig = await testee.validate(validData);
      expect(adapterConfig).toBeDefined();

      const exchangeConfig = adapterConfig.exchanges[0];

      expect(exchangeConfig).toBeDefined();
      expect(exchangeConfig?.apiKey).toEqual("TestKey");
      expect(exchangeConfig?.apiSecret).toEqual("TestSecret");
   });

   it("should invalidate incorrect CCXTAdapterConfig data", async () => {
      const invalidData = {
         id: "some-id",
         adapter: "@test-org/adapter-plug",

         config: {
            exchanges: [
               {
                  igd: "binance",
                  apiSecret: "TestSecret",
               },
            ],
         },
      };

      await expect(() => testee.validate(invalidData)).rejects.toThrowError(
         ERR_INVALID_ADAPTER_CONFIG
      );
   });

   it("should throw an error if the exchange ID is not supported", async () => {
      const invalidData = {
         id: "some-id",
         adapter: "@test-org/adapter-plug",

         config: {
            exchanges: [
               {
                  id: "ftx",
                  apiKey: "TestKey",
                  apiSecret: "TestSecret",
               },
            ],
         },
      };

      await expect(() => testee.validate(invalidData)).rejects.toThrowError(
         `${ERR_INVALID_ADAPTER_CONFIG}: ${ERR_UNSUPPORTED_EXCHANGE("ftx")}`
      );
   });

   it("should throw an error if the exchange ID is duplicated", async () => {
      const invalidData = {
         id: "some-id",
         adapter: "@test-org/adapter-plug",

         config: {
            exchanges: [
               {
                  id: "binance",
                  apiKey: "TestKey",
                  apiSecret: "TestSecret",
               },
               {
                  id: "binance",
                  apiKey: "TestKey",
                  apiSecret: "TestSecret",
               },
            ],
         },
      };

      await expect(() => testee.validate(invalidData)).rejects.toThrowError(
         `${ERR_INVALID_ADAPTER_CONFIG}: ${ERR_DUPLICATE_EXCHANGE_ID(
            "binance"
         )}`
      );
   });
});
