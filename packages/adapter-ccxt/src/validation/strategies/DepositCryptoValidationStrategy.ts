import {
   CCXTStep,
   ChainId,
   ExchangeDepositCryptoConfigCodec,
   ExchangeId,
} from "../../types";
import { ExchangeServiceRepo, IExchangeServiceRepo } from "../../exchanges";
import { TypeOf } from "io-ts";
import { IStepValidationStrategy } from "./IStepValidationStrategy";
import { inject, injectable } from "tsyringe";
import {
   ERR_INVALID_STEP_CONFIG,
   ERR_UNSUPPORTED_CHAIN,
   ValidationError,
} from "@mate/sdk";
import {
   ERR_ASSET_UNSUPPORTED_ON_EXCHANGE,
   ERR_EXCHANGE_SERVICE_NOT_FOUND,
   ERR_UNSUPPORTED_EXCHANGE,
} from "../../constants";
import { privateKeyToAccount } from "viem/accounts";

@injectable()
export class ExchangeSwapValidationStrategy implements IStepValidationStrategy {
   private chainIdSet = new Set(Object.values(ChainId));
   private exchangeIdSet = new Set(Object.values(ExchangeId));

   constructor(
      @inject(ExchangeServiceRepo)
      private exchangeServiceRepo: IExchangeServiceRepo
   ) {}

   public async validate(validResult: CCXTStep): Promise<CCXTStep> {
      const config = validResult.config as TypeOf<
         typeof ExchangeDepositCryptoConfigCodec
      >;

      // Validate exchange
      this.validateEnumValue(
         config.exchange,
         this.exchangeIdSet,
         ERR_UNSUPPORTED_EXCHANGE
      );

      // Validate chain
      this.validateEnumValue(
         config.chainId,
         this.chainIdSet,
         ERR_UNSUPPORTED_CHAIN
      );

      await this.validateExchangeAsset(
         config.asset,
         config.exchange as ExchangeId
      );

      const account = privateKeyToAccount("0xddsd");
      account.address;

      // Verify from address is in configuration, so private key should be there

      // Verify balance > amount ?

      return validResult;
   }

   private validateEnumValue(
      value: string,
      validSet: Set<string>,
      errorFunc: (val: string) => string
   ): void {
      if (!validSet.has(value)) {
         throw new ValidationError(this.prependGeneralError(errorFunc(value)));
      }
   }

   private async validateExchangeAsset(
      asset: string,
      exchange: ExchangeId
   ): Promise<void> {
      const exchangeService =
         this.exchangeServiceRepo.getExchangeService(exchange);

      if (!exchangeService) {
         throw new ValidationError(
            this.prependGeneralError(ERR_EXCHANGE_SERVICE_NOT_FOUND(exchange))
         );
      }

      const isSupported = await exchangeService.isAssetSupported(asset);

      if (!isSupported) {
         throw new ValidationError(
            this.prependGeneralError(
               ERR_ASSET_UNSUPPORTED_ON_EXCHANGE(asset, exchange)
            )
         );
      }
   }

   private prependGeneralError(specificError: string): string {
      return `${ERR_INVALID_STEP_CONFIG}: ${specificError}`;
   }
}
