import "reflect-metadata";
import { binance } from "ccxt";
import { mock, instance, when, verify } from "ts-mockito";
import { BinanceApiService } from "../../../src/exchanges";
import { ERR_API_FETCH_MARKETS_FAILURE } from "../../../src/constants";

describe("BinanceApiService", () => {
   let mockBinance: binance;
   let testee: BinanceApiService;

   beforeEach(() => {
      mockBinance = mock<binance>();
      testee = new BinanceApiService(instance(mockBinance));

      when(mockBinance.id).thenReturn("binance");
   });

   describe("isAssetSupported", () => {
      it("should return true if the asset is supported", async () => {
         when(mockBinance.fetchMarkets()).thenResolve([
            { base: "BTC" },
            { base: "ETH" },
         ]);
         const result = await testee.isAssetSupported("btc");
         expect(result).toBe(true);
         verify(mockBinance.fetchMarkets()).once();
      });

      it("should throw an error when fetchMarkets fails", async () => {
         when(mockBinance.fetchMarkets()).thenThrow(new Error("Network issue"));

         await expect(testee.isAssetSupported("BTC")).rejects.toThrowError(
            `${ERR_API_FETCH_MARKETS_FAILURE("binance")}:Error: Network issue`
         );
      });
   });
});
