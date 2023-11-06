import { Squid } from "@0xsquid/sdk";
import { injectable } from "tsyringe";
import { ISquidProvider } from ".";

@injectable()
export class SquidProvider implements ISquidProvider {
   private squid: Squid;

   private initialised: boolean = false;

   constructor() {
      this.squid = new Squid();
   }

   public async init(config: {
      baseUrl: string;
      integratorId: string;
   }): Promise<void> {
      if (this.initialised) {
         throw new Error("SquidProvider is already initialised");
      }

      try {
         this.squid.setConfig(config);
         await this.squid.init();
         this.initialised = true;
      } catch (error) {
         if (error instanceof Error) {
            throw new Error(
               `SquidProvider initialization error: ${error.message}`
            );
         } else {
            throw new Error(`SquidProvider initialization error: ${error}`);
         }
      }
   }

   public getSquid(): Squid {
      if (!this.initialised) {
         throw new Error("SquidProvider not initialised");
      }
      return this.squid;
   }
}
