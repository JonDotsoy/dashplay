import { Engine, type Connection, type InitConnectionOptions, type ConnectionConstructor } from "../interfaces/connection";
import { SQLiteConnection } from "./connections/sqlite/sqlite-connection";

export class ConnectionFactory {
  private constructor(readonly connection: Connection) { }

  static connectionEnginesList: Record<Engine, ConnectionConstructor> = {
    ['sqlite']: SQLiteConnection
  }

  static async create<E extends string>(reference: string, options: InitConnectionOptions<E>) {
    const engine = options.engine

    if (!Reflect.has(this.connectionEnginesList, engine)) throw new Error(`Invalid engine ${engine}`)

    const Engine = Reflect.get(this.connectionEnginesList, engine)

    const connection: Connection = new Engine(reference, options);
    await connection.init();
    return connection;
  }
}
