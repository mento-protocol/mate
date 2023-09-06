import { Step } from "../types/Step";

export interface Adapter<TResult, TInitConfig, TStepConfig> {
   init(config: TInitConfig): Promise<Boolean>;
   supportsStep(step: Step<TStepConfig>): Boolean;
   isValid(step: Step<TStepConfig>): Boolean;
   execute(step: Step<TStepConfig>): Promise<TResult>;
}
