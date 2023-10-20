import { AppContext } from "../app/app-context";
import { Connection } from "../interfaces/connection";
import { ConnectionFactory } from "./connection-factory";
import { Model } from "./model";
import { Schema, SchemaToType, SchemaTypes, ObjFromSchema } from "./query";


export class Models {
  private constructor(
    readonly ctx: AppContext,
    readonly logGroups: Model<ObjFromSchema<typeof LogGroupSchema>>,
  ) { }

  static async create(ctx: AppContext) {
    return new Models(
      ctx,
      await Model.create(
        'log-groups',
        LogGroupSchema,
        ctx.connection,
      ),
    )
  }
}

/** @deprecated */
export const connection = await ConnectionFactory.create('local')

/** @deprecated */
export const users = await Model.create(
  'users',
  Schema.createSchema({
    id: SchemaTypes.string,
    username: SchemaTypes.string,
  }),
  connection,
);

/** @deprecated */
export const logGroups = await Model.create(
  'log-groups',
  Schema.createSchema({
    id: SchemaTypes.string,
    name: SchemaTypes.string,
    createdAt: SchemaTypes.number,
  }, {
    indexes: ['name']
  }),
  connection,
);

export const MessageSchema = Schema.createSchema({
  id: SchemaTypes.string,
  message: SchemaTypes.string,
  timestamp: SchemaTypes.number,
})

export const LogGroupSchema = Schema.createSchema({
  id: SchemaTypes.string,
  name: SchemaTypes.string,
  createdAt: SchemaTypes.number,
}, {
  indexes: ['name']
})

export type EventMessage = ObjFromSchema<typeof MessageSchema>

export const LogStreamManifestSchema = Schema.createSchema({
  id: SchemaTypes.string,
  name: SchemaTypes.string,
  timestampFrom: SchemaTypes.number,
  timestampTo: SchemaTypes.number,
}, {
  indexes: ['name']
})

/** @deprecated */
export interface RefConnection {
  instances: Set<Symbol>
  connection: Promise<Connection>
  destroy(): Promise<void>
}

/** @deprecated */
export interface SubscriptionRefConnection {
  connection: Promise<Connection>
  unsubscribe(): Promise<void>
}
const mapRefConnections = new Map<string, RefConnection>();

/** @deprecated */
export const selectRefConnection = (nameConnection: string): RefConnection => {
  const refConnection = mapRefConnections.get(nameConnection)
  if (refConnection) return refConnection
  const connection = ConnectionFactory.create(nameConnection)
  const nextRefConnection: RefConnection = {
    instances: new Set(),
    connection: ConnectionFactory.create(nameConnection),
    async destroy() {
      const conn = await connection;
      await conn.close();
    }
  }
  mapRefConnections.set(nameConnection, nextRefConnection)
  return nextRefConnection
}

/** @deprecated */
export const subscribeConnection = (nameConnection: string): SubscriptionRefConnection => {
  const indexInterface = Symbol('instance')
  const refConnection = selectRefConnection(nameConnection)

  refConnection.instances.add(indexInterface)

  return {
    connection: refConnection.connection,
    async unsubscribe() {
      refConnection.instances.delete(indexInterface)
      if (refConnection.instances.size === 0) {
        refConnection.destroy()
      }
    }
  }
}

/** @deprecated */
export const createLogStreamModel = async (subscriptionRefConnection: SubscriptionRefConnection, LogsStreamName: string) => {
  return await Model.create(LogsStreamName, MessageSchema, await subscriptionRefConnection.connection)
}

/** @deprecated */
export const createMetaLogStreamModel = async (subscriptionRefConnection: SubscriptionRefConnection, modelName: string) => {
  return await Model.create(modelName, LogStreamManifestSchema, await subscriptionRefConnection.connection)
}
