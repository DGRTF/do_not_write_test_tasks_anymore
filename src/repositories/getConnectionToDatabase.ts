import { type MongoClient, type Collection } from "mongodb";
import Track from "../types/Track";

export default function getConnectionToDatabase<TResult>(
  getClient: () => MongoClient,
) {
  return async function connectionToDatabase(
    collectionName: string,
    acton: (collection: Collection<Track>) => Promise<TResult>,
  ) {
    const client = getClient();

    try {
      await client.connect();
      const collection = client.db().collection<Track>(collectionName);
      await acton(collection);
    } catch (err) {
      console.log(err);
    } finally {
      await client.close();
    }
  };
}
