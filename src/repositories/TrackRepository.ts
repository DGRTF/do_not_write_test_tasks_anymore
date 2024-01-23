import { type Collection } from "mongodb";
import Track from "../types/Track.js";

const tracksCollectionName = "tracks";

export type ConnectionToDatabaseFunction = <TResult>(
  collectionName: string,
  action: (collection: Collection<Track>) => Promise<TResult>,
) => Promise<void>;

export default class TrackRepository {
  constructor(
    private readonly connectionToDatabase: ConnectionToDatabaseFunction,
  ) {}

  async addTracks(tracks: Track[]) {
    if (tracks.length === 0) return;

    async function insertTracks(collection: Collection<Track>) {
      await collection.insertMany(tracks);
    }

    await this.connectionToDatabase(tracksCollectionName, insertTracks);
  }
}
