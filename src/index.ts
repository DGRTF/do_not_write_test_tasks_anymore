import runApiListener from "./listeners/runApiListener.js";
import runStaticFilesListeners from "./listeners/runStaticFilesListener.js";
import TrackRepository from "./repositories/TrackRepository.js";
import getMongoDbClient from "./repositories/getMongoDbClient.js";
import getConnectionToDatabase from "./repositories/getConnectionToDatabase.js";

import {
  databaseConfig,
  serverConfig,
} from "./repositories/configRepository.js";

function getClient() {
  return getMongoDbClient(databaseConfig);
}

const connectionToDatabase = getConnectionToDatabase(getClient);
const trackRepository = new TrackRepository(connectionToDatabase);

runApiListener(serverConfig, trackRepository);
runStaticFilesListeners(serverConfig);
