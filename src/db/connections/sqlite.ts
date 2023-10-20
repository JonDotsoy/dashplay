import { mkdir } from "node:fs/promises"
import { Database } from "bun:sqlite";
import { type Connection } from "../../interfaces/connection";
import { Mutate, Query, Schema } from "../query";
import { QuerySQLiteTransform } from "../query-transforms/query-sqlite-transform";
import { MutateSQLiteTransform } from "../query-transforms/mutate-sqlite-transform";
import { DefineSchemaSQliteTransform } from "../query-transforms/define-schema-sqlite-transform";
import { homedir } from "os"

export class SQLiteConnection implements Connection {
  #db?: Database;

  constructor(readonly ref: string) { }

  getRef(): string {
    return this.ref
  }

  get db() {
    if (!this.#db) throw new Error(`DB is not ready yet`)

    return this.#db
  }

  async init() {
    const u = new URL(`.dashplay/.dbs/${this.ref}.sqlite`, new URL(`${homedir()}/`, 'file://'))

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
