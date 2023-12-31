import * as yaml from "js-yaml";
import * as fs from "fs";
import { singleton } from "tsyringe";
import Ajv from "ajv";
import ajvErrors from "ajv-errors";
import addKeywords from "ajv-keywords";
import addFormats from "ajv-formats";

import { AdapterConfig, Flow } from "./types";
import { IConfigProvider } from "./interfaces";
import { CONFIG_SCHEMA } from "./constants";

interface IConfig {
   settings: {
      globalVariables: {
         primaryPrivateKey: string;
         primaryAddress: string;
      };
      rpcUrls: {
         [chainId: number]: string;
      };
   };
   adapters: AdapterConfig[];
   flows: any[];
}

@singleton()
export class ConfigProvider implements IConfigProvider {
   private configData: IConfig;
   private readonly CONFIG_PATH: string;
   private readonly ajv: Ajv;

   constructor() {
      this.CONFIG_PATH = process.env["CONFIG_PATH"] || "config.yaml";
      this.ajv = new Ajv({
         allErrors: true,
         strictTuples: false,
         strictTypes: false,
      });
      addKeywords(this.ajv, ["uniqueItemProperties"]);
      ajvErrors(this.ajv);
      addFormats(this.ajv);

      this.loadAndValidateConfig();
   }

   public getAdapterConfig(adapterId: string): AdapterConfig | null {
      return (
         this.configData.adapters.find(
            (adapter: { id: string }) => adapter.id === adapterId
         ) || null
      );
   }

   public getGlobalVariable(variableName: string): string | null {
      // First try to get from environment variables
      const envVar = process.env[variableName];
      if (envVar) {
         return envVar;
      }

      if (
         this.configData.settings?.globalVariables &&
         this.configData.settings.globalVariables.hasOwnProperty(variableName)
      ) {
         return this.configData.settings.globalVariables[
            variableName as keyof typeof this.configData.settings.globalVariables
         ];
      }
      return null;
   }

   public getRpcUrl(chainId: number): string | null {
      if (
         this.configData.settings?.rpcUrls &&
         this.configData.settings.rpcUrls.hasOwnProperty(chainId)
      ) {
         const rpcUrl =
            this.configData.settings.rpcUrls[
               chainId as keyof typeof this.configData.settings.rpcUrls
            ];

         return rpcUrl ? rpcUrl : null;
      }
      return null;
   }

   public getStepFromFlow(flowId: string, stepIndex: number): any | null {
      if (!flowId) {
         throw new Error("Flow ID must be specified");
      }

      const flow = this.configData.flows.find((flow) => flow.id === flowId);
      if (!flow) {
         throw new Error(`Flow with ID ${flowId} not found`);
      }

      if (flow.steps.length <= stepIndex) {
         throw new Error(
            `Step index ${stepIndex} is out of bounds for flow ${flowId}`
         );
      }

      return flow.steps[stepIndex];
   }

   public getAdapters(): AdapterConfig[] {
      return this.configData.adapters;
   }

   public getFlowById(flowId: string): Flow | null {
      return this.configData.flows.find((flow) => flow.id === flowId) || null;
   }

   private loadAndValidateConfig(): void {
      const fileContents = this.loadConfigFile();
      this.configData = this.parseConfig(fileContents);
      this.validateConfig();
   }

   private loadConfigFile(): string {
      if (!fs.existsSync(this.CONFIG_PATH)) {
         throw new Error(`Config file was not found at ${this.CONFIG_PATH}.`);
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

      //TODO: Verify private key matches address using privateKeyToAccount from viem/accounts
   }
}
