import "reflect-metadata";
import { AdapterConfigValidator } from "../../../src/validation";
import { CCXTAdapterConfig } from "../../../src/CCXTAdapterConfig";
import {
   ERR_DUPLICATE_EXCHANGE_ID,
   ERR_INVALID_ADAPTER_CONFIG,
   ERR_UNSUPPORTED_EXCHANGE,
} from "../../../src/constants";
import { ExchangeId } from "../../../src/types";
import { IValidator } from "@mate/sdk/src/interfaces";

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
                  api_key: "TestKey",
                  api_secret: "TestSecret",
               },
            ],
         },
      };

      const adapterConfig = await testee.validate(validData);
      expect(adapterConfig).toBeDefined();

      const credentials = (adapterConfig as CCXTAdapterConfig).getCredentials(
         ExchangeId.BINANCE
      );

      expect(credentials).toBeDefined();
      expect(credentials?.apiKey).toEqual("TestKey");
      expect(credentials?.apiSecret).toEqual("TestSecret");
   });

   it("should invalidate incorrect CCXTAdapterConfig data", async () => {
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
                  api_key: "TestKey",
                  api_secret: "TestSecret",
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

      await expect(() => testee.validate(invalidData)).rejects.toThrowError(
         `${ERR_INVALID_ADAPTER_CONFIG}: ${ERR_DUPLICATE_EXCHANGE_ID(
            "binance"
         )}`
      );
   });
});
