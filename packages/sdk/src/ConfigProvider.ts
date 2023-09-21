import * as yaml from "js-yaml";
import * as fs from "fs";
import { singleton } from "tsyringe";
import Ajv from "ajv";
import ajvErrors from "ajv-errors";
import addKeywords from "ajv-keywords";

import { AdapterConfig } from "./types";
import { IConfigProvider } from "./interfaces";
import { CONFIG_SCHEMA } from "./constants";

interface IConfig {
   adapters: AdapterConfig[];
   flows: any[];
}

@singleton()
export class ConfigProvider implements IConfigProvider {
   private configData: IConfig;
   private readonly CONFIG_PATH: string;
   private readonly ajv: Ajv;

   constructor(configPath: string = "config.yaml") {
      this.CONFIG_PATH =
         configPath || process.env["CONFIG_PATH"] || "config.yaml";

      this.ajv = new Ajv({ allErrors: true });
      addKeywords(this.ajv, ["uniqueItemProperties"]);
      ajvErrors(this.ajv);

      this.loadAndValidateConfig();
   }

   private loadAndValidateConfig(): void {
      const fileContents = this.loadConfigFile();
      this.configData = this.parseConfig(fileContents);
      this.validateConfig();
   }

   private loadConfigFile(): string {
      if (!fs.existsSync(this.CONFIG_PATH)) {
         throw new Error(`Config file not found.`);
      }
      return fs.readFileSync(this.CONFIG_PATH, "utf8");
   }

   private parseConfig(fileContents: string): IConfig {
      try {
         return yaml.load(fileContents) as IConfig;
      } catch (err) {
         if (err instanceof Error) {
            throw new Error(`Failed to parse config. Error: ${err.message}`);
         } else {
            throw new Error("Failed to parse config.");
         }
      }
   }

   private validateConfig(): void {
      const validate = this.ajv.compile(CONFIG_SCHEMA);
      if (!validate(this.configData)) {
         throw new Error(this.ajv.errorsText(validate.errors));
      }
   }

   public getAdapterConfig(adapterId: string): AdapterConfig | null {
      return (
         this.configData.adapters.find(
            (adapter: { id: string }) => adapter.id === adapterId
         ) || null
      );
   }
}
