import "reflect-metadata";
import { Squid } from "@0xsquid/sdk";
import { mock, instance, when } from "ts-mockito";
import { SquidProvider } from "../../../src/services";

describe("SquidProvider", () => {
   let squidMock: Squid;
   let testee: SquidProvider;

   beforeEach(() => {
      squidMock = mock(Squid);
      testee = new SquidProvider();

      (testee as any).squid = instance(squidMock);
   });

   describe("init", () => {
      it("should initialize successfully", async () => {
         await testee.init({
            baseUrl: "https://test.com",
            integratorId: "testId",
         });

         expect(() => testee.getSquid()).not.toThrow();
      });

      it("should throw error if trying to initialize twice", async () => {
         await testee.init({
            baseUrl: "https://test.com",
            integratorId: "testId",
         });

         await expect(
            testee.init({
               baseUrl: "https://test.com",
               integratorId: "testId",
            })
         ).rejects.toThrow("SquidProvider is already initialised");
      });

      it("should throw error on initialization failure", async () => {
         when(squidMock.init()).thenReject(new Error("Init error"));

         await expect(
            testee.init({
               baseUrl: "https://test.com",
               integratorId: "testId",
            })
         ).rejects.toThrow("SquidProvider initialization error: Init error");
      });
   });

   describe("getSquid", () => {
      it("should throw error if trying to get Squid before initialization", () => {
         expect(() => testee.getSquid()).toThrow(
            "SquidProvider not initialised"
         );
      });

      it("should return Squid instance after successful initialization", async () => {
         await testee.init({
            baseUrl: "https://test.com",
            integratorId: "testId",
         });

         const squidInstance = testee.getSquid();
         expect(squidInstance).toBe(instance(squidMock));
      });
   });
});
