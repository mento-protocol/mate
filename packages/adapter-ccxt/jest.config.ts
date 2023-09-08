import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
   preset: "ts-jest",
   testEnvironment: "node",
   roots: ["<rootDir>/test/"],
   transform: {
      "^.+\\.tsx?$": "ts-jest",
   },
   testRegex: "test/.*\\.test\\.ts$",
   moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
   collectCoverage: true,
   coverageDirectory: "<rootDir>/coverage/",
};

export default config;
