import "reflect-metadata";
import "dotenv/config";
import { binance } from "ccxt";
import { BinanceApiService } from "../../../src/exchanges";

describe("BinanceApiService Integration", () => {
   let testee: BinanceApiService;
   let exchange: binance;

   beforeAll(() => {
      exchange = new binance({
         apiKey: process.env.BINANCE_API_KEY,
         secret: process.env.BINANCE_API_SECRET,
      });

      exchange.setSandboxMode(true);

      testee = new BinanceApiService(exchange);
   });

   describe("isAssetSupported", () => {
      it("should return true if the asset is supported", async () => {
         const result = await testee.isAssetSupported("BTC");
         expect(result).toBe(true);
      });

      it("should return false if the asset is not supported", async () => {
         const result = await testee.isAssetSupported("NON_EXISTENT_ASSET");
         expect(result).toBe(false);
      });
   });

   describe("getCurrencyBalance", () => {
      it("should return the balance for BTC", async () => {
         const result = await testee.getCurrencyBalance("BTC");
         expect(result).toBeGreaterThan(0);
      });
   });

   describe("isMarketSupported", () => {
      it("should return true if the market is supported", async () => {
         const result = await testee.isMarketSupported("BTC/USDT");
         expect(result).toBeTruthy();
      });

      it("should return false if the market is not supported", async () => {
         const result = await testee.isMarketSupported("BTC/MOJIMBO454");
         expect(result).toBeFalsy();
      });
   });
});
