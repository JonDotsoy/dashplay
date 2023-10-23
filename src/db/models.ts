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

  static async create(ctx: AppContext<any>) {
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

export type LogStreamManifest = ObjFromSchema<typeof LogStreamManifestSchema>

export const EventMessageSchema = Schema.createSchema({
  id: SchemaTypes.string,
  message: SchemaTypes.string,
  timeStamp: SchemaTypes.number,
})

export const LogGroupSchema = Schema.createSchema({
  id: SchemaTypes.string,
  name: SchemaTypes.string,
  createdAt: SchemaTypes.number,
}, {
  indexes: ['name']
})

export type EventMessage = ObjFromSchema<typeof EventMessageSchema>

export const LogStreamManifestSchema = Schema.createSchema({
  id: SchemaTypes.string,
  name: SchemaTypes.string,
  timestampFrom: SchemaTypes.number,
  timestampTo: SchemaTypes.number,
}, {
  indexes: ['name']
})
