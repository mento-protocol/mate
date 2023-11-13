import fastify from "fastify";
import auth from "@fastify/auth";
import { bootstrap, Engine } from "@mate/engine";
import basicAuth from "@fastify/basic-auth";
import "dotenv/config";

const port = Number(process.env.API_PORT) || 8080;
const environment =
   (process.env.NODE_ENV as "development" | "production") || "development";

const envToLogger = {
   development: {
      transport: {
         target: "pino-pretty",
         options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
         },
      },
   },
   production: true,
};

// Basic Auth validation function
async function validate(username: string, password: string) {
   const user = process.env.API_USER;
   const pass = process.env.API_PASS;

   console.log("Auth request received");

   console.log(`User: ${user}`);
   console.log(`Pass: ${pass}`);

   if (username === user && password === pass) {
      return;
   } else {
      throw new Error("Unauthorized");
   }
}

async function startServer() {
   try {
      const server = fastify({
         logger: envToLogger[environment] ?? true,
      });
      let engine: Engine;

      server.register(auth);

      server.register(basicAuth, {
         validate,
         authenticate: { realm: "MATE" },
      });

      server.after(() => {
         server.addHook("preHandler", server.auth([server.basicAuth]));
      });

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
