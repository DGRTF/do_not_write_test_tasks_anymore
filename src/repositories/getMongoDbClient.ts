import { MongoClient } from "mongodb";
import { DatabaseConfig } from "./configRepository";

export default function getMongoDbClient(config: DatabaseConfig) {
  return new MongoClient(config.databaseUrl + config.databaseName, {
    auth: {
      username: config.username,
      password: config.password,
    },
    authSource: config.authSource,
  });
}
