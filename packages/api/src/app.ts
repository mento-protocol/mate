import fastify from "fastify";
import { bootstrap, Engine } from "@mate/engine";

const port = Number(process.env.API_PORT) || 8080;

// TODO: Basic auth.

async function startServer() {
   try {
      const server = fastify({ logger: true });
      let engine: Engine;

      // Initialize the M.A.T.E engine
      try {
         engine = await bootstrap();
      } catch (error) {
         let errorMessage;

         if (error instanceof Error) {
            errorMessage = error.message;
         } else {
            errorMessage = "Unknown error";
         }

         console.error("Failed to initialize M.A.T.E engine:", errorMessage);
         process.exit(1);
      }

      // Health Check route
      server.get("/health", async () => {
         return { status: "OK" };
      });

      // Execute flow endpoint
      server.post<{ Params: { flowId: string } }>(
         "/v1/execute/:flowId",
         async (request, reply) => {
            const flowId = request.params.flowId;

            try {
               const executionResult = await engine.execute(flowId);
               return executionResult;
            } catch (error) {
               let errorMessage;
               if (error instanceof Error) {
                  errorMessage = error.message;
               } else {
                  errorMessage = "Unknown error";
               }
               return reply.code(500).send({
                  error: `Execution of flow '${flowId}' failed: ${errorMessage}`,
               });
            }
         }
      );

      // Start the server
      server.listen({ port }, (err, address) => {
         if (err) {
            console.error(err);
            process.exit(1);
         }
         console.log(`Server listening at ${address}`);
      });
   } catch (error) {
      console.error("Server failed to start:", error);
      process.exit(1);
   }
}

process.on("unhandledRejection", (error) => {
   console.error("Unhandled Rejection:", error);
   process.exit(1);
});

startServer();
