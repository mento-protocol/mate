import "reflect-metadata";
import { ConfigProvider } from "./../src/ConfigProvider";
import * as fs from "fs";

jest.mock("fs");

describe("ConfigProvider", () => {
   const validConfig = `settings:
   globalVariables:
      primaryPrivateKey: 0xKey
      primaryAddress: 0xAddress
adapters:
   - id: ccxt
     adapter: "@mate/adapter-ccxt"
     config:
       some: thing
flows:
   - name: USD to cUSD
     id: USD-to-cUSD
     description: "Do some stuff, do we even need a desc -___-"
     steps:
        - type: Exchange.Swap
          adapter: ccxt
          config:
             exchange: binance
             from: USD
             to: BUSD
             maxSlippageBPS: 20
             amount: 1000
        - type: Exchange.WithdrawCrypto
          adapter: ccxt
          config:
             exchange: binance
             asset: BUSD
             chain: BSC
             address: ...
        - type: Bridge.Swap
          adapter: squid
          config:
             from:
                chain: BSC
                asset: BUSD
             to:
                chain: CELO
                asset: cUSD
             amount: max
             maxSlippageBPS: 20`;

   describe("init", () => {
      it("should throw an error if the config file is not found", () => {
         jest.spyOn(fs, "existsSync").mockReturnValue(false);

         expect(() => new ConfigProvider()).toThrowError(
            `Config file was not found at config.yaml.`
         );
      });

      it("should throw an error if the config file is not valid YAML", () => {
         const invalidYaml = "invalid: yaml:string:";

         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(invalidYaml);

         expect(() => new ConfigProvider()).toThrowError(
            `Failed to parse config.`
         );
      });

      it("should throw an error if the config file is missing the 'adapters' field", () => {
         const invalidConfig = `
flows:
   - name: USD to cUSD
     id: USD-to-cUSD
     description: "Do some stuff, do we even need a desc -___-"
     steps:
        - type: Exchange.Swap
          adapter: ccxt
          config:
             exchange: binance
             from: USD
             to: BUSD
             maxSlippageBPS: 20
             amount: 1000
        - type: Exchange.WithdrawCrypto
          adapter: ccxt
          config:
             exchange: binance
             asset: BUSD
             chain: BSC
             address: ...
        - type: Bridge.Swap
          adapter: squid
          config:
             from:
                chain: BSC
                asset: BUSD
             to:
                chain: CELO
                asset: cUSD
             amount: max
             maxSlippageBPS: 20`;

         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(invalidConfig);

         expect(() => new ConfigProvider()).toThrowError(
            `Expected 'adapters' section was not found in the config file.`
         );
      });

      it("should throw an error if the config file is missing the 'flows' field", () => {
         const invalidConfig = `adapters:
   - id: ccxt
     adapter: "@mate/adapter-ccxt"
     config:
        exchanges:
           - id: binance
             api_key: "TestKey"
             api_secret: "TestSecret"`;

         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(invalidConfig);

         expect(() => new ConfigProvider()).toThrowError(
            `Expected 'flows' section was not found in the config file.`
         );
      });

      it("should throw an error if the adapter configuration is missing the id field", () => {
         const invalidConfig = `adapters:
   - adapter: "@mate/adapter-ccxt"
     config:
        exchanges:
           - id: binance
             api_key: "TestKey"
             api_secret: "TestSecret"
flows:
   - name: USD to cUSD
     id: USD-to-cUSD
     description: "Do some stuff, do we even need a desc -___-"
     steps:
        - type: Exchange.Swap
          adapter: ccxt
          config:
             exchange: binance
             from: USD
             to: BUSD
             maxSlippageBPS: 20
             amount: 1000
        - type: Exchange.WithdrawCrypto
          adapter: ccxt
          config:
             exchange: binance
             asset: BUSD
             chain: BSC
             address: ...
        - type: Bridge.Swap
          adapter: squid
          config:
             from:
                chain: BSC
                asset: BUSD
             to:
                chain: CELO
                asset: cUSD
             amount: max
             maxSlippageBPS: 20
`;

         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(invalidConfig);

         expect(() => new ConfigProvider()).toThrowError(
            `Adapter field 'id' is missing.`
         );
      });

      it("should throw an error if the adapter configuration is missing the adapter field", () => {
         const invalidConfig = `adapters:
   - id: ccxt
     config:
        exchanges:
           - id: binance
             api_key: "TestKey"
             api_secret: "TestSecret"
flows:
   - name: USD to cUSD
     id: USD-to-cUSD
     description: "Do some stuff, do we even need a desc -___-"
     steps:
        - type: Exchange.Swap
          adapter: ccxt
          config:
             exchange: binance
             from: USD
             to: BUSD
             maxSlippageBPS: 20
             amount: 1000
        - type: Exchange.WithdrawCrypto
          adapter: ccxt
          config:
             exchange: binance
             asset: BUSD
             chain: BSC
             address: ...
        - type: Bridge.Swap
          adapter: squid
          config:
             from:
                chain: BSC
                asset: BUSD
             to:
                chain: CELO
                asset: cUSD
             amount: max
             maxSlippageBPS: 20
`;

         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(invalidConfig);

         expect(() => new ConfigProvider()).toThrowError(
            `Adapter field 'adapter' is missing.`
         );
      });

      it("should throw an error if the adapter configuration is missing the configuration", () => {
         const invalidConfig = `adapters:
   - id: ccxt
     adapter: "@mate/adapter-ccxt" 
flows:
   - name: USD to cUSD
     id: USD-to-cUSD
     description: "Do some stuff, do we even need a desc -___-"
     steps:
        - type: Exchange.Swap
          adapter: ccxt
          config:
             exchange: binance
             from: USD
             to: BUSD
             maxSlippageBPS: 20
             amount: 1000
        - type: Exchange.WithdrawCrypto
          adapter: ccxt
          config:
             exchange: binance
             asset: BUSD
             chain: BSC
             address: ...
        - type: Bridge.Swap
          adapter: squid
          config:
             from:
                chain: BSC
                asset: BUSD
             to:
                chain: CELO
                asset: cUSD
             amount: max
             maxSlippageBPS: 20
`;

         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(invalidConfig);

         expect(() => new ConfigProvider()).toThrowError(
            `Adapter field 'config' is missing.`
         );
      });

      it("should throw an error if there is a duplicate adapter id", () => {
         const invalidConfig = `adapters:
   - id: ccxt
     adapter: "@mate/adapter-ccxt"
     config:
       some: thing
   - id: ccxt
     adapter: "@mate/adapter-ccxt"
     config:
       some: thing
flows:
   - name: USD to cUSD
     id: USD-to-cUSD
     description: "Do some stuff, do we even need a desc -___-"
     steps:
        - type: Exchange.Swap
          adapter: ccxt
          config:
             exchange: binance
             from: USD
             to: BUSD
             maxSlippageBPS: 20
             amount: 1000
        - type: Exchange.WithdrawCrypto
          adapter: ccxt
          config:
             exchange: binance
             asset: BUSD
             chain: BSC
             address: ...
        - type: Bridge.Swap
          adapter: squid
          config:
             from:
                chain: BSC
                asset: BUSD
             to:
                chain: CELO
                asset: cUSD
             amount: max
             maxSlippageBPS: 20
`;

         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(invalidConfig);

         expect(() => new ConfigProvider()).toThrowError(
            `A duplicate adapter id was found.`
         );
      });

      it("should not throw if config file is valid", () => {
         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(validConfig);

         expect(() => new ConfigProvider()).not.toThrow();
      });
   });

   describe("getAdapterConfig", () => {
      let configProvider: ConfigProvider;

      beforeAll(() => {
         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(validConfig);
      });

      beforeEach(() => {
         configProvider = new ConfigProvider();
      });

      afterEach(() => {
         jest.restoreAllMocks();
      });

      it("should retrieve the correct adapter configuration by ID", () => {
         const adapterConfig = configProvider.getAdapterConfig("ccxt");

         expect(adapterConfig).not.toBeNull();
         expect(adapterConfig?.id).toBe("ccxt");
         expect(adapterConfig?.adapter).toBe("@mate/adapter-ccxt");
      });

      it("should return null for a non-existent adapter ID", () => {
         const adapterConfig = configProvider.getAdapterConfig("nonexistent");
         expect(adapterConfig).toBeNull();
      });
   });

   describe("getGlobalVariable", () => {
      let configProvider: ConfigProvider;

      beforeAll(() => {
         jest.spyOn(fs, "existsSync").mockReturnValue(true);
         jest.spyOn(fs, "readFileSync").mockReturnValue(validConfig);
      });

      beforeEach(() => {
         configProvider = new ConfigProvider();
      });

      afterEach(() => {
         jest.restoreAllMocks();
      });

      //TODO: Refactor config provider to override in a better way or update GH action to replace values in the config file
      it.skip("should retrieve the correct global variable value by name", () => {
         const primaryKey =
            configProvider.getGlobalVariable("primaryPrivateKey");
         expect(primaryKey).toBe("0xKey");

         const primaryAddress =
            configProvider.getGlobalVariable("primaryAddress");
         expect(primaryAddress).toBe("0xAddress");
      });

      it("should return null for a non-existent global variable", () => {
         const someVariable = configProvider.getGlobalVariable("nonexistent");
         expect(someVariable).toBeNull();
      });
   });
});
