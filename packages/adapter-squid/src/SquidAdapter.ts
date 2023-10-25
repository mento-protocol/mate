import {
   ConfigProvider,
   ERR_ADAPTER_EXECUTE_FAILURE,
   ERR_GLOBAL_VARIABLE_MISSING,
   ExecutionResult,
   IAdapter,
   IConfigProvider,
   IValidator,
   Step,
   ValidationResult,
} from "@mate/sdk";
import { BridgeSwapConfigCodec, SquidStep } from "./types";
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
import { ERR_GET_ROUTE_FAILURE, ERR_TX_RECEIPT_MISSING } from "./constants";

export class SquidAdapter implements IAdapter<ExecutionResult, SquidStep> {
   public adapterId: string = "squid";

   private squid: Squid;

   constructor(
      @inject(StepConfigValidator)
      private stepConfigValidator: IValidator<SquidStep>,
      @inject(SquidProvider) private squidProvider: ISquidProvider,
      @inject(ConfigProvider) private configProvider: IConfigProvider,
      @inject(SignerService) private signerService: ISignerService
   ) {}

   public async init(): Promise<Boolean> {
      throw new Error("Method not implemented.");
      // TODO:
      // 1. Check if the adapter is already initialized
      // 2. Get the adapter config from the config provider
      // 3. Validate the adapter config
      // 4. Initialize the Squid provider
      // 4. Do any adapter specific initialization
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
      const route = await this.getRoute(stepConfig);
      const signer = this.signerService.getSignerForChain(stepConfig.fromChain);

      // Send the transaction to execute the route
      let transaction;

      try {
         transaction = await this.squid.executeRoute({ signer, route });
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

   private async getRoute(
      stepConfig: TypeOf<typeof BridgeSwapConfigCodec>
   ): Promise<RouteData> {
      let routeData = undefined;

      const primaryAddress =
         this.configProvider.getGlobalVariable("primaryAddress");

      if (!primaryAddress) {
         throw new Error(
            `${ERR_ADAPTER_EXECUTE_FAILURE}: ${ERR_GLOBAL_VARIABLE_MISSING(
               "primaryAddress"
            )}`
         );
      }

      const squid = this.squidProvider.getSquid();

      const bridgeParams: GetRoute = {
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
         routeData = (await squid.getRoute(bridgeParams)).route;
      } catch (error) {
         throw new Error(
            `${ERR_ADAPTER_EXECUTE_FAILURE}: ${ERR_GET_ROUTE_FAILURE}`
         );
      }

      return routeData;
   }
}
