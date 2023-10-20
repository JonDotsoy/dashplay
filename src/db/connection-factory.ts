import { type Connection } from "../interfaces/connection";
import { SQLiteConnection } from "./connections/sqlite";

export const enum Engine { sqlite = 'sqlite' }

export class ConnectionFactory {
  private constructor(readonly connection: Connection) { }

  static async create(reference: string, engine: Engine = Engine.sqlite) {
    if (engine === Engine.sqlite) {
      const connection: Connection = new SQLiteConnection(reference);
      await connection.init();
      return connection;
    }
    throw new Error(`Invalid engine ${engine}`)
  }
}
