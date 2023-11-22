import { container } from "tsyringe";
import { IConfigProvider, ISignerService } from "./interfaces";
import { ConfigProvider } from "./ConfigProvider";
import { SignerService } from "./SignerService";

export class DependencyRegistrar {
   public static configure(): void {
      container.registerSingleton<IConfigProvider>(ConfigProvider);
      container.register<ISignerService>(SignerService, {
         useClass: SignerService,
      });
   }
}
