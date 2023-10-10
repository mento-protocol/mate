import "reflect-metadata";
import { Balances, binance } from "ccxt";
import { mock, instance, when, verify, anything } from "ts-mockito";
import { BinanceApiService } from "../../../src/exchanges";
import {
   ERR_API_BALANCE_FETCH_FAILURE,
   ERR_API_FETCH_DEPOSIT_ADDRESS_FAILURE,
   ERR_API_FETCH_MARKETS_FAILURE,
   ERR_BALANCE_NOT_FOUND,
} from "../../../src/constants";
import { ChainId } from "../../../src/types";
import { ERR_UNSUPPORTED_CHAIN } from "@mate/sdk";

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

      it("should return false if the asset not supported", async () => {
         when(mockBinance.fetchMarkets()).thenResolve([
            { base: "BTC" },
            { base: "ETH" },
         ]);
         const result = await testee.isAssetSupported("CELO");
         expect(result).toBe(false);
         verify(mockBinance.fetchMarkets()).once();
      });

      it("should throw an error when fetchMarkets fails", async () => {
         when(mockBinance.fetchMarkets()).thenThrow(new Error("Network issue"));

         await expect(testee.isAssetSupported("BTC")).rejects.toThrowError(
            `${ERR_API_FETCH_MARKETS_FAILURE("binance")}:Error: Network issue`
         );
      });
   });

   describe("getCurrencyBalance", () => {
      it("should return the balance for a given currency", async () => {
         const mockBalances = {
            info: {},
            BTC: {
               free: "0.3",
               used: "0.2",
               total: "0.5",
            },
            ETH: {
               free: "1",
               used: "1",
               total: "2",
            },
         } as unknown as Balances;

         when(mockBinance.fetchBalance()).thenResolve(mockBalances);

         const result = await testee.getCurrencyBalance("BTC");
         expect(result).toBe(0.5);
         verify(mockBinance.fetchBalance()).once();
      });

      it("should return 0 if the total balance for a given currency is not a valid number", async () => {
         const mockBalances = {
            info: {},
            BTC: {
               free: "0.3",
               used: "0.2",
               total: "NaN",
            },
            ETH: {
               free: "1",
               used: "1",
               total: "2",
            },
         } as unknown as Balances;
         when(mockBinance.fetchBalance()).thenResolve(mockBalances);

         const result = await testee.getCurrencyBalance("BTC");
         expect(result).toBe(0);
         verify(mockBinance.fetchBalance()).once();
      });

      it("should throw an error if the currency balance isn't found", async () => {
         const mockBalances = {
            info: {},
            ETH: {
               free: "1",
               used: "1",
               total: "2",
            },
         } as unknown as Balances;

         when(mockBinance.fetchBalance()).thenResolve(mockBalances);

         await expect(testee.getCurrencyBalance("BTC")).rejects.toThrowError(
            `${ERR_BALANCE_NOT_FOUND}`
         );
         verify(mockBinance.fetchBalance()).once();
      });

      it("should throw an error if fetching the balance fails", async () => {
         when(mockBinance.fetchBalance()).thenThrow(new Error("API issue"));

         await expect(testee.getCurrencyBalance("BTC")).rejects.toThrowError(
            `${ERR_API_BALANCE_FETCH_FAILURE("BTC")}`
         );
         verify(mockBinance.fetchBalance()).once();
      });
   });

   describe("isMarketSupported", () => {
      it("should return true if the market symbol is supported", async () => {
         when(mockBinance.fetchMarkets()).thenResolve([
            { symbol: "BTC/USDT" },
            { symbol: "ETH/USDT" },
         ]);
         const result = await testee.isMarketSupported("BTC/USDT");
         expect(result).toBe(true);
         verify(mockBinance.fetchMarkets()).once();
      });

      it("should return false if the market symbol is not supported", async () => {
         when(mockBinance.fetchMarkets()).thenResolve([
            { symbol: "BTC/USDT" },
            { symbol: "ETH/USDT" },
         ]);
         const result = await testee.isMarketSupported("CELO/USDT");
         expect(result).toBe(false);
         verify(mockBinance.fetchMarkets()).once();
      });

      it("should throw an error when fetchMarkets fails", async () => {
         when(mockBinance.fetchMarkets()).thenThrow(
            new Error("Network issue for markets")
         );

         await expect(
            testee.isMarketSupported("BTC/USDT")
         ).rejects.toThrowError(
            `${ERR_API_FETCH_MARKETS_FAILURE(
               "binance"
            )}:Error: Network issue for markets`
         );
      });
   });

   describe("getDepositAddress", () => {
      it("should return the correct deposit address for a given currency and chainId", async () => {
         when(
            mockBinance.fetchDepositAddress(anything(), anything())
         ).thenResolve({
            currency: "",
            address: "0xSomeDepositAddress",
            tag: "",
            network: "",
            info: {
               coin: "",
               address: "0xSomeDepositAddress",
               tag: "",
               url: "",
            },
         });

         const result = await testee.getDepositAddress(
            "USDC",
            ChainId.ETHEREUM
         );
         expect(result).toBe("0xSomeDepositAddress");
      });

      it("should throw an error for an unsupported chainId", async () => {
         expect(() =>
            testee.getDepositAddress("USDC", "UNSUPPORTED_CHAIN" as any)
         ).rejects.toThrowError(ERR_UNSUPPORTED_CHAIN("UNSUPPORTED_CHAIN"));
      });

      it("should throw an error if fetching the deposit address fails", async () => {
         when(
            mockBinance.fetchDepositAddress(anything(), anything())
         ).thenThrow(new Error("API issue on fetch deposit address"));

         await expect(
            testee.getDepositAddress("USDC", ChainId.ETHEREUM)
         ).rejects.toThrowError(
            `${ERR_API_FETCH_DEPOSIT_ADDRESS_FAILURE(
               "USDC",
               ChainId.ETHEREUM
            )}:Error: API issue on fetch deposit address`
         );
      });
   });
});
