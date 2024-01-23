import config from "config";

export interface ServerConfig {
  readonly apiPort: number;
  readonly staticFilesPort: number;
}

export interface DatabaseConfig {
  readonly databaseUrl: string;
  readonly username: string;
  readonly password: string;
  readonly databaseName: string;
  readonly authSource: string;
}

export const serverConfig: ServerConfig = config.get("server");
export const databaseConfig: DatabaseConfig = config.get("database");
