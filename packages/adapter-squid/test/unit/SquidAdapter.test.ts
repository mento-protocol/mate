import "reflect-metadata";

import { SquidAdapter } from "./../../src/SquidAdapter";
import { mock, instance, when, anything, verify } from "ts-mockito";
import {
   ConfigProvider,
   ERR_ADAPTER_CONFIG_MISSING,
   ERR_ADAPTER_EXECUTE_FAILURE,
   ERR_ADAPTER_INIT_FAILURE,
   IConfigProvider,
   IValidator,
} from "@mate/sdk";
import { SquidStep, StepType } from "../../src/types";
import {
   ISignerService,
   ISquidProvider,
   SignerService,
   SquidProvider,
} from "../../src/services";
import { StepConfigValidator } from "../../src/validation";
import { RouteData, Squid } from "@0xsquid/sdk";
import {
   ERR_GET_ROUTE_FAILURE,
   ERR_TX_RECEIPT_MISSING,
} from "../../src/constants";
import { BigNumber, Wallet, providers } from "ethers";

describe("SquidAdapter", () => {
   let adapter: SquidAdapter;
   let mockStepConfigValidator: IValidator<SquidStep>;
   let mockSquidProvider: ISquidProvider;
   let mockConfigProvider: IConfigProvider;
   let mockSignerService: ISignerService;
   let mockSquid: Squid;

   const mockConfig = {
      adapter: "squid",
      id: "squid",
      config: {
         baseUrl: "testBaseUrl",
         integratorId: "testIntegratorId",
      },
   };

   //TODO: Config codec | Setp type is off
   const mockStep: any = {
      type: StepType.BridgeSwap,
      adapter: "squid",
      config: {
         config: {
            fromChain: 123456,
            fromToken: "0xDai",
            fromAmount: "10000",
            toChain: 123456,
            toToken: "0xUSDC",
            toAddress: 234567,
            maxSlippage: 0.01,
         },
      },
   };

   function setupSquidMock() {
      mockSquidProvider = mock<SquidProvider>();
      mockSquid = mock<Squid>();

      let mockTransactionRecipt: providers.TransactionReceipt = {
         transactionHash: "someHash",
      } as providers.TransactionReceipt;

      let mockTransactionResponse: providers.TransactionResponse = {
         hash: "someHash",
         confirmations: 0,
         from: "mockAddress",
         nonce: 0,
         gasLimit: BigNumber.from(0),
         gasPrice: BigNumber.from(0),
         data: "mockData",
         value: BigNumber.from(0),
         chainId: 0,
         wait: () => Promise.resolve(mockTransactionRecipt),
      };

      // Return fake route data obj when getRoute is called
      when(mockSquid.getRoute(anything())).thenResolve({
         route: {} as RouteData,
      });

      // Return fake transaction response when executeRoute is called
      when(mockSquid.executeRoute(anything())).thenResolve(
         mockTransactionResponse
      );

      // When provider get squid is called return mock squid instance
      when(mockSquidProvider.getSquid()).thenReturn(instance(mockSquid));
   }

   beforeEach(() => {
      mockStepConfigValidator = mock<StepConfigValidator>();
      mockConfigProvider = mock<ConfigProvider>();
      mockSignerService = mock<SignerService>();

      when(mockConfigProvider.getGlobalVariable(anything())).thenReturn(
         "fakeVariable"
      );

      when(mockSignerService.getSignerForChain(anything())).thenReturn(
         {} as Wallet
      );

      setupSquidMock();

      adapter = new SquidAdapter(
         instance(mockStepConfigValidator),
         instance(mockSquidProvider),
         instance(mockConfigProvider),
         instance(mockSignerService)
      );
   });

   describe("init", () => {
      it("should initialize correctly with proper config", async () => {
         when(mockConfigProvider.getAdapterConfig(anything())).thenReturn(
            mockConfig
         );
         when(mockSquidProvider.init(anything())).thenResolve();

         const result = await adapter.init();
         expect(result).toBe(true);
      });

      it("should throw error on missing adapter config", async () => {
         when(mockConfigProvider.getAdapterConfig(anything())).thenReturn(null);

         await expect(adapter.init()).rejects.toThrow(
            ERR_ADAPTER_CONFIG_MISSING
         );
      });

      it("should throw error on SquidProvider initialization failure", async () => {
         when(mockConfigProvider.getAdapterConfig(anything())).thenReturn(
            mockConfig
         );
         when(mockSquidProvider.init(anything())).thenThrow(
            new Error("Initialization error")
         );

         await expect(adapter.init()).rejects.toThrow(ERR_ADAPTER_INIT_FAILURE);
      });
   });

   describe("isValid", () => {
      it("should validate a step correctly", async () => {
         when(mockStepConfigValidator.validate(anything())).thenResolve();

         const validationResult = await adapter.isValid(mockStep);
         verify(mockStepConfigValidator.validate(mockStep)).once();
         expect(validationResult.isValid).toBe(true);
         expect(validationResult.errors.length).toBe(0);
      });

      it("should handle validation errors", async () => {
         when(mockStepConfigValidator.validate(anything())).thenReject(
            new Error("Test Error")
         );

         const validationResult = await adapter.isValid(mockStep);
         verify(mockStepConfigValidator.validate(mockStep)).once();
         expect(validationResult.isValid).toBe(false);
         expect(validationResult.errors.length).toBe(1);
         expect(validationResult.errors[0]).toBe("Test Error");
      });
   });

   describe("execute", () => {
      beforeEach(() => {});

      it("should execute the step correctly and return the transaction hash", async () => {
         const result = await adapter.execute(mockStep);

         expect(result.success).toBe(true);
         expect(result.data.txHash).toBe("someHash");
         verify(mockSquid.executeRoute(anything())).once();
      });

      it("should handle execution errors", async () => {
         when(mockSquid.executeRoute(anything())).thenReject(
            new Error("Execution error")
         );

         const result = await adapter.execute(mockStep);

         expect(result.success).toBe(false);
         expect(result.data.errorMessage).toBe(
            `${ERR_ADAPTER_EXECUTE_FAILURE}:Execution error`
         );
      });

      it("should handle missing transaction receipts", async () => {
         when(mockSquid.executeRoute(anything())).thenResolve({
            hash: "someHash",
            confirmations: 0,
            from: "mockAddress",
            nonce: 0,
            gasLimit: BigNumber.from(0),
            gasPrice: BigNumber.from(0),
            data: "mockData",
            value: BigNumber.from(0),
            chainId: 0,
            wait: () => Promise.resolve(null) as any,
         });

         const result = await adapter.execute(mockStep);

         expect(result.success).toBe(false);
         expect(result.data.errorMessage).toBe(ERR_TX_RECEIPT_MISSING);
      });

      it("should handle getRoute failures", async () => {
         const error = new Error(`Couldn't get a route`);

         when(mockSquid.getRoute(anything())).thenReject(error);

         const result = await adapter.execute(mockStep);

         expect(result.success).toBe(false);
         expect(result.data.errorMessage).toBe(
            `${ERR_ADAPTER_EXECUTE_FAILURE}:${ERR_GET_ROUTE_FAILURE}:${error.message}`
         );
      });
   });

   describe("getRoute", () => {});
});
