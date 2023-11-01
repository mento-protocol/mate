import "reflect-metadata";
import { container } from "tsyringe";
import { DependencyRegistrar } from "./DependencyRegistrar";
import { Engine } from "./Engine";

export async function bootstrap() {
   // Configure the container
   DependencyRegistrar.configure();

   // Resolve the Engine from the container
   const engine = container.resolve(Engine);

   // Initialize the engine, which will initialize all adapters and valitate the config
   await engine.init();

   return engine;
}
