import { Mutate, Query, Schema } from "../db/query";

interface InitConnectionOptions {
  mode?: 'read-only' | 'write-read'
}

export interface Connection {
  getRef(): string;
  init: (options?: InitConnectionOptions) => Promise<void>;
  close: () => Promise<void>;
  runQuery(query: Query<any>): Promise<any[] | null>;
  runMutate(query: Mutate<any>): Promise<any>;
  defineSchema(target: string, schema: Schema): Promise<any>;
}
