export const CONFIG_SCHEMA = {
   type: "object",
   properties: {
      settings: {
         type: "object",
         properties: {
            globalVariables: {
               type: "object",
               properties: {
                  primaryPrivateKey: { type: "string" },
                  primaryAddress: { type: "string" },
               },
               required: ["primaryPrivateKey", "primaryAddress"],
               errorMessage: {
                  required: {
                     primaryPrivateKey:
                        "The 'primaryPrivateKey' in 'globalVariables' is missing.",
                     primaryAddress:
                        "The 'primaryAddress' in 'globalVariables' is missing.",
                  },
               },
            },
            rpcUrls: {
               type: "object",
               patternProperties: {
                  "^[0-9]+$": { type: "string", format: "uri" },
               },
               additionalProperties: false,
               errorMessage: {
                  additionalProperties:
                     "Only numeric keys are allowed for rpcUrls.",
                  patternProperties:
                     "Each value under rpcUrls must be a valid URL string.",
               },
            },
         },
         required: ["globalVariables"],
         errorMessage: {
            required: {
               globalVariables:
                  "The 'globalVariables' section under 'settings' is missing.",
            },
         },
      },
      adapters: {
         type: "array",
         minItems: 1,
         items: {
            type: "object",
            properties: {
               id: { type: "string" },
               adapter: { type: "string" },
               config: { type: "object" },
            },
            required: ["id", "adapter", "config"],
            errorMessage: {
               required: {
                  id: "Adapter field 'id' is missing.",
                  adapter: "Adapter field 'adapter' is missing.",
                  config: "Adapter field 'config' is missing.",
               },
            },
         },
         uniqueItemProperties: ["id"],
         errorMessage: {
            uniqueItemProperties: "A duplicate adapter id was found.",
         },
      },
      flows: {
         type: "array",
         minItems: 1,
         items: {
            type: "object",
            properties: {
               name: { type: "string" },
               id: { type: "string" },
               description: { type: "string" },
               steps: {
                  type: "array",
                  minItems: 1,
                  items: {
                     type: "object",
                     properties: {
                        type: { type: "string" },
                        adapter: { type: "string" },
                        config: { type: "object" },
                     },
                     required: ["type", "adapter", "config"],
                  },
               },
            },
            required: ["name", "id", "description", "steps"],
         },
      },
   },
   required: ["adapters", "flows"],
   errorMessage: {
      required: {
         adapters:
            "Expected 'adapters' section was not found in the config file.",
         flows: "Expected 'flows' section was not found in the config file.",
      },
   },
};
