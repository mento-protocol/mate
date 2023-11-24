import {
   ConfigProvider,
   ERR_ADAPTER_CONFIG_MISSING,
   ERR_ADAPTER_EXECUTE_FAILURE,
   ERR_GLOBAL_VARIABLE_MISSING,
   ExecutionResult,
   IAdapter,
   IConfigProvider,
   IValidator,
   Step,
   ValidationError,
   ValidationResult,
} from "@mate/sdk";
import { BridgeSwapConfig, SquidAdapterConfig, SquidStepConfig } from "./types";
import { inject, injectable } from "tsyringe";
import {
   ISignerService,
   ISquidProvider,
   SignerService,
   SquidProvider,
} from "./services";
import { AdapterConfigValidator, StepConfigValidator } from "./validation";
import { GetRoute, RouteData, Squid } from "@0xsquid/sdk";
import { ethers } from "ethers";
import {
   ERR_GET_ROUTE_FAILURE,
   ERR_TX_RECEIPT_MISSING,
   ERR_GET_ROUTE_UNDEFINED,
   UNKNOWN_SQUID_ERROR,
} from "./constants";
import axios from "axios";

@injectable()
export class SquidAdapter
   implements IAdapter<ExecutionResult, SquidStepConfig>
{
   public adapterId: string = "squid";

   private adapterConfig: SquidAdapterConfig;

   constructor(
      @inject(AdapterConfigValidator)
      private adapterConfigValidator: IValidator<SquidAdapterConfig>,
      @inject(StepConfigValidator)
      private stepConfigValidator: IValidator<SquidStepConfig>,
      @inject(SquidProvider) private squidProvider: ISquidProvider,
      @inject(ConfigProvider) private configProvider: IConfigProvider,
      @inject(SignerService) private signerService: ISignerService
   ) {}

   public async init(): Promise<boolean> {
      if (this.adapterConfig) {
         return true;
      }

      const adapterConfigItem = this.configProvider.getAdapterConfig(
         this.adapterId
      );

      if (!adapterConfigItem) {
         throw new Error(ERR_ADAPTER_CONFIG_MISSING);
      }

      try {
         this.adapterConfig = await this.adapterConfigValidator.validate(
            adapterConfigItem.config
         );

         const squidConfig = {
            baseUrl: this.adapterConfig.baseUrl,
            integratorId: this.adapterConfig.integratorId,
         };

         await this.squidProvider.init(squidConfig);
      } catch (error) {
         if (error instanceof Error) {
            throw new Error(error.message);
         } else {
            throw new Error(`${error}`);
         }
      }

      return true;
   }

   public async isValid(
      step: Step<SquidStepConfig>
   ): Promise<ValidationResult> {
      const result: ValidationResult = {
         isValid: false,
         errors: [],
      };

      try {
         await this.stepConfigValidator.validate(step.config);
         result.isValid = true;
      } catch (err) {
         const validationErr = err as ValidationError;

         if (validationErr.message) {
            result.errors.push(validationErr.message);
         }
         if (validationErr.context) {
            result.errors.push(validationErr.context);
         }
      }

      return result;
   }
   // TODO: Get some logging set up.

   public async execute(step: Step<SquidStepConfig>): Promise<ExecutionResult> {
      // We're assuming the step is Bridge.Swap as this is the only step type currently supported
      // Should this change, this function should be refactored to handle the different step types.
      // e.g. IExecutor.executeStep(step: Step<SquidStep>)

      const result: ExecutionResult = {
         success: false,
         data: {},
      };

      const squid = this.squidProvider.getSquid();
      const signer = this.signerService.getSignerForChain(
         step.config.fromChain
      );

      let transaction;

      try {
         const route = await this.getRoute(step.config, squid);
         transaction = await squid.executeRoute({ signer, route });
      } catch (error) {
         result.success = false;
         result.data.errorMessage = `${ERR_ADAPTER_EXECUTE_FAILURE(
            this.adapterId,
            step.type
         )}:${(error as Error).message}`;
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
      stepConfig: BridgeSwapConfig,
      squid: Squid
   ): Promise<RouteData> {
      const primaryAddress =
         this.configProvider.getGlobalVariable("primaryAddress");
      if (!primaryAddress) {
         throw new Error(ERR_GLOBAL_VARIABLE_MISSING("primaryAddress"));
      }

      const getRouteParams = this.constructRouteParams(
         stepConfig,
         primaryAddress
      );

      return this.fetchRouteData(squid, getRouteParams);
   }

   private constructRouteParams(
      stepConfig: BridgeSwapConfig,
      primaryAddress: string
   ): GetRoute {
      return {
         ...stepConfig,
         fromAddress: primaryAddress,
      };
   }

   private async fetchRouteData(
      squid: Squid,
      getRouteParams: GetRoute
   ): Promise<RouteData> {
      try {
         const routeData = (await squid.getRoute(getRouteParams)).route;
         if (!routeData) {
            throw new Error(ERR_GET_ROUTE_UNDEFINED);
         }
         return routeData;
      } catch (error) {
         throw this.handleRouteError(error);
      }
   }

   private handleRouteError(error: unknown): Error {
      if (axios.isAxiosError(error)) {
         const errorMessage = this.extractErrorMessages(error?.response?.data);
         return new Error(`${ERR_GET_ROUTE_FAILURE}:${errorMessage}`);
      } else if (error instanceof Error) {
         return new Error(`${ERR_GET_ROUTE_FAILURE}:${error.message}`);
      } else {
         return new Error(`${ERR_GET_ROUTE_FAILURE}:${UNKNOWN_SQUID_ERROR}`);
      }
   }

   private extractErrorMessages(data: {
      errors?: { message: string }[];
   }): string {
      if (!data?.errors || !Array.isArray(data.errors)) {
         return UNKNOWN_SQUID_ERROR;
      }
      return data.errors.map((error) => error.message).join(", ");
   }
}
