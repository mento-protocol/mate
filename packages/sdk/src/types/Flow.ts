import { Step } from "./Step";

export type Flow = {
   name: string;
   id: string;
   description: string;
   steps: Step<any>[];
};
