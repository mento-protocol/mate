import {
   ConfigProvider,
   ERR_ADAPTER_CONFIG_MISSING,
   ERR_ADAPTER_EXECUTE_FAILURE,
   ERR_ADAPTER_INIT_FAILURE,
   ERR_GLOBAL_VARIABLE_MISSING,
   ExecutionResult,
   IAdapter,
   IConfigProvider,
   IValidator,
   Step,
   ValidationResult,
} from "@mate/sdk";
import { BridgeSwapConfigCodec, SquidAdapterConfig, SquidStep } from "./types";
import { inject } from "tsyringe";
import {
   ISignerService,
   ISquidProvider,
   SignerService,
   SquidProvider,
} from "./services";
import { StepConfigValidator } from "./validation";
import { GetRoute, RouteData, Squid } from "@0xsquid/sdk";
import { ethers } from "ethers";
import { TypeOf } from "io-ts";
import {
   ERR_GET_ROUTE_FAILURE,
   ERR_TX_RECEIPT_MISSING,
   ERR_GET_ROUTE_UNDEFINED,
} from "./constants";

export class SquidAdapter implements IAdapter<ExecutionResult, SquidStep> {
   public adapterId: string = "squid";

   private adapterConfig: SquidAdapterConfig;

   constructor(
      @inject(StepConfigValidator)
      private stepConfigValidator: IValidator<SquidStep>,
      @inject(SquidProvider) private squidProvider: ISquidProvider,
      @inject(ConfigProvider) private configProvider: IConfigProvider,
      @inject(SignerService) private signerService: ISignerService
   ) {}

   public async init(): Promise<Boolean> {
      if (this.adapterConfig) {
         return true;
      }

      const adapterConfigItem = this.configProvider.getAdapterConfig(
         this.adapterId
      );

      if (!adapterConfigItem) {
         throw new Error(
            `${ERR_ADAPTER_INIT_FAILURE}: ${ERR_ADAPTER_CONFIG_MISSING}`
         );
      }

      // TODO: Validate the adapter config
      this.adapterConfig = adapterConfigItem.config;

      try {
         const squidConfig = {
            baseUrl: this.adapterConfig.baseUrl,
            integratorId: this.adapterConfig.integratorId,
         };

         await this.squidProvider.init(squidConfig);
      } catch (error: any) {
         throw new Error(
            `${ERR_ADAPTER_INIT_FAILURE}: ${(error as Error).message}`
         );
      }

      return true;
   }

   public async isValid(step: Step<SquidStep>): Promise<ValidationResult> {
      let result: ValidationResult = {
         isValid: false,
         errors: [],
      };

      try {
         await this.stepConfigValidator.validate(step);
         result.isValid = true;
      } catch (err) {
         result.errors.push((err as Error).message);
      }

      return result;
   }

   // TODO: The generic type sdk.Step<T> only needs to expose the config property
   // TODO: Get some logging set up.

   public async execute(step: Step<SquidStep>): Promise<ExecutionResult> {
      // We're assuming the step is Bridge.Swap as this is the only step type currently supported
      // Should this change, this function should be refactored to handle the different step types.
      // e.g. IExecutor.executeStep(step: Step<SquidStep>)

      const result: ExecutionResult = {
         success: false,
         data: {},
      };

      const stepConfig = step.config.config; // ??
      const squid = this.squidProvider.getSquid();
      const signer = this.signerService.getSignerForChain(stepConfig.fromChain);

      let transaction;

      try {
         const route = await this.getRoute(stepConfig, squid);
         transaction = await squid.executeRoute({ signer, route });
      } catch (error) {
         result.success = false;
         result.data.errorMessage = `${ERR_ADAPTER_EXECUTE_FAILURE}:${
            (error as Error).message
         }`;
         return result;
      }

      const txReceipt = await (
         transaction as ethers.providers.TransactionResponse
      ).wait();

      if (txReceipt && txReceipt.transactionHash) {
         result.success = true;
         result.data.txHash = txReceipt.transactionHash;
      } else {
         result.success = false;
         result.data.errorMessage = ERR_TX_RECEIPT_MISSING;
      }

      return result;
   }

   /**
    * Get the squid route based on the specified step configuration.
    * @param stepConfig The configuration data to use to get the route.
    * @returns The route data.
    */
   private async getRoute(
      stepConfig: TypeOf<typeof BridgeSwapConfigCodec>,
      squid: Squid
   ): Promise<RouteData> {
      let routeData = undefined;

      const primaryAddress =
         this.configProvider.getGlobalVariable("primaryAddress");

      if (!primaryAddress) {
         throw new Error(`${ERR_GLOBAL_VARIABLE_MISSING("primaryAddress")}`);
      }

      const getRouteParams: GetRoute = {
         fromChain: stepConfig.fromChain,
         fromToken: stepConfig.fromToken,
         fromAmount: stepConfig.fromAmount,
         toChain: stepConfig.toChain,
         toToken: stepConfig.toToken,
         fromAddress: primaryAddress,
         toAddress: stepConfig.toAddress,
         slippage: stepConfig.maxSlippage,
      };

      try {
         routeData = (await squid.getRoute(getRouteParams)).route;

         if (!routeData) {
            throw new Error(ERR_GET_ROUTE_UNDEFINED);
         }
      } catch (error) {
         throw new Error(
            `${ERR_GET_ROUTE_FAILURE}:${(error as Error).message}`
         );
      }

      return routeData;
   }
}
