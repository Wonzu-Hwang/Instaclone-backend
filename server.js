import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./schema";
import { getUser, protectResolver } from "./users/users.utils.js";
import logger from "morgan";
import express from "express";

const PORT = process.env.PORT;
const apollo = new ApolloServer({
  resolvers,
  typeDefs,
  context: async ({ req }) => {
    return {
      loggedInUser: await getUser(req.headers.token),
      protectResolver,
    };
  },
});

const app = express();
app.use(logger("tiny"));
app.use(express.static("uploads"));
apollo.applyMiddleware({ app });
app.listen({ port: PORT }, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});
