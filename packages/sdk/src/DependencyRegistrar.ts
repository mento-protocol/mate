import { container } from "tsyringe";
import { IConfigProvider } from "./interfaces";
import { ConfigProvider } from "./ConfigProvider";

export class DependencyRegistrar {
   private constructor() {}

   public static configure(): void {
      container.registerSingleton<IConfigProvider>(ConfigProvider);
   }
}
