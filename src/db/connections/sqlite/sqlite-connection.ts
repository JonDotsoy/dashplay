import { mkdir } from "node:fs/promises"
import { Database } from "bun:sqlite";
import { Connection } from "../../../interfaces/connection";
import { Mutate, Query, Schema } from "../../query";
import { QuerySQLiteTransform } from "../../query-transforms/query-sqlite-transform";
import { MutateSQLiteTransform } from "../../query-transforms/mutate-sqlite-transform";
import { DefineSchemaSQliteTransform } from "../../query-transforms/define-schema-sqlite-transform";
import { homedir } from "os"

declare global {
  interface DashplayEngineOptions {
    sqlite: {
      /**
       * Location to storage files
       * @default $HOME/.dashplay/
       */
      basePathLocation?: URL
    }
  }
}

export class SQLiteConnection extends Connection {
  #db?: Database;

  get db() {
    if (!this.#db) throw new Error(`DB is not ready yet`)

    return this.#db
  }

  async init() {
    const basePathLocation: URL = Reflect.get(this.options.engineOptions, 'basePathLocation') ?? new URL(`${homedir()}/.dashplay/`, 'file://')

    const u = new URL(`.dbs/${this.ref}.sqlite`, basePathLocation)

    await mkdir(new URL('./', u), { recursive: true })

    this.#db = new Database(u.toString());
  }

  async close() {
    this.#db?.close()
  }

  async runQuery(query: Query<any>): Promise<any[] | null> {
    return this.#db?.query(new QuerySQLiteTransform(query).toSQL()).all() ?? null
  }

  async runMutate(mutate: Mutate<any>): Promise<any> {
    this.#db?.run(new MutateSQLiteTransform(mutate).toSQL())
  }

  async defineSchema(targetName: string, schema: Schema<any>): Promise<any> {
    this.#db?.run(new DefineSchemaSQliteTransform(targetName, schema).toSQL())
  }
}
