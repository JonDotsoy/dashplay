import { Mutate, Query, Schema } from "../db/query";

declare global {
  interface DashplayEngineOptions {}
}

export type Engine = string

type SelectTypesEngineOptions<E> = E extends string ? DashplayEngineOptions extends { [K in E]: infer R } ? R : any : any

export interface InitConnectionOptions<E extends string = any> {
  engine: E
  engineOptions: SelectTypesEngineOptions<E>
  mode?: 'read-only' | 'write-read'
}

export interface ConnectionConstructor {
  new(ref: string, options: InitConnectionOptions): Connection
}

export abstract class Connection {
  constructor(readonly ref: string, readonly options: InitConnectionOptions) { }

  abstract init(): Promise<void>;
  abstract close(): Promise<void>;
  abstract runQuery(query: Query<any>): Promise<any[] | null>;
  abstract runMutate(query: Mutate<any>): Promise<any>;
  abstract defineSchema(target: string, schema: Schema): Promise<any>;
}
