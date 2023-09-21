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
   collectCoverageFrom: ["src/**/*.ts"],
   coverageDirectory: "<rootDir>/coverage/",
   coveragePathIgnorePatterns: ["index.ts, src/constants, src/types"],
   moduleNameMapper: {
      "^@validation/(.*)$": "<rootDir>/src/validation/$1",
   },
   testTimeout: 20000,
};

export default config;
