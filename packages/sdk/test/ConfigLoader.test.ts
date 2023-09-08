import "reflect-metadata";
import { ConfigLoader } from "./../src/ConfigLoader";
import * as fs from "fs";

jest.mock("fs");

describe("ConfigLoader", () => {
   describe("loadConfig", () => {
      it("should throw an error if the config file is not found", () => {
         jest.spyOn(fs, "existsSync").mockReturnValue(false);

         expect(() => new ConfigLoader()).toThrowError(
            `Config file not found at config.yaml`
         );
      });

      it("should throw an error if the config file is not valid YAML", () => {
         const invalidYaml = "invalid: yaml: string:";

         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(invalidYaml);

         expect(() => new ConfigLoader()).toThrowError(`Failed to parse YAML.`);
      });

      it("should throw an error if the config file is missing the 'adapters' field", () => {
         const invalidConfig = `
some:
  config: string
`;

         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(invalidConfig);

         expect(() => new ConfigLoader()).toThrowError(
            `Expected 'adapters' field missing in the config file.`
         );
      });

      it("should throw an error if the adapter configuration is missing or has an invalid id field", () => {
         jest.spyOn(fs, "readFileSync").mockReturnValue(`
      adapters:
        - some: config
    `);

         expect(() => new ConfigLoader()).toThrowError(
            `Adapter configuration is missing or has an invalid 'id' field.`
         );
      });

      it("should throw an error if there is a duplicate adapter id", () => {
         jest.spyOn(fs, "readFileSync").mockReturnValue(`
      adapters:
        - id: duplicate
          some: config
        - id: duplicate
          some: config
    `);

         expect(() => new ConfigLoader()).toThrowError(
            `Duplicate adapter id found: duplicate`
         );
      });
   });

   describe("getAdapterConfig", () => {
      let configLoader: ConfigLoader;

      // Setup
      beforeAll(() => {
         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockImplementation(function () {
            return `adapters:
- id: ccxt
  adapter: "@mate/adapter-ccxt"
  config:
    exchanges:
    - name: binance
      api_key: "TestKey"
      api_secret: "TestSecret"`;
         });
      });

      beforeEach(() => {
         configLoader = new ConfigLoader();
      });

      afterEach(() => {
         jest.restoreAllMocks();
      });

      it("should retrieve the correct adapter configuration by ID", () => {
         const adapterConfig = configLoader.getAdapterConfig("ccxt");

         expect(adapterConfig).not.toBeNull();
         expect(adapterConfig?.id).toBe("ccxt");
         expect(adapterConfig?.adapter).toBe("@mate/adapter-ccxt");
      });

      it("should return null for a non-existent adapter ID", () => {
         const adapterConfig = configLoader.getAdapterConfig("nonexistent");

         expect(adapterConfig).toBeNull();
      });
   });
});
