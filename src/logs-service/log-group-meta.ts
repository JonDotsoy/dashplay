import { ulid } from "ulid";
import { LogGroupSchema, LogStreamManifest, LogStreamManifestSchema } from "../db/models";
import { Model } from "../db/model";
import { ObjFromSchema } from "../db/query";
import { AppContext } from "../app/app-context";
import { atom } from "nanostores";
import { PushSubscriptor } from "../common/push-subscriptor";

export class LogGroupMeta {
  constructor(
    readonly ctx: AppContext,
    readonly logStreamManifestSchema: Model<ObjFromSchema<typeof LogStreamManifestSchema>>
  ) { }

  async listLogStreamManifests() {
    return await this.logStreamManifestSchema.runQuery(
      await this.logStreamManifestSchema.query()
    ) ?? [];
  }

  async getLogStreamManifestByName(logStreamName: string) {
    const records = await this.logStreamManifestSchema.runQuery(
      this.logStreamManifestSchema.query().where(q => q.equalTo('name', logStreamName))
    ) ?? [];

    return records.at(0) ?? null;
  }

  async updateLogStreamManifestByName(logStreamName: string, logStreamManifest: LogStreamManifest) {
    await this.logStreamManifestSchema.runMutate(
      this.logStreamManifestSchema.mutate().set(logStreamManifest).where(q => q.equalTo('name', logStreamName))
    )
  }

  async createLogStreamManifest(logStreamName: string) {
    await this.logStreamManifestSchema.runMutate(
      this.logStreamManifestSchema.mutate().set({ id: ulid(), name: logStreamName, createdAt: Date.now() })
    );
  }

  static async selectLogGroupMeta(ctx: AppContext, logGroup: ObjFromSchema<typeof LogGroupSchema>) {
    const conn = await ctx.getSubConnection(`${logGroup.name}/meta`);
    return new LogGroupMeta(
      ctx,
      await Model.create('log-stream-manifest', LogStreamManifestSchema, conn)
    );
  }
}
