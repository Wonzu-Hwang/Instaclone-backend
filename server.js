import "dotenv/config";
import express, { Express } from "express";
import morgan from "morgan";
import { ApolloServer, ExpressContext } from "apollo-server-express";
import { graphqlUploadExpress } from "graphql-upload";
import { createServer, Server } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { User } from ".prisma/client";
import { handleGetLoggedInUser, handleCheckLogin } from "./users/users.utils";
import prisma from "./prisma";
import schema from "./schema";
import pubsub from "./pubsub";

const startServer = async () => {
  const app = express();
  app.use(morgan("dev"));
  app.use(graphqlUploadExpress());
  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: "/graphql" }
  );
  const apolloServer = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const foundUser = await handleGetLoggedInUser(req.headers.token);
      return { prisma, loggedInUser: foundUser, handleCheckLogin };
    },
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });
  await apolloServer.start();
  httpServer.listen(process.env.PORT, () =>
    console.log(
      `🚀 Server: http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
    )
  );
};

startServer();
