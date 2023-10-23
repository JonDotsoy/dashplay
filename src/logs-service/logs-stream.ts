import { EventMessageSchema, EventMessage, LogStreamManifest } from "../db/models";
import { ulid } from "ulid"
import { LogGroup } from "./logs-group";
import { ObjFromSchema } from "../db/query";
import { AppContext } from "../app/app-context";
import { Model } from "../db/model";
import { TimeStamp } from "../statics/types";
import { Store, WritableStore, ReadableAtom, atom } from "nanostores";

const subReducerTimestampFrom = (logStreamManifest: LogStreamManifest, timeStamp: TimeStamp): LogStreamManifest => {
  if (timeStamp < logStreamManifest.timestampFrom || logStreamManifest.timestampFrom === null) {
    return { ...logStreamManifest, timestampFrom: timeStamp }
  }
  return logStreamManifest
}

const subReducerTimestampTo = (logStreamManifest: LogStreamManifest, timeStamp: TimeStamp): LogStreamManifest => {
  if (timeStamp > logStreamManifest.timestampTo || logStreamManifest.timestampTo === null) {
    return { ...logStreamManifest, timestampTo: timeStamp }
  }
  return logStreamManifest
}

function reducerUpdateLogStreamManifest(logStreamManifest: LogStreamManifest, timeStamp: TimeStamp): LogStreamManifest {
  return subReducerTimestampFrom(
    subReducerTimestampTo(
      logStreamManifest,
      timeStamp,
    ),
    timeStamp,
  );
}

export class LogStream {
  #logStreamManifest: WritableStore<LogStreamManifest>

  constructor(
    readonly ctx: AppContext,
    readonly name: string,
    readonly logGroup: LogGroup,
    logStreamManifest: LogStreamManifest,
    readonly messageModel: Model<ObjFromSchema<typeof EventMessageSchema>>,
  ) {
    this.#logStreamManifest = atom(logStreamManifest)
  }

  get logStreamManifest(): ReadableAtom<LogStreamManifest> {
    return this.#logStreamManifest
  }

  async listEventMessages() {
    const logStreamModel = await this.messageModel

    const response = await logStreamModel.runQuery(
      logStreamModel.query()
    )

    return response ?? []
  }

  async insertEventMessages(events: EventMessage[]) {
    if (events.length) {
      const logStreamModel = await this.messageModel
      await logStreamModel.runMutate(
        logStreamModel.mutate().set(...events)
      )
      const logStreamManifest = events.reduce(
        (logStreamManifest: LogStreamManifest, event) =>
          reducerUpdateLogStreamManifest(logStreamManifest, event.timeStamp),
        this.logStreamManifest.get(),
      );
      if (this.logStreamManifest.get() !== logStreamManifest) {
        await LogStream.updateLogStreamManifest(this.ctx, this.logGroup, this.name, logStreamManifest)
        this.#logStreamManifest.set(logStreamManifest)
      }
    }
  }

  async insertEventMessageOne(message: string, id?: string | null, timeStamp?: TimeStamp | null): Promise<EventMessage> {
    const event: EventMessage = {
      id: id ?? ulid(),
      message,
      timeStamp: timeStamp ?? Date.now(),
    };

    await this.insertEventMessages(
      [event]
    )

    return event
  }

  static async createLogStream(_ctx: AppContext, logGroup: LogGroup, logStreamName: string) {
    const logGroupMeta = logGroup.logGroupMeta
    const logStream = await logGroupMeta.getLogStreamManifestByName(logStreamName)
    if (logStream) throw new Error('Log stream already exists')
    await logGroupMeta.createLogStreamManifest(logStreamName)
  }

  static async listLogStream(_ctx: AppContext, logGroup: LogGroup) {
    return await logGroup.logGroupMeta.listLogStreamManifests()
  }

  static async updateLogStreamManifest(_ctx: AppContext, logGroup: LogGroup, logStreamName: string, logStreamManifest: LogStreamManifest) {
    await logGroup.logGroupMeta.updateLogStreamManifestByName(logStreamName, logStreamManifest)
  }

  static async getLogStream(ctx: AppContext, logGroup: LogGroup, logStreamName: string) {
    const logStreamManifest = await logGroup.logGroupMeta.getLogStreamManifestByName(logStreamName)
    if (!logStreamManifest) return null

    return new LogStream(
      ctx,
      logStreamName,
      logGroup,
      logStreamManifest,
      await Model.create(
        'logs',
        EventMessageSchema,
        await ctx.getSubConnection(`${logGroup.name}/streams/${logStreamName}`),
      ),
    )
  }
}