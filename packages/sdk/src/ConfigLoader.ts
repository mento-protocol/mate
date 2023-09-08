import * as yaml from "js-yaml";
import * as fs from "fs";
import { singleton } from "tsyringe";

import { IConfigLoader } from "./interfaces";
import { AdapterConfig } from "./types";

@singleton()
export class ConfigLoader implements IConfigLoader {
   private configData: any;
   private readonly CONFIG_PATH: string;

   constructor(configPath = "config.yaml") {
      this.CONFIG_PATH = configPath;
      this.loadConfig();
   }

   private loadConfig(): void {
      if (!fs.existsSync(this.CONFIG_PATH)) {
         throw new Error(`Config file not found at ${this.CONFIG_PATH}`);
      }

      const fileContents = fs.readFileSync(this.CONFIG_PATH, "utf8");
      try {
         this.configData = yaml.load(fileContents);
      } catch (err) {
         if (err instanceof Error) {
            throw new Error(`Failed to parse YAML. Error: ${err.message}`);
         } else {
            throw new Error(`Failed to parse YAML.`);
         }
      }

      if (!this.configData.adapters) {
         throw new Error(
            `Expected 'adapters' field missing in the config file.`
         );
      }

      const adapterIds = new Set<string>();
      for (const adapter of this.configData.adapters) {
         if (!adapter.id || typeof adapter.id !== "string") {
            throw new Error(
               `Adapter configuration is missing or has an invalid 'id' field.`
            );
         }

         if (adapterIds.has(adapter.id)) {
            throw new Error(`Duplicate adapter id found: ${adapter.id}`);
         }
         adapterIds.add(adapter.id);
      }
   }

   public getAdapterConfig(adapterId: string): AdapterConfig | null {
      const adapters: AdapterConfig[] = this.configData.adapters || [];

      for (const adapter of adapters) {
         if (adapter.id === adapterId) {
            return adapter;
         }
      }

      return null; // Adapter not found
   }
}
