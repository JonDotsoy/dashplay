import { Connection } from "../interfaces/connection";
import { Mutate, Query, Schema, mutate, query } from "./query";

export class Model<S = any> {
  private constructor(
    readonly targetName: string,
    readonly schema: Schema<S>,
    readonly connection: Connection,
  ) { }

  async init() {
    await this.connection.defineSchema(this.targetName, this.schema)
  }

  static async create<S = any>(
    targetName: string,
    schema: Schema<S>,
    connection: Connection) {
    const model = new Model(
      targetName,
      schema,
      connection
    );

    await model.init();

    return model;
  }

  query(): Query<S> {
    return query<S>(this.targetName)
  }

  mutate(): Mutate<S> {
    return mutate<S>(this.targetName)
  }

  async runQuery(exp: Query<S>): Promise<S[] | null> {
    return await this.connection.runQuery(exp)
  }

  async runMutate(exp: Mutate<S>) {
    return await this.connection.runMutate(exp)
  }
}
