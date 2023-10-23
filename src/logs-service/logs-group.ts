import { ulid } from "ulid"
import { AppContext } from "../app/app-context"
import { LogGroupMeta } from "./log-group-meta"

export class LogGroup {
  #unsubs = new Set<() => Promise<void>>()

  constructor(readonly ctx: AppContext, readonly name: string, readonly logGroupMeta: LogGroupMeta) { }

  async [Symbol.asyncDispose]() {
    for (const unsub of this.#unsubs) {
      await unsub()
    }
  }

  static async getLogGroup(ctx: AppContext, logGroupName: string) {
    const logGroups = ctx.models.logGroups
    const [logGroup] = await logGroups.runQuery(
      logGroups.query().where(q => q.equalTo('name', logGroupName))
    ) ?? []

    if (!logGroup) return null

    const logGroupMeta = await LogGroupMeta.selectLogGroupMeta(ctx, logGroup)

    return new LogGroup(ctx, logGroupName, logGroupMeta)
  }

  static async createLogGroup(ctx: AppContext, logGroupName: string) {
    const logGroup = await this.getLogGroup(ctx, logGroupName)

    if (logGroup) throw new Error(`Already exists group`)

    await ctx.models.logGroups.runMutate(
      ctx.models.logGroups.mutate().set({ id: ulid(), name: logGroupName, createdAt: Date.now() })
    )
  }

  static async listLogGroups(ctx: AppContext) {
    return await ctx.models.logGroups.runQuery(
      ctx.models.logGroups.query()
    ) ?? []
  }
}
